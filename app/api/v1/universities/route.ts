import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { University } from "@/models/University";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	countryId: z.string(),
	name: z.string().min(2),
	applicationFees: z.any().optional(),
	initialDeposit: z.any().optional(),
	ranking: z.any().optional(),
	internshipAvailable: z.any().optional(),
	bridgingProgram: z.any().optional(),
	scholarship: z.any().optional(),
	currency: z.string().optional(),
	symbol: z.string().optional(),
	status: z.string().optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["universities:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const list = await University.find({}).sort({ name: 1 });
	return NextResponse.json({ items: list });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["universities:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await University.create({ ...parsed.data, status: parsed.data.status || "active" });
	return NextResponse.json({ item: created }, { status: 201 });
}


