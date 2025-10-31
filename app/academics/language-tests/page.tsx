"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function LanguageTestsPage() {
	const { data, mutate } = useSWR("/api/v1/academics/language-tests", fetcher);
	const [form, setForm] = useState({ name: "", shortName: "" });
	const onCreate = async () => {
		await api.post("/api/v1/academics/language-tests", form);
		setForm({ name: "", shortName: "" });
		mutate();
	};
	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Language Tests</h1>
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
							<td className="p-2">{p.shortName}</td>
							<td className="p-2">{p.status}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


