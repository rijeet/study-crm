import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { RefreshToken } from "@/models/RefreshToken";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { authLimiter } from "@/lib/rateLimit";
import { resolveUserPermissions } from "@/lib/auth/resolve-permissions";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export async function POST(req: Request) {
	try { await authLimiter("auth:login"); } catch { return NextResponse.json({ error: "Too many requests" }, { status: 429 }); }
	const body = await req.json();
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}
	const { email, password } = parsed.data;

	await connectToDatabase();
	const user = await User.findOne({ email, isActive: true });
	if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

	// Resolve effective permissions: role permissions + user permissions
	const effectivePermissions = await resolveUserPermissions(user._id);

	const accessToken = signAccessToken({ sub: String(user._id), role: user.role, permissions: effectivePermissions });
	const jti = crypto.randomUUID();
	const refreshToken = signRefreshToken({ sub: String(user._id), jti });
	const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	await RefreshToken.create({ userId: user._id, tokenHash, expiresAt, invalidated: false });

	const res = NextResponse.json({ accessToken });
	res.cookies.set("refresh_token", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/",
		expires: expiresAt,
	});
	return res;
}


