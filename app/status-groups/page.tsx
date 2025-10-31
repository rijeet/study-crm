"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function StatusGroupsPage() {
	const { data, mutate } = useSWR("/api/v1/status-groups", fetcher);
	const [form, setForm] = useState({ name: "", description: "" });

	const onCreate = async () => {
		await api.post("/api/v1/status-groups", form);
		setForm({ name: "", description: "" });
		mutate();
	};

	const onDelete = async (id: string) => {
		if (!confirm("Delete this status group?")) return;
		await api.delete(`/api/v1/status-groups/${id}`);
		mutate();
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Status Groups</h1>
						<p className="text-gray-500 mt-1">Organize statuses into groups</p>
					</div>
				</div>
				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Status Group</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<input placeholder="Name *" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
						<input placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
						<button className="btn-primary" onClick={onCreate} disabled={!form.name}>Add Group</button>
					</div>
				</div>
				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Description</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{data?.items?.map((sg:any, idx:number)=>(
								<tr key={sg._id}>
									<td className="font-medium text-gray-500">{idx+1}</td>
									<td className="font-semibold text-gray-900">{sg.name}</td>
									<td className="text-gray-600">{sg.description || "-"}</td>
									<td><span className={sg.status === "active" ? "badge badge-success" : "badge badge-gray"}>{sg.status}</span></td>
									<td><button className="btn-danger text-xs px-3 py-1" onClick={()=>onDelete(sg._id)}>Delete</button></td>
								</tr>
							))}
							{!data?.items?.length && (
								<tr>
									<td colSpan={5} className="text-center py-8 text-gray-500">No status groups found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</ProtectedRoute>
	);
}
