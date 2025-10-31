import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { StatusGroup } from "@/models/Status";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	status: z.string().optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["leads:read", "leads:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const items = await StatusGroup.find({}).sort({ name: 1 });
	return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["leads:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await StatusGroup.create({ ...parsed.data, status: parsed.data.status || "active" });
	return NextResponse.json({ item: created }, { status: 201 });
}

