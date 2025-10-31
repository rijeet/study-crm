import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { requirePermission } from "@/lib/auth/require";

const createSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.string().min(2),
	phone: z.string().optional(),
	branchId: z.string().optional(),
	isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	await connectToDatabase();
	const items = await User.find({}).select("firstName lastName email role phone isActive").sort({ createdAt: -1 });
	return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["users:manage"]);
	if (gate) return gate;
	const body = await req.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
	await connectToDatabase();
	const exists = await User.findOne({ email: parsed.data.email });
	if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
	const passwordHash = await bcrypt.hash(parsed.data.password, 12);
	const created = await User.create({
		firstName: parsed.data.firstName,
		lastName: parsed.data.lastName,
		email: parsed.data.email,
		passwordHash,
		role: parsed.data.role,
		phone: parsed.data.phone,
		branchId: parsed.data.branchId,
		isActive: parsed.data.isActive ?? true,
	});
	return NextResponse.json({ item: created }, { status: 201 });
}


