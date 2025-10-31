"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

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
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Universities</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<select className="border rounded px-2 py-1" value={form.countryId} onChange={(e)=>setForm({...form,countryId:e.target.value})}>
					<option value="">Select country</option>
					{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
				</select>
				<input className="border rounded px-2 py-1" placeholder="University name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.countryId || !form.name}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">Country</th>
						<th className="p-2 text-left">University</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((u:any)=>(
						<tr key={u._id} className="border-t">
							<td className="p-2">{countries?.items?.find((x:any)=>x._id===u.countryId)?.name || u.countryId}</td>
							<td className="p-2">{u.name}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


