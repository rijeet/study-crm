import jwt from "jsonwebtoken";

type JwtPayloadBase = { sub: string; role: string; permissions?: string[] };

export function signAccessToken(payload: JwtPayloadBase) {
	const secret = process.env.JWT_ACCESS_SECRET as string;
	const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
	if (!secret) throw new Error("JWT_ACCESS_SECRET not set");
	return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken<T extends object = JwtPayloadBase>(token: string) {
	const secret = process.env.JWT_ACCESS_SECRET as string;
	if (!secret) throw new Error("JWT_ACCESS_SECRET not set");
	return jwt.verify(token, secret) as T & JwtPayloadBase;
}

export function signRefreshToken(payload: { sub: string; jti: string }) {
	const secret = process.env.JWT_REFRESH_SECRET as string;
	const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";
	if (!secret) throw new Error("JWT_REFRESH_SECRET not set");
	return jwt.sign(payload, secret, { expiresIn });
}

export function verifyRefreshToken<T extends object = { sub: string; jti: string }>(token: string) {
	const secret = process.env.JWT_REFRESH_SECRET as string;
	if (!secret) throw new Error("JWT_REFRESH_SECRET not set");
	return jwt.verify(token, secret) as T;
}


