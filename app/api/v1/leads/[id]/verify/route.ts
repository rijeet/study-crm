import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requirePermission } from "@/lib/auth/require";
import { Lead } from "@/models/Lead";
import { Notification } from "@/models/Notification";
import { getAuthUser } from "@/lib/auth/context";

const schema = z.object({ note: z.string().optional() });

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:update"]);
	if (gate) return gate;
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (auth.role !== "Consultant" && auth.role !== "Admin" && auth.role !== "DatabaseManager") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const lead = await Lead.findById(id);
	if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
	// If consultant, ensure assigned
	if (auth.role === "Consultant" && String(lead.currentConsultantUserId || "") !== String(auth.userId)) {
		return NextResponse.json({ error: "Not assigned" }, { status: 403 });
	}
	lead.statusHistory.push({ status: "verified", at: new Date(), by: auth.userId as any, note: parsed.data.note });
	await lead.save();
	// notify Admin and DM (broadcast; client can filter by role later if needed)
	await Notification.create({ recipientUserId: lead.currentBmUserId as any, type: "lead_verified", payload: { leadId: lead._id, byUserId: auth.userId } });
	return NextResponse.json({ item: lead });
}


