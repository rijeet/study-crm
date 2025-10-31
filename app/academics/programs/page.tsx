"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ProgramsPage() {
	const { data, mutate } = useSWR("/api/v1/academics/programs", fetcher);
	const [form, setForm] = useState({ name: "", shortName: "" });
	const onCreate = async () => {
		await api.post("/api/v1/academics/programs", form);
		setForm({ name: "", shortName: "" });
		mutate();
	};
    const onUpdate = async (id: string, payload: any) => { await api.put(`/api/v1/academics/programs/${id}`, payload); mutate(); };
    const onDelete = async (id: string) => { await api.delete(`/api/v1/academics/programs/${id}`); mutate(); };
	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Programs</h1>
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Short Name" value={form.shortName} onChange={(e)=>setForm({...form,shortName:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">Short Name</th>
						<th className="p-2 text-left">Status</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((p: any) => (
						<tr key={p._id} className="border-t">
							<td className="p-2"><input className="border rounded px-1 py-0.5" defaultValue={p.shortName} onBlur={(e)=>onUpdate(p._id,{ shortName: e.target.value })} /></td>
							<td className="p-2">{p.status}</td>
							<td className="p-2"><button className="text-red-600" onClick={()=>onDelete(p._id)}>Delete</button></td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


