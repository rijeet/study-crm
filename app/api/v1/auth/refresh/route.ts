import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { RefreshToken } from "@/models/RefreshToken";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { authLimiter } from "@/lib/rateLimit";
import { resolveUserPermissions } from "@/lib/auth/resolve-permissions";

export async function POST(req: NextRequest) {
	try { await authLimiter("auth:refresh", 20); } catch { return NextResponse.json({ error: "Too many requests" }, { status: 429 }); }
	const token = req.cookies.get("refresh_token")?.value;
	if (!token) return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });

	await connectToDatabase();

	let decoded: { sub: string; jti: string };
	try {
		decoded = verifyRefreshToken(token);
	} catch {
		return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
	}

	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
	const stored = await RefreshToken.findOne({ tokenHash, invalidated: false });
	if (!stored) {
		// Token reuse or invalid
		await RefreshToken.updateMany({ userId: decoded.sub }, { $set: { invalidated: true } });
		return NextResponse.json({ error: "Token reuse detected" }, { status: 401 });
	}

	const user = await User.findById(stored.userId);
	if (!user || !user.isActive) return NextResponse.json({ error: "User not found" }, { status: 401 });

	// Rotate
	await RefreshToken.deleteOne({ _id: stored._id });
	const newJti = crypto.randomUUID();
	const newRefreshToken = signRefreshToken({ sub: String(user._id), jti: newJti });
	const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	await RefreshToken.create({ userId: user._id, tokenHash: newHash, expiresAt, invalidated: false });

	// Resolve effective permissions: role permissions + user permissions
	const effectivePermissions = await resolveUserPermissions(user._id);

	const accessToken = signAccessToken({ sub: String(user._id), role: user.role, permissions: effectivePermissions });
	const res = NextResponse.json({ accessToken });
	res.cookies.set("refresh_token", newRefreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/",
		expires: expiresAt,
	});
	return res;
}


