"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function LeadsPage() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({ q: "", destinationCountryId: "", programId: "" });
	const query = useMemo(() => {
		const p = new URLSearchParams();
		p.set("page", String(page));
		p.set("limit", "20");
		if (filters.q) p.set("q", filters.q);
		if (filters.destinationCountryId) p.set("destinationCountryId", filters.destinationCountryId);
		if (filters.programId) p.set("programId", filters.programId);
		return p.toString();
	}, [page, filters]);
	const { data, mutate } = useSWR(`/api/v1/leads?${query}`, fetcher);
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: programs } = useSWR("/api/v1/academics/programs", fetcher);
	const [form, setForm] = useState({ name: "", phone: "", email: "", destinationCountryId: "", programId: "" });
    const { data: users } = useSWR("/api/v1/users", fetcher);

	const onCreate = async () => {
		await api.post("/api/v1/leads", { ...form, destinationCountryId: form.destinationCountryId || undefined, programId: form.programId || undefined });
		setForm({ name: "", phone: "", email: "", destinationCountryId: "", programId: "" });
		mutate();
	};

	const onUpdate = async (id: string, payload: any) => {
		await api.put(`/api/v1/leads/${id}`, payload);
		mutate();
	};

	const onDelete = async (id: string) => {
		await api.delete(`/api/v1/leads/${id}`);
		mutate();
	};

	const onAssign = async (id: string, userId: string) => {
		await api.post(`/api/v1/leads/${id}/assign`, { userId });
		mutate();
	};

	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Leads</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<input className="border rounded px-2 py-1" placeholder="Search name/email/phone" value={filters.q} onChange={(e)=>{ setPage(1); setFilters({...filters,q:e.target.value}); }} />
				<select className="border rounded px-2 py-1" value={filters.destinationCountryId} onChange={(e)=>{ setPage(1); setFilters({...filters,destinationCountryId:e.target.value}); }}>
					<option value="">All destinations</option>
					{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
				</select>
				<select className="border rounded px-2 py-1" value={filters.programId} onChange={(e)=>{ setPage(1); setFilters({...filters,programId:e.target.value}); }}>
					<option value="">All programs</option>
					{programs?.items?.map((p:any)=>(<option key={p._id} value={p._id}>{p.shortName}</option>))}
				</select>
			</div>
			<div className="flex flex-wrap gap-2 items-center">
				<input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
				<select className="border rounded px-2 py-1" value={form.destinationCountryId} onChange={(e)=>setForm({...form,destinationCountryId:e.target.value})}>
					<option value="">Destination country</option>
					{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
				</select>
				<select className="border rounded px-2 py-1" value={form.programId} onChange={(e)=>setForm({...form,programId:e.target.value})}>
					<option value="">Program</option>
					{programs?.items?.map((p:any)=>(<option key={p._id} value={p._id}>{p.shortName}</option>))}
				</select>
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.name}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">ID</th>
						<th className="p-2 text-left">Student ID</th>
						<th className="p-2 text-left">Image</th>
						<th className="p-2 text-left">Name</th>
						<th className="p-2 text-left">Number</th>
						<th className="p-2 text-left">Email</th>
						<th className="p-2 text-left">Reference</th>
						<th className="p-2 text-left">Academic Details</th>
						<th className="p-2 text-left">Lang Test</th>
						<th className="p-2 text-left">Country</th>
						<th className="p-2 text-left">State</th>
						<th className="p-2 text-left">City</th>
						<th className="p-2 text-left">Destination</th>
						<th className="p-2 text-left">Program</th>
						<th className="p-2 text-left">Intake</th>
						<th className="p-2 text-left">Date</th>
						<th className="p-2 text-left">Financial</th>
						<th className="p-2 text-left">Situation</th>
						<th className="p-2 text-left">Status</th>
						<th className="p-2 text-left">Appointment</th>
						<th className="p-2 text-left">Last_CL_Sts</th>
						<th className="p-2 text-left">Last CL Time</th>
						<th className="p-2 text-left">Num of call</th>
						<th className="p-2 text-left">Duplicate Count</th>
						<th className="p-2 text-left">Duplicate Stat</th>
						<th className="p-2 text-left">Jr Consultant</th>
						<th className="p-2 text-left">Jr Received</th>
						<th className="p-2 text-left">Sr. Consultant</th>
						<th className="p-2 text-left">Sr. Received</th>
						<th className="p-2 text-left">Remarks</th>
						<th className="p-2 text-left">Assign</th>
						<th className="p-2 text-left">Actions</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((l:any, idx:number)=>(
						<tr key={l._id} className="border-t">
							<td className="p-2">{(data.page-1)*(data.limit)+idx+1}</td>
							<td className="p-2">{l.studentId}</td>
							<td className="p-2">-</td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-44" defaultValue={l.name} onBlur={(e)=>onUpdate(l._id,{ name: e.target.value })} /></td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-40" defaultValue={l.phone||""} onBlur={(e)=>onUpdate(l._id,{ phone: e.target.value })} /></td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-56" defaultValue={l.email||""} onBlur={(e)=>onUpdate(l._id,{ email: e.target.value })} /></td>
							<td className="p-2">{l.reference || "N/A"}</td>
							<td className="p-2">N/A</td>
							<td className="p-2">N/A</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2">{countries?.items?.find((x:any)=>x._id===l.destinationCountryId)?.name || "-"}</td>
							<td className="p-2">{programs?.items?.find((x:any)=>x._id===l.programId)?.shortName || "-"}</td>
							<td className="p-2">{l.intake || "-"}</td>
							<td className="p-2">{new Date(l.createdAt).toLocaleDateString?.() || "-"}</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2">{l.statusHistory?.[l.statusHistory.length-1]?.status || "-"}</td>
							<td className="p-2">-</td>
							<td className="p-2">{l.statusHistory?.[l.statusHistory.length-1]?.status || "-"}</td>
							<td className="p-2">{l.statusHistory?.[l.statusHistory.length-1]?.at ? new Date(l.statusHistory[l.statusHistory.length-1].at).toLocaleTimeString?.() : "-"}</td>
							<td className="p-2">{l.statusHistory?.length ?? 0}</td>
							<td className="p-2">{l.duplicates?.length ?? 0}</td>
							<td className="p-2">{(l.duplicates?.length ?? 0) > 0 ? "Yes" : "No"}</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2">-</td>
							<td className="p-2"><input className="border rounded px-1 py-0.5 w-48" placeholder="Remarks" onBlur={(e)=>onUpdate(l._id,{ note: e.target.value })} /></td>
							<td className="p-2">
								<select className="border rounded px-2 py-1" defaultValue={l.assignedToUserId || ""} onChange={(e)=>onAssign(l._id,e.target.value)}>
									<option value="">Unassigned</option>
									{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>))}
								</select>
							</td>
							<td className="p-2"><button className="text-red-600" onClick={()=>onDelete(l._id)}>Delete</button></td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center gap-2 mt-4">
				<button className="px-3 py-1 border rounded" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Prev</button>
				<div className="text-sm">Page {data?.page || page} / {data ? Math.max(1, Math.ceil((data.total||0)/(data.limit||20))) : "-"}</div>
				<button className="px-3 py-1 border rounded" disabled={data && (data.page*data.limit)>=data.total} onClick={()=>setPage((p)=>p+1)}>Next</button>
			</div>
		</main>
	);
}


