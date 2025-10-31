"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function TasksPage() {
	const { data: users } = useSWR("/api/v1/users", fetcher);
	const { data, mutate } = useSWR("/api/v1/tasks", fetcher);
	const [form, setForm] = useState({ assignorId: "", executorId: "", duration: "", description: "" });

	const onCreate = async () => {
		await api.post("/api/v1/tasks", { ...form, status: "pending" });
		setForm({ assignorId: "", executorId: "", duration: "", description: "" });
		mutate();
	};

	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Tasks</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<select className="border rounded px-2 py-1" value={form.assignorId} onChange={(e)=>setForm({...form,assignorId:e.target.value})}>
					<option value="">Assignor</option>
					{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>))}
				</select>
				<select className="border rounded px-2 py-1" value={form.executorId} onChange={(e)=>setForm({...form,executorId:e.target.value})}>
					<option value="">Executor</option>
					{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>))}
				</select>
				<input className="border rounded px-2 py-1" placeholder="Duration" value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})} />
				<input className="border rounded px-2 py-1 w-80" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.assignorId || !form.executorId || !form.description}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">ID</th>
						<th className="p-2 text-left">Assignor</th>
						<th className="p-2 text-left">Executor</th>
						<th className="p-2 text-left">Duration</th>
						<th className="p-2 text-left">Description</th>
						<th className="p-2 text-left">Status</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((t:any, idx:number)=>(
						<tr key={t._id} className="border-t">
							<td className="p-2">{idx+1}</td>
							<td className="p-2">{users?.items?.find((u:any)=>u._id===t.assignorId)?.firstName || t.assignorId}</td>
							<td className="p-2">{users?.items?.find((u:any)=>u._id===t.executorId)?.firstName || t.executorId}</td>
							<td className="p-2">{t.duration || "-"}</td>
							<td className="p-2">{t.description}</td>
							<td className="p-2">{t.status}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


