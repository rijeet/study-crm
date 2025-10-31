import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/context";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Country } from "@/models/Location";
import { Program } from "@/models/Academic";
import { University } from "@/models/University";
import { Lead } from "@/models/Lead";
import { ServiceCharge, SecurityDeposit } from "@/models/Account";

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

	// today range
	const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
	const endOfToday = new Date(); endOfToday.setHours(23,59,59,999);

	// KPI aggregates
	const [leadsTotal, serviceChargeToday, serviceChargePending, securityDepositToday, securityDepositPending] = await Promise.all([
		Lead.countDocuments({}),
		ServiceCharge.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
		ServiceCharge.countDocuments({ status: "pending" }),
		SecurityDeposit.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
		SecurityDeposit.countDocuments({ status: "pending" }),
	]);

	// last 6 months buckets (including current month)
	const now = new Date();
	const monthStarts: Date[] = [];
	for (let i = 5; i >= 0; i--) {
		const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
		monthStarts.push(d);
	}
	const monthEnds: Date[] = monthStarts.map((d, idx) => idx < monthStarts.length - 1
		? new Date(Date.UTC(monthStarts[idx + 1].getUTCFullYear(), monthStarts[idx + 1].getUTCMonth(), 1))
		: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
	);

	// Aggregate leads created per month
	const leadsByMonth = await Lead.aggregate([
		{ $match: { createdAt: { $gte: monthStarts[0], $lt: monthEnds[monthEnds.length - 1] } } },
		{ $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
	]);

	// Aggregate application/enrollment from statusHistory entries if present
	const statusesAgg = await Lead.aggregate([
		{ $match: { statusHistory: { $exists: true, $not: { $size: 0 } } } },
		{ $unwind: "$statusHistory" },
		{ $match: { "statusHistory.at": { $gte: monthStarts[0], $lt: monthEnds[monthEnds.length - 1] }, "statusHistory.status": { $in: ["application","enrolled","enrollment"] } } },
		{ $group: { _id: { y: { $year: "$statusHistory.at" }, m: { $month: "$statusHistory.at" }, s: "$statusHistory.status" }, count: { $sum: 1 } } },
	]);

	// today application/enrollment counts
	const todayAgg = await Lead.aggregate([
		{ $match: { statusHistory: { $exists: true, $not: { $size: 0 } } } },
		{ $unwind: "$statusHistory" },
		{ $match: { "statusHistory.at": { $gte: startOfToday, $lte: endOfToday } } },
		{ $group: { _id: "$statusHistory.status", count: { $sum: 1 } } },
	]);
	let applicationsToday = 0; let enrollmentsToday = 0;
	for (const r of todayAgg) {
		const s = String(r._id || "").toLowerCase();
		if (s.startsWith("app")) applicationsToday += r.count;
		if (s.startsWith("enrol")) enrollmentsToday += r.count;
	}

	function ymKey(d: Date) { return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}`; }
	const leadsMap = new Map<string, number>();
	for (const r of leadsByMonth) leadsMap.set(`${r._id.y}-${r._id.m}`, r.count);
	const appMap = new Map<string, number>();
	const enrMap = new Map<string, number>();
	for (const r of statusesAgg) {
		const key = `${r._id.y}-${r._id.m}`;
		if ((r._id.s as string).toLowerCase().startsWith("app")) appMap.set(key, (appMap.get(key) || 0) + r.count);
		if ((r._id.s as string).toLowerCase().startsWith("enrol")) enrMap.set(key, (enrMap.get(key) || 0) + r.count);
	}

	const months = monthStarts.map((d) => new Intl.DateTimeFormat("en", { month: "short" }).format(d) + " " + String(d.getUTCDate()).padStart(2, "0"));
	const series = {
		leads: monthStarts.map((d) => leadsMap.get(ymKey(d)) || 0),
		applications: monthStarts.map((d) => appMap.get(ymKey(d)) || 0),
		enrollments: monthStarts.map((d) => enrMap.get(ymKey(d)) || 0),
	};

	// Consultant Activity: latest status counts, scoped by role
	const scopeFilter: any = {};
	if (auth.role === "BranchManager") {
		const bm = await User.findById(auth.userId).select({ branchId: 1 });
		if (bm?.branchId) scopeFilter.currentBranchId = bm.branchId;
	} else if (auth.role === "Consultant") {
		scopeFilter.currentConsultantUserId = auth.userId;
	}
	const activityAgg = await Lead.aggregate([
		{ $match: scopeFilter },
		{ $project: { statusHistory: 1 } },
		{ $match: { statusHistory: { $exists: true, $ne: [] } } },
		{ $project: { latest: { $arrayElemAt: ["$statusHistory", -1] } } },
		{ $group: { _id: "$latest.status", count: { $sum: 1 } } },
		{ $project: { _id: 0, label: "$_id", count: 1 } },
		{ $sort: { count: -1 } },
	]);

	// Application Activity: latest application-stage status per lead
	const APP_STAGES = [
		"Pending",
		"Ready to Apply",
		"Waiting for Document",
		"Submitted to the Portal",
		"Submitted to the University / Applied",
		"Conditional Offer Letter",
		"Unconditional Offer Letter",
		"Rejected",
		"Canceled",
	];
	const appActivityAgg = await Lead.aggregate([
		{ $match: scopeFilter },
		{ $project: { statusHistory: 1 } },
		{ $match: { statusHistory: { $exists: true, $ne: [] } } },
		{ $project: {
				appOnly: {
					$filter: {
						input: "$statusHistory",
						as: "s",
						cond: { $in: ["$$s.status", APP_STAGES] }
					}
				}
			}
		},
		{ $project: { latest: { $arrayElemAt: ["$appOnly", -1] } } },
		{ $match: { latest: { $ne: null } } },
		{ $group: { _id: "$latest.status", count: { $sum: 1 } } },
		{ $project: { _id: 0, label: "$_id", count: 1 } },
	]);
	// Normalize to ordered list with zeros
	const appActivityMap = new Map<string, number>();
	for (const r of appActivityAgg) appActivityMap.set(String(r.label), Number(r.count));
	const applicationActivity = APP_STAGES.map((label) => ({ label, count: appActivityMap.get(label) || 0 }));
	return NextResponse.json({
		kpis: {
			users,
			countries,
			programs,
			universities,
			leadsTotal,
			applicationsToday,
			enrollmentsToday,
			serviceChargeToday,
			serviceChargePending,
			securityDepositToday,
			securityDepositPending,
		},
        recent: [],
        timeseries: { months, ...series },
		consultantActivity: activityAgg,
		applicationActivity,
	});
}


