import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [process.env.NEXTAUTH_URL || "http://localhost:3000"]; // reuse var or set YOUR origin

export function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const origin = req.headers.get("origin") || "";
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		res.headers.set("Access-Control-Allow-Origin", origin);
		res.headers.set("Vary", "Origin");
	}
	res.headers.set("Access-Control-Allow-Credentials", "true");
	res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-CSRF-Token");
	res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

	// CSRF: double submit cookie for state-changing requests under /api/v1 (excluding auth and public registration endpoints)
	const isApi = req.nextUrl.pathname.startsWith("/api/v1");
	const isSafe = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
	const isAuth = req.nextUrl.pathname.startsWith("/api/v1/auth");
	const isPublicRegister = req.nextUrl.pathname === "/api/v1/leads/register";
	if (isApi && !isSafe && !isAuth && !isPublicRegister) {
		const tokenHeader = req.headers.get("x-csrf-token");
		const tokenCookie = req.cookies.get("csrf_token")?.value;
		if (!tokenHeader || !tokenCookie || tokenHeader !== tokenCookie) {
			return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
		}
	}

	// Ensure CSRF cookie exists
	if (!req.cookies.get("csrf_token")) {
		const csrf = cryptoRandomString();
		res.cookies.set("csrf_token", csrf, { httpOnly: false, sameSite: "lax", secure: true, path: "/" });
	}

	return res;
}

function cryptoRandomString() {
	// lightweight random
	return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export const config = {
	matcher: ["/api/:path*"],
};


