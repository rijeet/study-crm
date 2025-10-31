import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ServiceCharge } from "@/models/Account";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	mentorId: z.string(),
	studentName: z.string(),
	country: z.string().optional(),
	university: z.string().optional(),
	paymentType: z.string().optional(),
	paymentDate: z.string().optional(),
	receivedDate: z.string().optional(),
	amount: z.number(),
	status: z.string().optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["reports:read"]);
	if (gate) return gate;
	await connectToDatabase();
	const items = await ServiceCharge.find({}).sort({ createdAt: -1 }).limit(200);
	return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await ServiceCharge.create({
		...parsed.data,
		paymentDate: parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : null,
		receivedDate: parsed.data.receivedDate ? new Date(parsed.data.receivedDate) : null,
	});
	return NextResponse.json({ item: created }, { status: 201 });
}


