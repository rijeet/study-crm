import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/context";
import { Lead } from "@/models/Lead";

export async function GET(req: NextRequest) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (auth.role !== "Consultant" && auth.role !== "Admin" && auth.role !== "DatabaseManager") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	await connectToDatabase();
	const myFilter = { currentConsultantUserId: auth.userId } as any;
	const [total, byStatus] = await Promise.all([
		Lead.countDocuments(myFilter),
		Lead.aggregate([
			{ $match: myFilter },
			{ $unwind: "$statusHistory" },
			{ $group: { _id: "$statusHistory.status", count: { $sum: 1 } } },
		]),
	]);
	return NextResponse.json({ kpis: { total }, funnel: byStatus });
}


