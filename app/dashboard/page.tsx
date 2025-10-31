"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function DashboardPage() {
	const { data } = useSWR("/api/v1/dashboard/metrics", fetcher);
	const kpis = data?.kpis || {};
	return (
		<main className="p-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="rounded-lg border p-4 hover:shadow-sm transition"><div className="text-sm text-gray-500">Users</div><div className="text-2xl font-bold">{kpis.users ?? "-"}</div></div>
				<div className="rounded-lg border p-4 hover:shadow-sm transition"><div className="text-sm text-gray-500">Countries</div><div className="text-2xl font-bold">{kpis.countries ?? "-"}</div></div>
				<div className="rounded-lg border p-4 hover:shadow-sm transition"><div className="text-sm text-gray-500">Programs</div><div className="text-2xl font-bold">{kpis.programs ?? "-"}</div></div>
				<div className="rounded-lg border p-4 hover:shadow-sm transition"><div className="text-sm text-gray-500">Universities</div><div className="text-2xl font-bold">{kpis.universities ?? "-"}</div></div>
			</div>
		</main>
	);
}


