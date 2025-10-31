"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";

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
    const onDelete = async (id: string) => { await api.delete(`/api/v1/locations/countries/${id}`); mutate(); };
	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Countries</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<input className="border rounded px-2 py-1" placeholder="Search name/code/phone" value={filters.q} onChange={(e)=>{ setPage(1); setFilters({...filters,q:e.target.value}); }} />
				<select className="border rounded px-2 py-1" value={filters.status} onChange={(e)=>{ setPage(1); setFilters({...filters,status:e.target.value}); }}>
					<option value="">All status</option>
					<option value="active">active</option>
					<option value="inactive">inactive</option>
				</select>
			</div>
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Code" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Phone Code" value={form.phoneCode} onChange={(e)=>setForm({...form,phoneCode:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left w-14">ID</th>
						<th className="p-2 text-left">Name</th>
						<th className="p-2 text-left">Country Code</th>
						<th className="p-2 text-left">Phone Code</th>
						<th className="p-2 text-left">Status</th>
						<th className="p-2 text-left">Action</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((c: any, idx: number) => (
						<tr key={c._id} className="border-t">
							<td className="p-2">{(data.page-1)*(data.limit)+idx+1}</td>
							<td className="p-2"><input className="border rounded px-1 py-0.5" defaultValue={c.name} onBlur={(e)=>onUpdate(c._id,{ name: e.target.value })} /></td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-24" defaultValue={c.code} onBlur={(e)=>onUpdate(c._id,{ code: e.target.value })} /></td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-24" defaultValue={c.phoneCode} onBlur={(e)=>onUpdate(c._id,{ phoneCode: e.target.value })} /></td>
							<td className="p-2">
								<select className="border rounded px-1 py-0.5" defaultValue={c.status} onChange={(e)=>onUpdate(c._id,{ status: e.target.value })}>
									<option value="active">active</option>
									<option value="inactive">inactive</option>
								</select>
							</td>
							<td className="p-2"><button className="text-red-600" onClick={()=>onDelete(c._id)}>Delete</button></td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center gap-2 mt-4">
				<button className="px-3 py-1 border rounded" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Prev</button>
				<div className="text-sm">Page {data?.page || page} / {data ? Math.max(1, Math.ceil((data.total||0)/(data.limit||10))) : "-"}</div>
				<button className="px-3 py-1 border rounded" disabled={data && (data.page*data.limit)>=data.total} onClick={()=>setPage((p)=>p+1)}>Next</button>
			</div>
		</main>
	);
}


