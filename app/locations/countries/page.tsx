"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function CountriesPage() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({ q: "", status: "" });
	const query = useMemo(() => {
		const p = new URLSearchParams();
		p.set("page", String(page));
		p.set("limit", "10");
		if (filters.q) p.set("q", filters.q);
		if (filters.status) p.set("status", filters.status);
		return p.toString();
	}, [page, filters]);
	const { data, mutate } = useSWR(`/api/v1/locations/countries?${query}`, fetcher);
	const [form, setForm] = useState({ name: "", code: "", phoneCode: "" });
	const onCreate = async () => {
		await api.post("/api/v1/locations/countries", form);
		setForm({ name: "", code: "", phoneCode: "" });
		mutate();
	};
	const onUpdate = async (id: string, payload: any) => { await api.put(`/api/v1/locations/countries/${id}`, payload); mutate(); };
	const onDelete = async (id: string) => {
		if (!confirm("Delete this country?")) return;
		await api.delete(`/api/v1/locations/countries/${id}`);
		mutate();
	};
	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Countries</h1>
						<p className="text-gray-500 mt-1">Manage country information</p>
					</div>
				</div>
				<div className="card p-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input placeholder="Search name/code/phone..." value={filters.q} onChange={(e)=>{ setPage(1); setFilters({...filters,q:e.target.value}); }} />
						<select value={filters.status} onChange={(e)=>{ setPage(1); setFilters({...filters,status:e.target.value}); }}>
							<option value="">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
				</div>
				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Country</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<input placeholder="Country Name *" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
						<input placeholder="Code (e.g., US) *" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})} required maxLength={3} />
						<input placeholder="Phone Code (e.g., +1) *" value={form.phoneCode} onChange={(e)=>setForm({...form,phoneCode:e.target.value})} required />
						<button className="btn-primary" onClick={onCreate} disabled={!form.name || !form.code || !form.phoneCode}>Add Country</button>
					</div>
				</div>
				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th className="w-16">ID</th>
								<th>Name</th>
								<th>Country Code</th>
								<th>Phone Code</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{data?.items?.map((c: any, idx: number) => (
								<tr key={c._id}>
									<td className="font-medium text-gray-500">{(data.page-1)*(data.limit)+idx+1}</td>
									<td><input className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm w-full" defaultValue={c.name} onBlur={(e)=>onUpdate(c._id,{ name: e.target.value })} /></td>
									<td><input className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs font-mono w-24" defaultValue={c.code} onBlur={(e)=>onUpdate(c._id,{ code: e.target.value.toUpperCase() })} /></td>
									<td><input className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs w-24" defaultValue={c.phoneCode} onBlur={(e)=>onUpdate(c._id,{ phoneCode: e.target.value })} /></td>
									<td>
										<select className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm" defaultValue={c.status} onChange={(e)=>onUpdate(c._id,{ status: e.target.value })}>
											<option value="active">Active</option>
											<option value="inactive">Inactive</option>
										</select>
									</td>
									<td><button className="btn-danger text-xs px-3 py-1" onClick={()=>onDelete(c._id)}>Delete</button></td>
								</tr>
							))}
							{!data?.items?.length && (
								<tr>
									<td colSpan={6} className="text-center py-8 text-gray-500">No countries found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">Showing {((data?.page || 1) - 1) * (data?.limit || 10) + 1} to {Math.min((data?.page || 1) * (data?.limit || 10), data?.total || 0)} of {data?.total || 0}</div>
					<div className="flex items-center gap-2">
						<button className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Previous</button>
						<span className="text-sm text-gray-700 px-3">Page {data?.page || page} of {data ? Math.max(1, Math.ceil((data.total||0)/(data.limit||10))) : 1}</span>
						<button className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed" disabled={data && (data.page*data.limit)>=data.total} onClick={()=>setPage((p)=>p+1)}>Next</button>
					</div>
				</div>
			</main>
		</ProtectedRoute>
	);
}
