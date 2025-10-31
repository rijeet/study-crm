"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function UsersPage() {
	const { data, mutate } = useSWR("/api/v1/users", fetcher);
	const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "Consultant" });

	const onCreate = async () => {
		await api.post("/api/v1/users", form);
		setForm({ firstName: "", lastName: "", email: "", password: "", role: "Consultant" });
		mutate();
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Users</h1>
						<p className="text-gray-500 mt-1">Manage system users and permissions</p>
					</div>
				</div>

				{/* Create Form */}
				<div className="card p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h2>
					<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
						<input placeholder="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
						<input placeholder="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
						<input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
						<input type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
						<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
							<option>Admin</option>
							<option>DatabaseManager</option>
							<option>BranchManager</option>
							<option>Consultant</option>
							<option>DataEntry</option>
							<option>Marketer</option>
							<option>JuniorConsultant</option>
							<option>SeniorConsultant</option>
							<option>Admission</option>
							<option>Accounts</option>
						</select>
						<button className="btn-primary" onClick={onCreate} disabled={!form.firstName || !form.lastName || !form.email || !form.password}>Add User</button>
					</div>
				</div>

				{/* Table */}
				<div className="card overflow-hidden">
					<table className="modern-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{data?.items?.map((u: any) => (
								<tr key={u._id}>
									<td className="font-medium">{u.firstName} {u.lastName}</td>
									<td className="text-gray-600">{u.email}</td>
									<td><span className="badge badge-info">{u.role}</span></td>
									<td>
										<span className={u.isActive ? "badge badge-success" : "badge badge-gray"}>
											{u.isActive ? "Active" : "Inactive"}
										</span>
									</td>
								</tr>
							))}
							{!data?.items?.length && (
								<tr>
									<td colSpan={4} className="text-center py-8 text-gray-500">No users found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</ProtectedRoute>
	);
}
