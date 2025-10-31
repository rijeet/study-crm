import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requirePermission } from "@/lib/auth/require";
import { Lead } from "@/models/Lead";
import { LeadAllocation } from "@/models/LeadAllocation";
import { Notification } from "@/models/Notification";
import { getAuthUser } from "@/lib/auth/context";

const schema = z.object({ branchId: z.string(), bmUserId: z.string() });

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["allocation:to_bm"]);
	if (gate) return gate;
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const updated = await Lead.findByIdAndUpdate(
		id,
		{
			$set: {
				currentBranchId: parsed.data.branchId,
				currentBmUserId: parsed.data.bmUserId,
			},
			$push: { statusHistory: { status: "allocated_bm", at: new Date(), by: auth.userId } },
		},
		{ new: true }
	);
	if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
	await LeadAllocation.create({
		leadId: updated._id as any,
		fromUserId: auth.userId as any,
		fromRole: auth.role,
		toUserId: parsed.data.bmUserId as any,
		toRole: "BranchManager",
	});
	await Notification.create({
		recipientUserId: parsed.data.bmUserId as any,
		type: "lead_assigned_dm_to_bm",
		payload: { leadId: updated._id, byUserId: auth.userId },
	});
	return NextResponse.json({ item: updated });
}


