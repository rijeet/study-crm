import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SecurityDeposit } from "@/models/Account";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	mentorId: z.string(),
	studentName: z.string(),
	paymentType: z.string().optional(),
	depositType: z.string().optional(),
	depositDate: z.string().optional(),
	receivedDate: z.string().optional(),
	note: z.string().optional(),
	amount: z.number(),
	status: z.string().optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["reports:read"]);
	if (gate) return gate;
	await connectToDatabase();
	const items = await SecurityDeposit.find({}).sort({ createdAt: -1 }).limit(200);
	return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await SecurityDeposit.create({
		...parsed.data,
		depositDate: parsed.data.depositDate ? new Date(parsed.data.depositDate) : null,
		receivedDate: parsed.data.receivedDate ? new Date(parsed.data.receivedDate) : null,
	});
	return NextResponse.json({ item: created }, { status: 201 });
}


