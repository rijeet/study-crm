"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function CitiesPage() {
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: states } = useSWR("/api/v1/locations/states", fetcher);
	const { data: cities, mutate } = useSWR("/api/v1/locations/cities", fetcher);
	const [form, setForm] = useState({ countryId: "", stateId: "", name: "", zip: "" });

	const statesByCountry = useMemo(() => {
		const map: Record<string, any[]> = {};
		for (const s of states?.items ?? []) {
			(map[s.countryId] = map[s.countryId] || []).push(s);
		}
		return map;
	}, [states]);

	const onCreate = async () => {
		await api.post("/api/v1/locations/cities", form);
		setForm({ countryId: "", stateId: "", name: "", zip: "" });
		mutate();
	};

	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Cities</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<select className="border rounded px-2 py-1" value={form.countryId} onChange={(e)=>setForm({...form,countryId:e.target.value,stateId:""})}>
					<option value="">Select country</option>
					{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
				</select>
				<select className="border rounded px-2 py-1" value={form.stateId} onChange={(e)=>setForm({...form,stateId:e.target.value})} disabled={!form.countryId}>
					<option value="">Select state</option>
					{(statesByCountry[form.countryId]||[]).map((s:any)=>(<option key={s._id} value={s._id}>{s.name}</option>))}
				</select>
				<input className="border rounded px-2 py-1" placeholder="City name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Zip" value={form.zip} onChange={(e)=>setForm({...form,zip:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.countryId || !form.stateId || !form.name}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">Country</th>
						<th className="p-2 text-left">State</th>
						<th className="p-2 text-left">City</th>
						<th className="p-2 text-left">Zip</th>
					</tr>
				</thead>
				<tbody>
					{cities?.items?.map((c:any)=>(
						<tr key={c._id} className="border-t">
							<td className="p-2">{countries?.items?.find((x:any)=>x._id===c.countryId)?.name || c.countryId}</td>
							<td className="p-2">{states?.items?.find((x:any)=>x._id===c.stateId)?.name || c.stateId}</td>
							<td className="p-2">{c.name}</td>
							<td className="p-2">{c.zip}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


