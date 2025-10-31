import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { RefreshToken } from "@/models/RefreshToken";

export async function POST(req: NextRequest) {
	const token = req.cookies.get("refresh_token")?.value;
	await connectToDatabase();
	if (token) {
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		await RefreshToken.updateOne({ tokenHash }, { $set: { invalidated: true } });
	}
	const res = NextResponse.json({ ok: true });
	res.cookies.set("refresh_token", "", { httpOnly: true, secure: true, path: "/", expires: new Date(0) });
	return res;
}


