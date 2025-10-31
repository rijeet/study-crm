import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).optional(),
	role: z.string().optional(),
	phone: z.string().optional(),
	branchId: z.string().optional(),
	isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await User.findById(id).select("firstName lastName email role phone isActive");
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const $set: any = { ...parsed.data };
	if ($set.password) {
		$set.passwordHash = await bcrypt.hash($set.password, 12);
		delete $set.password;
	}
	const { id } = await context.params;
	const updated = await User.findByIdAndUpdate(id, { $set }, { new: true });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const { id } = await context.params;
	await User.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}


