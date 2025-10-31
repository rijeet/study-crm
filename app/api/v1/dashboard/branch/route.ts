import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/context";
import { User } from "@/models/User";
import { Lead } from "@/models/Lead";

export async function GET(req: NextRequest) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (auth.role !== "BranchManager" && auth.role !== "Admin" && auth.role !== "DatabaseManager") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	await connectToDatabase();
	const bm = await User.findById(auth.userId).select({ branchId: 1 });
	if (!bm?.branchId) return NextResponse.json({ kpis: {}, funnel: {}, workloads: [] });
	const branchFilter = { currentBranchId: bm.branchId } as any;
	const [total, byStatus, workloads] = await Promise.all([
		Lead.countDocuments(branchFilter),
		Lead.aggregate([
			{ $match: branchFilter },
			{ $unwind: "$statusHistory" },
			{ $group: { _id: "$statusHistory.status", count: { $sum: 1 } } },
		]),
		Lead.aggregate([
			{ $match: branchFilter },
			{ $group: { _id: "$currentConsultantUserId", count: { $sum: 1 } } },
		]),
	]);
	return NextResponse.json({ kpis: { total }, funnel: byStatus, workloads });
}


