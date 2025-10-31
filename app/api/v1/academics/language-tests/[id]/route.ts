import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LanguageTest } from "@/models/Academic";
import { requirePermission } from "@/lib/auth/require";

const updateSchema = z.object({ name: z.string().optional(), shortName: z.string().optional(), status: z.string().optional() });

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectToDatabase();
	const item = await LanguageTest.findById(id);
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["languagetests:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const { id } = await context.params;
	const updated = await LanguageTest.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
	return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const gate = requirePermission(req, ["languagetests:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const { id } = await context.params;
	await LanguageTest.findByIdAndDelete(id);
	return NextResponse.json({ ok: true });
}


