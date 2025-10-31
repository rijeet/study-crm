"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function HomePage() {
	const router = useRouter();
	const { accessToken } = useAuth();

	useEffect(() => {
		if (accessToken) {
			router.replace("/dashboard");
		} else {
			router.replace("/login");
		}
	}, [accessToken, router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-gray-500">Redirecting...</div>
		</div>
	);
}
