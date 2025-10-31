import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requirePermission } from "@/lib/auth/require";
import { Lead } from "@/models/Lead";
import { LeadAllocation } from "@/models/LeadAllocation";
import { Notification } from "@/models/Notification";
import { getAuthUser } from "@/lib/auth/context";
import { User } from "@/models/User";

const schema = z.object({ consultantUserId: z.string() });

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["allocation:to_consultant"]);
	if (gate) return gate;
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const lead = await Lead.findById(id);
	if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

	// If caller is BM, enforce same-branch consultant
	if (auth.role === "BranchManager") {
		const [bmUser, consultant] = await Promise.all([
			User.findById(auth.userId),
			User.findById(parsed.data.consultantUserId),
		]);
		if (!bmUser || !consultant) return NextResponse.json({ error: "Invalid users" }, { status: 400 });
		if (!bmUser.branchId || String(bmUser.branchId) !== String(consultant.branchId)) {
			return NextResponse.json({ error: "Consultant must be in the same branch" }, { status: 403 });
		}
	}

	lead.currentConsultantUserId = parsed.data.consultantUserId as any;
	lead.statusHistory.push({ status: "allocated_consultant", at: new Date(), by: auth.userId as any });
	await lead.save();

	await LeadAllocation.create({
		leadId: lead._id as any,
		fromUserId: auth.userId as any,
		fromRole: auth.role,
		toUserId: parsed.data.consultantUserId as any,
		toRole: "Consultant",
	});
	await Notification.create({
		recipientUserId: parsed.data.consultantUserId as any,
		type: "lead_assigned_bm_to_consultant",
		payload: { leadId: lead._id, byUserId: auth.userId },
	});
	return NextResponse.json({ item: lead });
}


