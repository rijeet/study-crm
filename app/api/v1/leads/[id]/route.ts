import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { requirePermission } from "@/lib/auth/require";
import { getAuthUser } from "@/lib/auth/context";
import { User } from "@/models/User";

const updateSchema = z.object({
	name: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	status: z.string().optional(),
	note: z.string().optional(),
	reference: z.string().optional(),
	destinationCountryId: z.string().nullable().optional(),
	stateId: z.string().nullable().optional(),
	cityId: z.string().nullable().optional(),
	programId: z.string().nullable().optional(),
	intake: z.string().nullable().optional(),
	langTestId: z.string().nullable().optional(),
	financialSituation: z.string().nullable().optional(),
	situation: z.string().nullable().optional(),
	appointmentAt: z.string().nullable().optional(),
	remarks: z.string().nullable().optional(),
	academicDetails: z.any().optional(),
	juniorConsultantId: z.string().nullable().optional(),
	juniorReceivedAt: z.string().nullable().optional(),
	seniorConsultantId: z.string().nullable().optional(),
	seniorReceivedAt: z.string().nullable().optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await Lead.findById(id);
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	// scope check
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (auth.role === "Admin" || auth.role === "DatabaseManager") {
		return NextResponse.json({ item });
	}
	if (auth.role === "BranchManager") {
		const bm = await User.findById(auth.userId).select({ branchId: 1 });
		if (bm?.branchId && String(item.currentBranchId || "") === String(bm.branchId)) {
			return NextResponse.json({ item });
		}
	}
	if (auth.role === "Consultant") {
		if (String(item.currentConsultantUserId || "") === String(auth.userId)) {
			return NextResponse.json({ item });
		}
	}
	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:update"]);
	if (gate) return gate;
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const lead = await Lead.findById(id);
	if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
	// field-level masks and scoping
	const requested = parsed.data as Record<string, unknown>;
	const allowed: Record<string, boolean> = {};
	const allow = (k: string) => { allowed[k] = true; };
	if (auth.role === "Admin" || auth.role === "DatabaseManager") {
		Object.keys(requested).forEach(allow);
	} else if (auth.role === "BranchManager") {
		// must be same branch
		const bm = await User.findById(auth.userId).select({ branchId: 1 });
		if (!bm?.branchId || String(lead.currentBranchId || "") !== String(bm.branchId)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
		["remarks","note"].forEach(allow);
	} else if (auth.role === "Consultant") {
		if (String(lead.currentConsultantUserId || "") !== String(auth.userId)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
		["phone","email","situation","financialSituation","academicDetails","remarks"].forEach(allow);
	} else if (auth.role === "DataEntry") {
		["destinationCountryId","programId","intake","name","phone","email"].forEach(allow);
	} else {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	// build $set from allowed fields only
	const $set: any = {};
	for (const [k, v] of Object.entries(requested)) {
		if (allowed[k]) $set[k] = v;
	}
	if ($set.status) {
		await Lead.updateOne({ _id: id }, { $push: { statusHistory: { status: $set.status, at: new Date(), by: auth.userId as any } } });
		delete $set.status;
	}
	if ($set.appointmentAt !== undefined) {
		$set.appointmentAt = $set.appointmentAt ? new Date($set.appointmentAt as string) : null;
	}
	if ($set.juniorReceivedAt !== undefined) {
		$set.juniorReceivedAt = $set.juniorReceivedAt ? new Date($set.juniorReceivedAt as string) : null;
	}
	if ($set.seniorReceivedAt !== undefined) {
		$set.seniorReceivedAt = $set.seniorReceivedAt ? new Date($set.seniorReceivedAt as string) : null;
	}
	// Handle null values for optional fields
	const nullifyIfEmpty = (fields: string[]) => {
		fields.forEach(f => {
			if ($set[f] === "" || $set[f] === undefined) {
				$set[f] = null;
			}
		});
	};
	nullifyIfEmpty(["destinationCountryId", "stateId", "cityId", "programId", "intake", "langTestId", "financialSituation", "situation", "juniorConsultantId", "seniorConsultantId"]);
	const updated = await Lead.findByIdAndUpdate(id, { $set }, { new: true });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:delete"]);
	if (gate) return gate;
	await connectToDatabase();
	const { id } = await context.params;
	await Lead.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}


