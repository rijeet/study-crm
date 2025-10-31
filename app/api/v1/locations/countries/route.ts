import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Country } from "@/models/Location";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({ name: z.string().min(2), code: z.string().min(2).max(3), phoneCode: z.string().min(1), status: z.string().optional() });

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["locations:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const { searchParams } = new URL(req.url);
	const page = Math.max(1, Number(searchParams.get("page") || 1));
	const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 10)));
	const q = (searchParams.get("q") || "").trim();
	const status = searchParams.get("status") || undefined;

	const filter: any = {};
	if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { code: { $regex: q, $options: "i" } }, { phoneCode: { $regex: q, $options: "i" } }];
	if (status) filter.status = status;
	const total = await Country.countDocuments(filter);
	const list = await Country.find(filter)
		.sort({ name: 1 })
		.skip((page - 1) * limit)
		.limit(limit);
	return NextResponse.json({ items: list, page, limit, total });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["locations:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await Country.create({ ...parsed.data, status: parsed.data.status || "active" });
	return NextResponse.json({ item: created }, { status: 201 });
}


