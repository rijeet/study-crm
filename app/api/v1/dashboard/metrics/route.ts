import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/context";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Country } from "@/models/Location";
import { Program } from "@/models/Academic";
import { University } from "@/models/University";

export async function GET(req: NextRequest) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	await connectToDatabase();
	const [users, countries, programs, universities] = await Promise.all([
		User.countDocuments({}),
		Country.countDocuments({}),
		Program.countDocuments({}),
		University.countDocuments({}),
	]);
	return NextResponse.json({
		kpis: {
			users,
			countries,
			programs,
			universities,
		},
		recent: [],
	});
}


