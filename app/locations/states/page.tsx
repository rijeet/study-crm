"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function StatesPage() {
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: states, mutate } = useSWR("/api/v1/locations/states", fetcher);
	const [form, setForm] = useState({ countryId: "", name: "", code: "" });

	const countryMap = useMemo(() => {
		const map: Record<string,string> = {};
		for (const c of countries?.items ?? []) map[c._id] = c.name;
		return map;
	}, [countries]);

	const onCreate = async () => {
		await api.post("/api/v1/locations/states", form);
		setForm({ countryId: "", name: "", code: "" });
		mutate();
	};

	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">States</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<select className="border rounded px-2 py-1" value={form.countryId} onChange={(e)=>setForm({...form,countryId:e.target.value})}>
					<option value="">Select country</option>
					{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
				</select>
				<input className="border rounded px-2 py-1" placeholder="State name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Code" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.countryId || !form.name || !form.code}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">Country</th>
						<th className="p-2 text-left">State</th>
						<th className="p-2 text-left">Code</th>
					</tr>
				</thead>
				<tbody>
					{states?.items?.map((s:any)=>(
						<tr key={s._id} className="border-t">
							<td className="p-2">{countryMap[s.countryId] || s.countryId}</td>
							<td className="p-2">{s.name}</td>
							<td className="p-2">{s.code}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


