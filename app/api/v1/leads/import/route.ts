import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import type { FilterQuery } from "mongoose";
import { requirePermission } from "@/lib/auth/require";

export async function POST(req: NextRequest) {
	const gate = requirePermission(req, ["leads:create"]);
	if (gate) return gate;
	await connectToDatabase();
	const form = await req.formData();
	const file = form.get("file");
	if (!file || typeof file === "string") return NextResponse.json({ error: "Missing file" }, { status: 400 });
	const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
	// Expect header: name,phone,email,destinationCountryId,programId
	const header = lines.shift()?.split(",").map(h=>h.trim().toLowerCase()) || [];
	const idx = (k: string) => header.indexOf(k);
	const created: any[] = [];
	const duplicates: any[] = [];
	for (const line of lines) {
		const cols = line.split(",");
		const row: any = {
			name: cols[idx("name")]?.trim(),
			phone: cols[idx("phone")]?.trim(),
			email: cols[idx("email")]?.trim(),
			destinationCountryId: cols[idx("destinationcountryid")]?.trim() || undefined,
			programId: cols[idx("programid")]?.trim() || undefined,
		};
        if (!row.name) continue;
        const orFilters: FilterQuery<typeof Lead>[] = [] as any;
        if (row.email) orFilters.push({ email: row.email } as any);
        if (row.phone) orFilters.push({ phone: row.phone } as any);
        const dup = orFilters.length > 0 ? await Lead.findOne({ $or: orFilters as any }) : null;
		if (dup) { duplicates.push({ row, dupId: dup._id }); continue; }
		const studentId = String(Math.floor(10000000 + Math.random() * 90000000));
		const doc = await Lead.create({ ...row, studentId, statusHistory: [{ status: "new", at: new Date() }] });
		created.push(doc._id);
	}
	return NextResponse.json({ createdCount: created.length, duplicates });
}


