"use client";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LoginPage() {
	const router = useRouter();
	const { accessToken, setAccessToken } = useAuth();
	const [email, setEmail] = useState("admin@studycrm.local");
	const [password, setPassword] = useState("Admin@123456");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (accessToken) {
			router.replace("/dashboard");
		}
	}, [accessToken, router]);

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
			let data;
			const contentType = res.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				data = await res.json();
			} else {
				const text = await res.text();
				throw new Error(`Server error: ${res.status} ${res.statusText}`);
			}
			if (!res.ok) {
				throw new Error(data?.error || "Login failed");
			}
			if (!data.accessToken) {
				throw new Error("No access token received");
			}
			setAccessToken(data.accessToken);
			router.replace("/dashboard");
		} catch (err: any) {
			setError(err.message || "Login failed. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
						<span className="text-white text-2xl font-bold">SC</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">StudyCRM</h1>
					<p className="text-gray-600 mt-2">Study Abroad CRM System</p>
				</div>
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
					<h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
					<form onSubmit={onSubmit} className="space-y-5">
						<label className="block">
							<div className="text-sm font-medium text-gray-700 mb-2">Email</div>
							<input
								type="email"
								className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
								placeholder="Enter your email"
							/>
						</label>
						<label className="block">
							<div className="text-sm font-medium text-gray-700 mb-2">Password</div>
							<input
								type="password"
								className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
								placeholder="Enter your password"
							/>
						</label>
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
								{error}
							</div>
						)}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</form>
					<p className="text-xs text-center text-gray-500">On success, you will be redirected to Dashboard.</p>
				</div>
			</div>
		</div>
	);
}
