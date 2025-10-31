import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/context";
import { hasPermission } from "@/lib/auth/permissions";

export function requirePermission(req: NextRequest, perm: string | string[]) {
	const auth = getAuthUser(req);
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (!hasPermission(auth.permissions, perm)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	return null;
}


