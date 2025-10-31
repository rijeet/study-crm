import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SecurityDeposit } from "@/models/Account";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({
	mentorId: z.string().optional(),
	studentName: z.string().optional(),
	paymentType: z.string().optional(),
	depositType: z.string().optional(),
	depositDate: z.string().optional(),
	receivedDate: z.string().optional(),
	note: z.string().optional(),
	amount: z.number().optional(),
	status: z.string().optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await SecurityDeposit.findById(id);
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const { id } = await context.params;
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const $set: any = { ...parsed.data };
	if ($set.depositDate) $set.depositDate = new Date($set.depositDate);
	if ($set.receivedDate) $set.receivedDate = new Date($set.receivedDate);
	const updated = await SecurityDeposit.findByIdAndUpdate(id, { $set }, { new: true });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const { id } = await context.params;
	await connectToDatabase();
	await SecurityDeposit.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}


