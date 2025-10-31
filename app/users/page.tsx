"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function UsersPage() {
	const { data, mutate } = useSWR("/api/v1/users", fetcher);
	const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "JuniorConsultant" });

	const onCreate = async () => {
		await api.post("/api/v1/users", form);
		setForm({ firstName: "", lastName: "", email: "", password: "", role: "JuniorConsultant" });
		mutate();
	};

	return (
		<main className="p-6 space-y-6">
			<h1 className="text-xl font-semibold">Users</h1>
			<div className="flex flex-wrap gap-2 items-center">
				<input className="border rounded px-2 py-1" placeholder="First name" value={form.firstName} onChange={(e)=>setForm({...form,firstName:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Last name" value={form.lastName} onChange={(e)=>setForm({...form,lastName:e.target.value})} />
				<input className="border rounded px-2 py-1" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
				<input type="password" className="border rounded px-2 py-1" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
				<select className="border rounded px-2 py-1" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
					<option>Admin</option>
					<option>BranchManager</option>
					<option>Marketer</option>
					<option>JuniorConsultant</option>
					<option>SeniorConsultant</option>
					<option>Admission</option>
					<option>Accounts</option>
				</select>
				<button className="bg-black text-white px-3 py-1 rounded" onClick={onCreate} disabled={!form.firstName || !form.lastName || !form.email || !form.password}>Add</button>
			</div>
			<table className="w-full text-sm border">
				<thead className="bg-gray-50">
					<tr>
						<th className="p-2 text-left">Name</th>
						<th className="p-2 text-left">Email</th>
						<th className="p-2 text-left">Role</th>
						<th className="p-2 text-left">Status</th>
					</tr>
				</thead>
				<tbody>
					{data?.items?.map((u:any)=>(
						<tr key={u._id} className="border-t">
							<td className="p-2">{u.firstName} {u.lastName}</td>
							<td className="p-2">{u.email}</td>
							<td className="p-2">{u.role}</td>
							<td className="p-2">{u.isActive ? "active" : "inactive"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}


