import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { City } from "@/models/Location";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({ countryId: z.string(), stateId: z.string(), name: z.string().min(2), zip: z.string().optional(), status: z.string().optional() });

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["locations:view", "locations:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const list = await City.find({}).sort({ name: 1 });
	return NextResponse.json({ items: list });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["locations:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await City.create({ ...parsed.data, status: parsed.data.status || "active" });
	return NextResponse.json({ item: created }, { status: 201 });
}


