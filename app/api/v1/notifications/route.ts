import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/context";
import { Notification } from "@/models/Notification";

export async function GET(req: NextRequest) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	await connectToDatabase();
	const items = await Notification.find({ recipientUserId: auth.userId }).sort({ createdAt: -1 }).limit(100);
	return NextResponse.json({ items });
}


