import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";

describe("JWT", () => {
	it("signs and verifies access token", () => {
		process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test_secret";
		const token = signAccessToken({ sub: "123", role: "Admin", permissions: ["*"] });
		const payload = verifyAccessToken(token);
		expect(payload.sub).toBe("123");
	});
});


