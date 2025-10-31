"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { accessToken } = useAuth();

	useEffect(() => {
		if (!accessToken) {
			router.replace("/login");
		}
	}, [accessToken, router]);

	if (!accessToken) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">Redirecting to login...</div>
			</div>
		);
	}

	return <>{children}</>;
}

