"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function LeadsPage() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({ q: "", destinationCountryId: "", programId: "" });
	const query = useMemo(() => {
		const p = new URLSearchParams();
		p.set("page", String(page));
		p.set("limit", "20");
		if (filters.q) p.set("q", filters.q);
		if (filters.destinationCountryId) p.set("destinationCountryId", filters.destinationCountryId);
		if (filters.programId) p.set("programId", filters.programId);
		return p.toString();
	}, [page, filters]);
	const { data, mutate } = useSWR(`/api/v1/leads?${query}`, fetcher);
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: programs } = useSWR("/api/v1/academics/programs", fetcher);
	const [form, setForm] = useState({ name: "", phone: "", email: "", destinationCountryId: "", programId: "" });
	const { data: users } = useSWR("/api/v1/users", fetcher);
	const { data: branches } = useSWR("/api/v1/branches", fetcher);

	const onCreate = async () => {
		await api.post("/api/v1/leads", { ...form, destinationCountryId: form.destinationCountryId || undefined, programId: form.programId || undefined });
		setForm({ name: "", phone: "", email: "", destinationCountryId: "", programId: "" });
		mutate();
	};

	const onUpdate = async (id: string, payload: any) => {
		await api.put(`/api/v1/leads/${id}`, payload);
		mutate();
	};

	const onDelete = async (id: string) => {
		if (!confirm("Delete this lead?")) return;
		await api.delete(`/api/v1/leads/${id}`);
		mutate();
	};

	const allocateToBm = async (id: string, branchId: string, bmUserId: string) => {
		await api.post(`/api/v1/leads/${id}/allocate/bm`, { branchId, bmUserId });
		mutate();
	};

	const allocateToConsultant = async (id: string, consultantUserId: string) => {
		await api.post(`/api/v1/leads/${id}/allocate/consultant`, { consultantUserId });
		mutate();
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
						<p className="text-gray-500 mt-1">Manage and track student leads</p>
					</div>
				</div>

				{/* Filters */}
				<div className="card p-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
						<input
							placeholder="Search name/email/phone..."
							value={filters.q}
							onChange={(e) => { setPage(1); setFilters({ ...filters, q: e.target.value }); }}
						/>
						<select value={filters.destinationCountryId} onChange={(e) => { setPage(1); setFilters({ ...filters, destinationCountryId: e.target.value }); }}>
							<option value="">All Destinations</option>
							{countries?.items?.map((c: any) => (<option key={c._id} value={c._id}>{c.name}</option>))}
						</select>
						<select value={filters.programId} onChange={(e) => { setPage(1); setFilters({ ...filters, programId: e.target.value }); }}>
							<option value="">All Programs</option>
							{programs?.items?.map((p: any) => (<option key={p._id} value={p._id}>{p.shortName}</option>))}
						</select>
					</div>
				</div>

				{/* Create Form */}
				<div className="card p-4">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Lead</h2>
					<div className="grid grid-cols-1 md:grid-cols-6 gap-3">
						<input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
						<input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
						<input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
						<select value={form.destinationCountryId} onChange={(e) => setForm({ ...form, destinationCountryId: e.target.value })}>
							<option value="">Destination</option>
							{countries?.items?.map((c: any) => (<option key={c._id} value={c._id}>{c.name}</option>))}
						</select>
						<select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
							<option value="">Program</option>
							{programs?.items?.map((p: any) => (<option key={p._id} value={p._id}>{p.shortName}</option>))}
						</select>
						<button className="btn-primary" onClick={onCreate} disabled={!form.name}>Add Lead</button>
					</div>
				</div>

				{/* Table */}
				<div className="card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="modern-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Student ID</th>
									<th>Name</th>
									<th>Contact</th>
									<th>Destination</th>
									<th>Program</th>
									<th>Status</th>
									<th>Branch/BM</th>
									<th>Consultant</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{data?.items?.map((l: any, idx: number) => (
									<tr key={l._id}>
										<td className="font-medium text-gray-500">{(data.page - 1) * (data.limit) + idx + 1}</td>
										<td><span className="font-mono text-xs text-gray-600">{l.studentId}</span></td>
										<td>
											<input
												className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-sm"
												defaultValue={l.name}
												onBlur={(e) => onUpdate(l._id, { name: e.target.value })}
											/>
										</td>
										<td>
											<div className="space-y-1">
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs w-32"
													defaultValue={l.phone || ""}
													onBlur={(e) => onUpdate(l._id, { phone: e.target.value })}
												/>
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs w-32"
													type="email"
													defaultValue={l.email || ""}
													onBlur={(e) => onUpdate(l._id, { email: e.target.value })}
												/>
											</div>
										</td>
										<td>{countries?.items?.find((x: any) => x._id === l.destinationCountryId)?.name || "-"}</td>
										<td>{programs?.items?.find((x: any) => x._id === l.programId)?.shortName || "-"}</td>
										<td>
											<span className="badge badge-info">{l.statusHistory?.[l.statusHistory.length - 1]?.status || "New"}</span>
										</td>
										<td className="text-xs">
											<div className="mb-1">{branches?.items?.find((b: any) => b._id === l.currentBranchId)?.name || "-"}</div>
											<div className="text-gray-500">BM: {users?.items?.find((u: any) => u._id === l.currentBmUserId)?.firstName || "-"}</div>
											<div className="flex gap-1 mt-2">
												<select
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.currentBranchId || ""}
													onChange={(e) => allocateToBm(l._id, e.target.value, (users?.items?.find((u: any) => u._id === l.currentBmUserId)?._id) || "")}
												>
													<option value="">Branch</option>
													{branches?.items?.map((b: any) => (<option key={b._id} value={b._id}>{b.name}</option>))}
												</select>
												<select
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.currentBmUserId || ""}
													onChange={(e) => allocateToBm(l._id, (l.currentBranchId || ""), e.target.value)}
												>
													<option value="">BM</option>
													{users?.items?.filter((u: any) => u.role === "BranchManager").map((u: any) => (<option key={u._id} value={u._id}>{u.firstName}</option>))}
												</select>
											</div>
										</td>
										<td className="text-xs">
											<div className="mb-2">{users?.items?.find((u: any) => u._id === l.currentConsultantUserId)?.firstName || "-"}</div>
											<select
												className="border rounded px-1 py-0.5 text-xs"
												defaultValue={l.currentConsultantUserId || ""}
												onChange={(e) => allocateToConsultant(l._id, e.target.value)}
											>
												<option value="">Select</option>
												{users?.items?.filter((u: any) => u.role === "Consultant").map((u: any) => (<option key={u._id} value={u._id}>{u.firstName}</option>))}
											</select>
										</td>
										<td>
											<button className="btn-danger text-xs px-2 py-1" onClick={() => onDelete(l._id)}>Delete</button>
										</td>
									</tr>
								))}
								{!data?.items?.length && (
									<tr>
										<td colSpan={10} className="text-center py-8 text-gray-500">No leads found</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						Showing {((data?.page || 1) - 1) * (data?.limit || 20) + 1} to {Math.min((data?.page || 1) * (data?.limit || 20), data?.total || 0)} of {data?.total || 0} leads
					</div>
					<div className="flex items-center gap-2">
						<button
							className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Previous
						</button>
						<span className="text-sm text-gray-700 px-3">Page {data?.page || page} of {data ? Math.max(1, Math.ceil((data.total || 0) / (data.limit || 20))) : 1}</span>
						<button
							className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={data && (data.page * data.limit) >= data.total}
							onClick={() => setPage((p) => p + 1)}
						>
							Next
						</button>
					</div>
				</div>
			</main>
		</ProtectedRoute>
	);
}
