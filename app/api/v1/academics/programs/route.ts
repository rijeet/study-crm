import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Program } from "@/models/Academic";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({ name: z.string().min(1), shortName: z.string().min(1), status: z.string().optional() });

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["programs:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const list = await Program.find({}).sort({ shortName: 1 });
	return NextResponse.json({ items: list });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["programs:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await Program.create({ ...parsed.data, status: parsed.data.status || "active" });
	return NextResponse.json({ item: created }, { status: 201 });
}


