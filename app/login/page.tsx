"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LoginPage() {
	const router = useRouter();
	const { setAccessToken } = useAuth();
	const [email, setEmail] = useState("admin@studycrm.local");
	const [password, setPassword] = useState("Admin@123456");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Login failed");
			setAccessToken(data.accessToken);
			router.replace("/dashboard");
		} catch (err: any) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-[70vh] flex items-center justify-center p-6">
			<form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-lg p-6 shadow-sm">
				<h1 className="text-xl font-semibold">Sign in</h1>
				<label className="block">
					<div className="text-sm text-gray-600 mb-1">Email</div>
					<input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
				</label>
				<label className="block">
					<div className="text-sm text-gray-600 mb-1">Password</div>
					<input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
				</label>
				{error && <div className="text-sm text-red-600">{error}</div>}
				<button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-60">
					{loading ? "Signing in..." : "Sign in"}
				</button>
				<p className="text-xs text-gray-500">On success, you will be redirected to Dashboard.</p>
			</form>
		</main>
	);
}


