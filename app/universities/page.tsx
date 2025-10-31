"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function UniversitiesPage() {
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data, mutate } = useSWR("/api/v1/universities", fetcher);
	const [form, setForm] = useState({ countryId: "", name: "" });
	const onCreate = async () => {
		await api.post("/api/v1/universities", form);
		setForm({ countryId: "", name: "" });
		mutate();
	};
	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Universities</h1>
						<p className="text-gray-500 mt-1">Manage university information</p>
					</div>
				</div>
				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New University</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<select value={form.countryId} onChange={(e)=>setForm({...form,countryId:e.target.value})}>
							<option value="">Select Country</option>
							{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
						</select>
						<input placeholder="University name *" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
						<button className="btn-primary" onClick={onCreate} disabled={!form.countryId || !form.name}>Add University</button>
					</div>
				</div>
				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th>Country</th>
								<th>University</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data?.items?.map((u:any)=>(
								<tr key={u._id}>
									<td>{countries?.items?.find((x:any)=>x._id===u.countryId)?.name || u.countryId}</td>
									<td className="font-medium">{u.name}</td>
									<td><span className={u.status === "active" ? "badge badge-success" : "badge badge-gray"}>{u.status || "active"}</span></td>
								</tr>
							))}
							{!data?.items?.length && (
								<tr>
									<td colSpan={3} className="text-center py-8 text-gray-500">No universities found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</ProtectedRoute>
	);
}
