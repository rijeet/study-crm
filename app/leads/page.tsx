"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

function LeadsPage() {
	const [page, setPage] = useState(1);
	const [selectedTab, setSelectedTab] = useState("Consultant");
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
	const [filters, setFilters] = useState({ 
		status: "", situation: "", intake: "", destination: "", appointment: "", q: "" 
	});
	
	const query = useMemo(() => {
		const p = new URLSearchParams();
		p.set("page", String(page));
		p.set("limit", "50");
		if (filters.q) p.set("q", filters.q);
		if (filters.destination) p.set("destinationCountryId", filters.destination);
		return p.toString();
	}, [page, filters]);

	const { data, mutate } = useSWR(`/api/v1/leads?${query}`, fetcher);
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: states } = useSWR("/api/v1/locations/states", fetcher);
	const { data: cities } = useSWR("/api/v1/locations/cities", fetcher);
	const { data: programs } = useSWR("/api/v1/academics/programs", fetcher);
	const { data: languageTests } = useSWR("/api/v1/academics/language-tests", fetcher);
	const { data: users } = useSWR("/api/v1/users", fetcher);
	const { data: statuses } = useSWR("/api/v1/statuses", fetcher);

	const statesByCountry = useMemo(() => {
		const map: Record<string, any[]> = {};
		(states?.items || []).forEach((s: any) => {
			if (!map[s.countryId]) map[s.countryId] = [];
			map[s.countryId].push(s);
		});
		return map;
	}, [states]);

	const citiesByState = useMemo(() => {
		const map: Record<string, any[]> = {};
		(cities?.items || []).forEach((c: any) => {
			if (!map[c.stateId]) map[c.stateId] = [];
			map[c.stateId].push(c);
		});
		return map;
	}, [cities]);

	const consultants = useMemo(() => (users?.items || []).filter((u: any) => u.role === "Consultant"), [users]);
	const { data: statusGroups } = useSWR("/api/v1/status-groups", fetcher);
	const consultantStatuses = useMemo(() => {
		const consultantGroup = statusGroups?.items?.find((g: any) => g.name === "consultant");
		if (!consultantGroup) return [];
		return (statuses?.items || []).filter((s: any) => {
			const groupId = typeof s.statusGroupId === 'object' ? s.statusGroupId?._id : s.statusGroupId;
			return String(groupId) === String(consultantGroup._id);
		});
	}, [statuses, statusGroups]);

	const onUpdate = async (id: string, payload: any) => {
		try {
			await api.put(`/api/v1/leads/${id}`, payload);
			mutate();
		} catch (err) {
			alert("Update failed");
		}
	};

	const onDelete = async (id: string) => {
		if (!confirm("Delete this lead?")) return;
		try {
			await api.delete(`/api/v1/leads/${id}`);
			mutate();
		} catch (err) {
			alert("Delete failed");
		}
	};

	const getLastCLStatus = (lead: any) => {
		const clStatuses = lead.statusHistory?.filter((h: any) => 
			["No Answer", "Not Interested", "Call Again", "Follow UP"].includes(h.status)
		) || [];
		return clStatuses[clStatuses.length - 1] || null;
	};

	const formatTime = (date: string | Date) => {
		if (!date) return "12:00:00 AM";
		const d = new Date(date);
		return d.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
	};

	const formatDate = (date: string | Date) => {
		if (!date) return "";
		const d = new Date(date);
		return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
	};

	const getStatusColor = (status: string) => {
		const statusObj = consultantStatuses.find((s: any) => s.name === status);
		if (statusObj?.color) return statusObj.color;
		if (status === "No Answer" || status === "No Answ") return "#a855f7";
		if (status === "Not Interested" || status === "Not Inter") return "#991b1b";
		return "#6b7280";
	};

	const toggleRowSelection = (id: string) => {
		const newSet = new Set(selectedRows);
		if (newSet.has(id)) newSet.delete(id);
		else newSet.add(id);
		setSelectedRows(newSet);
	};

	const toggleAllRows = () => {
		if (selectedRows.size === (data?.items?.length || 0)) {
			setSelectedRows(new Set());
		} else {
			setSelectedRows(new Set(data?.items?.map((l: any) => l._id) || []));
		}
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6 bg-gray-50">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Consultant Lead</h1>
						<p className="text-gray-500 mt-1">Home / View</p>
					</div>
					<button className="btn-primary">Add New</button>
				</div>

				{/* Tabs */}
				<div className="flex gap-2 border-b border-gray-200">
					<button 
						className={`px-4 py-2 font-medium ${selectedTab === "Consultant" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
						onClick={() => setSelectedTab("Consultant")}
					>
						Consultant
					</button>
					<button 
						className={`px-4 py-2 font-medium ${selectedTab === "Admission" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
						onClick={() => setSelectedTab("Admission")}
					>
						Admission
					</button>
					<button 
						className={`px-4 py-2 font-medium ${selectedTab === "Compliance" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
						onClick={() => setSelectedTab("Compliance")}
					>
						Compliance
					</button>
				</div>

				{/* Filters */}
				<div className="card p-4">
					<div className="grid grid-cols-5 gap-3 mb-3">
						<select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="text-sm">
							<option value="">Status</option>
							{consultantStatuses.map((s: any) => (
								<option key={s._id} value={s.name}>{s.name}</option>
							))}
						</select>
						<select value={filters.situation} onChange={(e) => setFilters({...filters, situation: e.target.value})} className="text-sm">
							<option value="">Situation</option>
							<option value="active">Active</option>
							<option value="pending">Pending</option>
						</select>
						<select value={filters.intake} onChange={(e) => setFilters({...filters, intake: e.target.value})} className="text-sm">
							<option value="">Intake</option>
							<option value="Fall 2025">Fall 2025</option>
							<option value="Spring 2026">Spring 2026</option>
						</select>
						<select value={filters.destination} onChange={(e) => setFilters({...filters, destination: e.target.value})} className="text-sm">
							<option value="">Destination</option>
							{countries?.items?.map((c: any) => (
								<option key={c._id} value={c._id}>{c.name}</option>
							))}
						</select>
						<input 
							type="date" 
							value={filters.appointment} 
							onChange={(e) => setFilters({...filters, appointment: e.target.value})} 
							className="text-sm"
							placeholder="Appointment"
						/>
					</div>
					<div className="flex gap-3">
						<input
							placeholder="Search..."
							value={filters.q}
							onChange={(e) => setFilters({...filters, q: e.target.value})}
							className="flex-1"
						/>
					</div>
				</div>

				{/* Table */}
				<div className="card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="modern-table text-sm">
							<thead>
								<tr>
									<th className="w-10">
										<input type="checkbox" checked={selectedRows.size === (data?.items?.length || 0)} onChange={toggleAllRows} />
									</th>
									<th>ID</th>
									<th>Student ID</th>
									<th className="w-12">Image</th>
									<th>Name</th>
									<th>Number</th>
									<th>Email</th>
									<th>Reference</th>
									<th>Academic Details</th>
									<th>Lang Test</th>
									<th>State</th>
									<th>City</th>
									<th>Destination</th>
									<th>Program</th>
									<th>Intake</th>
									<th>Date</th>
									<th>Financial</th>
									<th>Situation</th>
									<th>Status</th>
									<th>Appointment</th>
									<th>Last_CL_Sts</th>
									<th>Last CL Time</th>
									<th>Num of call</th>
									<th>Duplicate Count</th>
									<th>Duplicate Stat</th>
									<th>Jr Consultant</th>
									<th>Jr Received</th>
									<th>Sr. Consultant</th>
									<th>Sr. Received</th>
									<th>Remarks</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{data?.items?.map((l: any) => {
									const lastCL = getLastCLStatus(l);
									const latestStatus = l.statusHistory?.[l.statusHistory.length - 1]?.status || "New";
									const callCount = l.statusHistory?.filter((h: any) => 
										["No Answer", "Call Again", "Follow UP"].includes(h.status)
									).length || 0;
									return (
										<tr key={l._id}>
											<td>
												<input type="checkbox" checked={selectedRows.has(l._id)} onChange={() => toggleRowSelection(l._id)} />
											</td>
											<td className="font-medium">{l._id.slice(-3)}</td>
											<td className="font-mono text-xs">{l.studentId}</td>
											<td>
												<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
													<span className="text-xs">👤</span>
												</div>
											</td>
											<td>
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs min-w-[120px]"
													defaultValue={l.name}
													onBlur={(e) => onUpdate(l._id, { name: e.target.value })}
												/>
											</td>
											<td>
												<input
													type="tel"
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs w-24"
													defaultValue={l.phone || ""}
													onBlur={(e) => onUpdate(l._id, { phone: e.target.value })}
												/>
											</td>
											<td>
												<input
													type="email"
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs w-32"
													defaultValue={l.email || ""}
													onBlur={(e) => onUpdate(l._id, { email: e.target.value })}
												/>
											</td>
											<td className="relative group">
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs w-20 pr-6"
													defaultValue={l.reference || "N/A"}
													onBlur={(e) => onUpdate(l._id, { reference: e.target.value })}
												/>
												<button className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100">✏️</button>
											</td>
											<td className="relative group">
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs w-32 pr-6"
													defaultValue={l.academicDetails?.details || "N/A"}
													onBlur={(e) => onUpdate(l._id, { academicDetails: { details: e.target.value } })}
												/>
												<button className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100">✏️</button>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.langTestId || ""}
													onChange={(e) => onUpdate(l._id, { langTestId: e.target.value || null })}
												>
													<option value="">N/A</option>
													{languageTests?.items?.map((lt: any) => (
														<option key={lt._id} value={lt._id}>{lt.shortName}</option>
													))}
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.stateId || ""}
													disabled={!l.destinationCountryId}
													onChange={(e) => {
														const newStateId = e.target.value || null;
														onUpdate(l._id, { stateId: newStateId, cityId: null });
													}}
												>
													<option value="">Select..</option>
													{(statesByCountry[l.destinationCountryId] || []).map((s: any) => (
														<option key={s._id} value={s._id}>{s.name}</option>
													))}
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.cityId || ""}
													disabled={!l.stateId}
													onChange={(e) => onUpdate(l._id, { cityId: e.target.value || null })}
												>
													<option value="">Select..</option>
													{(citiesByState[l.stateId] || []).map((c: any) => (
														<option key={c._id} value={c._id}>{c.name}</option>
													))}
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.destinationCountryId || ""}
													onChange={(e) => onUpdate(l._id, { destinationCountryId: e.target.value || null })}
												>
													<option value="">Select..</option>
													{countries?.items?.map((c: any) => (
														<option key={c._id} value={c._id}>{c.name}</option>
													))}
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.programId || ""}
													onChange={(e) => onUpdate(l._id, { programId: e.target.value || null })}
												>
													<option value="">Select..</option>
													{programs?.items?.map((p: any) => (
														<option key={p._id} value={p._id}>{p.shortName}</option>
													))}
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.intake || ""}
													onChange={(e) => onUpdate(l._id, { intake: e.target.value || null })}
												>
													<option value="">Select..</option>
													<option value="Fall 2025">Fall 2025</option>
													<option value="Spring 2026">Spring 2026</option>
													<option value="Summer 2026">Summer 2026</option>
												</select>
											</td>
											<td className="text-xs">{formatDate(l.createdAt)}</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.financialSituation || ""}
													onChange={(e) => onUpdate(l._id, { financialSituation: e.target.value || null })}
												>
													<option value="">Select..</option>
													<option value="Good">Good</option>
													<option value="Fair">Fair</option>
													<option value="Poor">Poor</option>
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.situation || ""}
													onChange={(e) => onUpdate(l._id, { situation: e.target.value || null })}
												>
													<option value="">Select..</option>
													<option value="Active">Active</option>
													<option value="Pending">Pending</option>
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs text-white font-medium"
													style={{ backgroundColor: getStatusColor(latestStatus) }}
													defaultValue={latestStatus}
													onChange={(e) => {
														onUpdate(l._id, { status: e.target.value });
													}}
												>
													{consultantStatuses.map((s: any) => (
														<option key={s._id} value={s.name}>{s.name}</option>
													))}
												</select>
											</td>
											<td>
												<input 
													type="date" 
													className="border rounded px-1 py-0.5 text-xs w-28"
													defaultValue={l.appointmentAt ? new Date(l.appointmentAt).toISOString().split('T')[0] : ""}
													onBlur={(e) => onUpdate(l._id, { appointmentAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
												/>
											</td>
											<td className="text-xs">{lastCL?.status || "-"}</td>
											<td className="text-xs">{lastCL ? formatTime(lastCL.at) : "12:00:00 AM"}</td>
											<td className="text-xs text-center">{callCount}</td>
											<td className="text-xs text-center">{l.duplicates?.length || 0}</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.duplicates?.length ? "Yes" : "No"}
												>
													<option value="No">No</option>
													<option value="Yes">Yes</option>
												</select>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.juniorConsultantId || ""}
													onChange={(e) => onUpdate(l._id, { juniorConsultantId: e.target.value || null })}
												>
													<option value="">Select..</option>
													{consultants.map((c: any) => (
														<option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
													))}
												</select>
											</td>
											<td>
												<input 
													type="date" 
													className="border rounded px-1 py-0.5 text-xs w-24"
													defaultValue={l.juniorReceivedAt ? new Date(l.juniorReceivedAt).toISOString().split('T')[0] : ""}
													onBlur={(e) => onUpdate(l._id, { juniorReceivedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
												/>
											</td>
											<td>
												<select 
													className="border rounded px-1 py-0.5 text-xs"
													defaultValue={l.seniorConsultantId || ""}
													onChange={(e) => onUpdate(l._id, { seniorConsultantId: e.target.value || null })}
												>
													<option value="">Select..</option>
													{consultants.map((c: any) => (
														<option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
													))}
												</select>
											</td>
											<td>
												<input 
													type="date" 
													className="border rounded px-1 py-0.5 text-xs w-24"
													defaultValue={l.seniorReceivedAt ? new Date(l.seniorReceivedAt).toISOString().split('T')[0] : ""}
													onBlur={(e) => onUpdate(l._id, { seniorReceivedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
												/>
											</td>
											<td className="relative group">
												<input
													className="border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-xs w-24 pr-6"
													defaultValue={l.remarks || "No remarks"}
													onBlur={(e) => onUpdate(l._id, { remarks: e.target.value })}
												/>
												<button className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100">✏️</button>
											</td>
											<td>
												<div className="flex gap-1">
													<button className="text-blue-600 hover:text-blue-800" title="Edit">✏️</button>
													<button className="text-green-600 hover:text-green-800" title="View">👁️</button>
													<button className="text-red-600 hover:text-red-800" onClick={() => onDelete(l._id)} title="Delete">🗑️</button>
												</div>
											</td>
										</tr>
									);
								})}
								{!data?.items?.length && (
									<tr>
										<td colSpan={31} className="text-center py-8 text-gray-500">No leads found</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						Showing {((data?.page || 1) - 1) * (data?.limit || 50) + 1} to {Math.min((data?.page || 1) * (data?.limit || 50), data?.total || 0)} of {data?.total || 0} leads
					</div>
					<div className="flex items-center gap-2">
						<button
							className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Previous
						</button>
						<span className="text-sm text-gray-700 px-3">Page {data?.page || page} of {data ? Math.max(1, Math.ceil((data.total || 0) / (data.limit || 50))) : 1}</span>
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

export default LeadsPage;
