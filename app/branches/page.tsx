"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

function BranchesPage() {
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: states } = useSWR("/api/v1/locations/states", fetcher);
	const { data, mutate } = useSWR("/api/v1/branches", fetcher);
	const [form, setForm] = useState({ countryId: "", stateId: "", name: "", phone: "", email: "", address: "" });

	const statesByCountry = useMemo(() => {
		const map: Record<string, any[]> = {};
		for (const s of states?.items ?? []) {
			(map[s.countryId] = map[s.countryId] || []).push(s);
		}
		return map;
	}, [states]);

	const onCreate = async () => {
		await api.post("/api/v1/branches", { ...form, stateId: form.stateId || undefined });
		setForm({ countryId: "", stateId: "", name: "", phone: "", email: "", address: "" });
		mutate();
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Branches</h1>
						<p className="text-gray-500 mt-1">Manage branch locations</p>
					</div>
				</div>
				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Branch</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<select value={form.countryId} onChange={(e)=>setForm({...form,countryId:e.target.value,stateId:""})} required>
							<option value="">Select Country *</option>
							{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
						</select>
						<select value={form.stateId} onChange={(e)=>setForm({...form,stateId:e.target.value})} disabled={!form.countryId}>
							<option value="">Select State (Optional)</option>
							{(statesByCountry[form.countryId]||[]).map((s:any)=>(<option key={s._id} value={s._id}>{s.name}</option>))}
						</select>
						<input placeholder="Branch Name *" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
						<input type="tel" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
						<input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
						<input placeholder="Address" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} />
						<div className="md:col-span-3">
							<button className="btn-primary" onClick={onCreate} disabled={!form.countryId || !form.name}>Add Branch</button>
						</div>
					</div>
				</div>
				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th>Country</th>
								<th>State</th>
								<th>Branch</th>
								<th>Contact</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data?.items?.map((b:any)=>(
								<tr key={b._id}>
									<td>{countries?.items?.find((x:any)=>x._id===b.countryId)?.name || b.countryId}</td>
									<td>{states?.items?.find((x:any)=>x._id===b.stateId)?.name || "-"}</td>
									<td className="font-medium">{b.name}</td>
									<td>
										<div className="text-sm text-gray-600">{b.email || "-"}</div>
										{b.phone && <div className="text-xs text-gray-500">{b.phone}</div>}
									</td>
									<td><span className={b.status === "active" ? "badge badge-success" : "badge badge-gray"}>{b.status || "active"}</span></td>
								</tr>
							))}
							{!data?.items?.length && (
								<tr>
									<td colSpan={5} className="text-center py-8 text-gray-500">No branches found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</ProtectedRoute>
	);
}

export default BranchesPage;
