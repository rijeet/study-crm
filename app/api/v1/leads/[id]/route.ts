import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({
	name: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	status: z.string().optional(),
	note: z.string().optional(),
	reference: z.string().optional(),
	destinationCountryId: z.string().optional(),
	programId: z.string().optional(),
	intake: z.string().optional(),
	langTestId: z.string().optional(),
	financialSituation: z.string().optional(),
	situation: z.string().optional(),
	appointmentAt: z.string().optional(),
	remarks: z.string().optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await Lead.findById(id);
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:update"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const $set: any = { ...parsed.data };
	if ($set.status) {
		const { id } = await context.params;
		await Lead.updateOne({ _id: id }, { $push: { statusHistory: { status: $set.status, at: new Date() } } });
		delete $set.status;
	}
	const { id } = await context.params;
	if ($set.appointmentAt) {
		$set.appointmentAt = new Date($set.appointmentAt);
	}
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


