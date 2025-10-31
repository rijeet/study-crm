import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Task } from "@/models/Task";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	assignorId: z.string(),
	executorId: z.string(),
	duration: z.string().optional(),
	description: z.string().min(1),
	status: z.enum(["pending","in_progress","done","cancelled"]).optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const items = await Task.find({}).sort({ createdAt: -1 }).limit(200);
	return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await Task.create(parsed.data);
	return NextResponse.json({ item: created }, { status: 201 });
}


