import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { requirePermission } from "@/lib/auth/require";
import { AuditLog } from "@/models/AuditLog";

const schema = z.object({ userId: z.string() });

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:update"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const updated = await Lead.findByIdAndUpdate(id, { $set: { assignedToUserId: parsed.data.userId } }, { new: true });
	await AuditLog.create({ action: "lead.assign", target: `Lead/${id}`, meta: { to: parsed.data.userId } });
	return NextResponse.json({ item: updated });
}


