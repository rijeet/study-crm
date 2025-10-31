import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Task } from "@/models/Task";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({
	assignorId: z.string().optional(),
	executorId: z.string().optional(),
	duration: z.string().optional(),
	description: z.string().optional(),
	status: z.enum(["pending","in_progress","done","cancelled"]).optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await Task.findById(id);
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
	const updated = await Task.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const { id } = await context.params;
	await connectToDatabase();
	await Task.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}


