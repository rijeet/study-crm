import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import type { FilterQuery } from "mongoose";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	name: z.string().min(1),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	reference: z.string().optional(),
	destinationCountryId: z.string().optional(),
	programId: z.string().optional(),
	intake: z.string().optional(),
	langTestId: z.string().optional(),
	financialSituation: z.string().optional(),
	situation: z.string().optional(),
	appointmentAt: z.string().optional(),
	remarks: z.string().optional(),
});

function generateStudentId() {
	return String(Math.floor(10000000 + Math.random() * 90000000));
}

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["leads:read"]);
	if (gate) return gate;
	await connectToDatabase();
	const { searchParams } = new URL(req.url);
	const page = Math.max(1, Number(searchParams.get("page") || 1));
	const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 20)));
	const q = (searchParams.get("q") || "").trim();
	const destinationCountryId = searchParams.get("destinationCountryId") || undefined;
	const programId = searchParams.get("programId") || undefined;

    const filter: FilterQuery<any> = {} as any;
	if (q) {
		filter.$or = [
			{ name: { $regex: q, $options: "i" } },
			{ email: { $regex: q, $options: "i" } },
			{ phone: { $regex: q, $options: "i" } },
		];
	}
	if (destinationCountryId) filter.destinationCountryId = destinationCountryId;
	if (programId) filter.programId = programId;

    const total = await Lead.countDocuments(filter as any);
    const items = await Lead.find(filter as any)
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit);
	return NextResponse.json({ items, page, limit, total });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["leads:create"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    await connectToDatabase();
    // duplicate detection by email/phone
    const orFilters: FilterQuery<any>[] = [] as any;
    if (parsed.data.email) orFilters.push({ email: parsed.data.email } as any);
    if (parsed.data.phone) orFilters.push({ phone: parsed.data.phone } as any);
    const dup = orFilters.length ? await Lead.findOne({ $or: orFilters as any }) : null;
	const created = await Lead.create({
		studentId: generateStudentId(),
		name: parsed.data.name,
		phone: parsed.data.phone,
		email: parsed.data.email,
		reference: parsed.data.reference,
		destinationCountryId: parsed.data.destinationCountryId,
		programId: parsed.data.programId,
		intake: parsed.data.intake,
		langTestId: parsed.data.langTestId,
		financialSituation: parsed.data.financialSituation,
		situation: parsed.data.situation,
		appointmentAt: parsed.data.appointmentAt ? new Date(parsed.data.appointmentAt) : null,
		remarks: parsed.data.remarks,
		statusHistory: [{ status: "new", at: new Date() }],
		duplicates: dup ? [dup._id] : [],
	});
	return NextResponse.json({ item: created }, { status: 201 });
}


