import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";

export function requireAuth(req: NextRequest) {
	const auth = req.headers.get("authorization");
	if (!auth || !auth.startsWith("Bearer ")) {
		return { ok: false as const, error: "Unauthorized" };
	}
	try {
		const token = auth.slice(7);
		const payload = verifyAccessToken(token);
		return { ok: true as const, payload };
	} catch {
		return { ok: false as const, error: "Invalid token" };
	}
}

export function hasPermission(userPerms: string[] | undefined, required: string | string[]) {
	if (!required) return true;
	const requiredList = Array.isArray(required) ? required : [required];
	const granted = new Set(userPerms || []);
	return requiredList.every((p) => granted.has(p) || granted.has("*") );
}


