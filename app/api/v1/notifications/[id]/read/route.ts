import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/context";
import { Notification } from "@/models/Notification";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	await connectToDatabase();
	const { id } = await context.params;
	await Notification.updateOne({ _id: id, recipientUserId: auth.userId }, { $set: { readAt: new Date() } });
	return NextResponse.json({ ok: true });
}


