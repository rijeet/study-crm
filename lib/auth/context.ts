import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export type AuthUser = { userId: string; role: string; permissions?: string[] };

export function getAuthUser(req: NextRequest): AuthUser | null {
	const auth = req.headers.get("authorization");
	if (!auth || !auth.startsWith("Bearer ")) return null;
	try {
		const token = auth.slice(7);
		const payload = verifyAccessToken(token);
		return { userId: String(payload.sub), role: (payload as any).role, permissions: (payload as any).permissions };
	} catch {
		return null;
	}
}


