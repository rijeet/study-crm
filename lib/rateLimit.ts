// Lightweight in-memory rate limiter per key
const store = new Map<string, { count: number; windowStart: number }>();

export async function authLimiter(key: string, max = 10, windowMs = 60_000) {
	const now = Date.now();
	const rec = store.get(key);
	if (!rec) {
		store.set(key, { count: 1, windowStart: now });
		return;
	}
	if (now - rec.windowStart > windowMs) {
		rec.windowStart = now;
		rec.count = 1;
		return;
	}
	rec.count += 1;
	if (rec.count > max) {
		throw new Error("rate_limit_exceeded");
	}
}


