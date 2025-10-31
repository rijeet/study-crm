import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/context";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	await connectToDatabase();
	const user = await User.findById(auth.userId).select("firstName lastName email role permissions");
	if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ user });
}


