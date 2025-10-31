"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function StatusesPage() {
	const { data: statusGroups } = useSWR("/api/v1/status-groups", fetcher);
	const { data, mutate } = useSWR("/api/v1/statuses", fetcher);
	const [form, setForm] = useState({ statusGroupId: "", name: "", color: "", description: "" });
	const [filterGroup, setFilterGroup] = useState("");

	const onCreate = async () => {
		await api.post("/api/v1/statuses", form);
		setForm({ statusGroupId: "", name: "", color: "", description: "" });
		mutate();
	};

	const onDelete = async (id: string) => {
		if (!confirm("Delete this status?")) return;
		await api.delete(`/api/v1/statuses/${id}`);
		mutate();
	};

	const filtered = filterGroup ? (data?.items||[]).filter((s:any)=>String(s.statusGroupId?._id||s.statusGroupId)===filterGroup) : (data?.items||[]);

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Statuses</h1>
						<p className="text-gray-500 mt-1">Manage individual statuses within groups</p>
					</div>
				</div>

				<div className="card p-4">
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-700">Filter by Group:</span>
						<select className="w-64" value={filterGroup} onChange={(e)=>setFilterGroup(e.target.value)}>
							<option value="">All Groups</option>
							{statusGroups?.items?.map((sg:any)=>(<option key={sg._id} value={sg._id}>{sg.name}</option>))}
						</select>
					</div>
				</div>

				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Status</h2>
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						<select value={form.statusGroupId} onChange={(e)=>setForm({...form,statusGroupId:e.target.value})} required>
							<option value="">Select Group *</option>
							{statusGroups?.items?.map((sg:any)=>(<option key={sg._id} value={sg._id}>{sg.name}</option>))}
						</select>
						<input placeholder="Name *" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
						<input type="color" className="h-10" value={form.color||"#000000"} onChange={(e)=>setForm({...form,color:e.target.value})} />
						<input placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
						<button className="btn-primary" onClick={onCreate} disabled={!form.statusGroupId || !form.name}>Add Status</button>
					</div>
				</div>

				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Group</th>
								<th>Name</th>
								<th>Color</th>
								<th>Description</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((s:any, idx:number)=>(
								<tr key={s._id}>
									<td className="font-medium text-gray-500">{idx+1}</td>
									<td><span className="badge badge-info">{typeof s.statusGroupId==="object"?s.statusGroupId.name:s.statusGroupId}</span></td>
									<td className="font-semibold text-gray-900">{s.name}</td>
									<td>
										<div className="flex items-center gap-2">
											<span className="inline-block w-6 h-6 rounded border border-gray-200" style={{backgroundColor:s.color||"#ccc"}} />
											<span className="text-xs text-gray-500 font-mono">{s.color || "#000000"}</span>
										</div>
									</td>
									<td className="text-gray-600">{s.description||"-"}</td>
									<td><span className={s.status === "active" ? "badge badge-success" : "badge badge-gray"}>{s.status}</span></td>
									<td><button className="btn-danger text-xs px-3 py-1" onClick={()=>onDelete(s._id)}>Delete</button></td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={7} className="text-center py-8 text-gray-500">No statuses found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</ProtectedRoute>
	);
}
