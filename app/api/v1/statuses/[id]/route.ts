import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Status } from "@/models/Status";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({
	name: z.string().optional(),
	color: z.string().optional(),
	description: z.string().optional(),
	status: z.string().optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await Status.findById(id).populate("statusGroupId");
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const updated = await Status.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
	if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["leads:delete"]);
	if (gate) return gate;
	await connectToDatabase();
	const { id } = await context.params;
	await Status.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}

