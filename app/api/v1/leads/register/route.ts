import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";

const registerSchema = z.object({
	name: z.string().min(1),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	destinationCountryId: z.string().optional(),
	programId: z.string().optional(),
	intake: z.string().optional(),
});

function generateStudentId() {
	return String(Math.floor(10000000 + Math.random() * 90000000));
}

export async function POST(req: Request) {
	const body = await req.json();
	const parsed = registerSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const created = await Lead.create({
		studentId: generateStudentId(),
		name: parsed.data.name,
		phone: parsed.data.phone,
		email: parsed.data.email,
		destinationCountryId: parsed.data.destinationCountryId,
		programId: parsed.data.programId,
		intake: parsed.data.intake,
		immutableAfterRegistration: true,
		statusHistory: [{ status: "registered", at: new Date() }],
	});
	return NextResponse.json({ item: created }, { status: 201 });
}


