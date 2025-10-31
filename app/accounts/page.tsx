"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function AccountsPage() {
	const { data: users } = useSWR("/api/v1/users", fetcher);
	const { data: sds, mutate: mutateSd } = useSWR("/api/v1/accounts/security-deposits", fetcher);
	const { data: scs, mutate: mutateSc } = useSWR("/api/v1/accounts/service-charges", fetcher);

	const [sd, setSd] = useState({ mentorId: "", studentName: "", amount: "" });
	const [sc, setSc] = useState({ mentorId: "", studentName: "", amount: "" });

	const addSd = async () => {
		await api.post("/api/v1/accounts/security-deposits", { mentorId: sd.mentorId, studentName: sd.studentName, amount: Number(sd.amount) });
		setSd({ mentorId: "", studentName: "", amount: "" });
		mutateSd();
	};
	const addSc = async () => {
		await api.post("/api/v1/accounts/service-charges", { mentorId: sc.mentorId, studentName: sc.studentName, amount: Number(sc.amount) });
		setSc({ mentorId: "", studentName: "", amount: "" });
		mutateSc();
	};

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
						<p className="text-gray-500 mt-1">Manage financial transactions</p>
					</div>
				</div>

				{/* Security Deposit */}
				<div className="card p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Security Deposit</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<select value={sd.mentorId} onChange={(e)=>setSd({...sd,mentorId:e.target.value})} required>
							<option value="">Select Mentor *</option>
							{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>))}
						</select>
						<input placeholder="Student Name *" value={sd.studentName} onChange={(e)=>setSd({...sd,studentName:e.target.value})} required />
						<input type="number" placeholder="Amount *" value={sd.amount} onChange={(e)=>setSd({...sd,amount:e.target.value})} required />
						<button className="btn-primary" onClick={addSd} disabled={!sd.mentorId || !sd.studentName || !sd.amount}>Add Deposit</button>
					</div>
					<div className="overflow-hidden rounded-lg border border-gray-200">
						<table className="modern-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Mentor</th>
									<th>Student</th>
									<th>Amount</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{sds?.items?.map((r:any, idx:number)=>(
									<tr key={r._id}>
										<td className="font-medium text-gray-500">{idx+1}</td>
										<td>{users?.items?.find((u:any)=>u._id===r.mentorId)?.firstName || r.mentorId}</td>
										<td className="font-medium">{r.studentName}</td>
										<td className="font-semibold">${r.amount?.toLocaleString()}</td>
										<td><span className={r.status === "received" ? "badge badge-success" : "badge badge-warning"}>{r.status || "pending"}</span></td>
									</tr>
								))}
								{!sds?.items?.length && (
									<tr>
										<td colSpan={5} className="text-center py-8 text-gray-500">No security deposits</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Service Charge */}
				<div className="card p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Service Charge</h2>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<select value={sc.mentorId} onChange={(e)=>setSc({...sc,mentorId:e.target.value})} required>
							<option value="">Select Mentor *</option>
							{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>))}
						</select>
						<input placeholder="Student Name *" value={sc.studentName} onChange={(e)=>setSc({...sc,studentName:e.target.value})} required />
						<input type="number" placeholder="Amount *" value={sc.amount} onChange={(e)=>setSc({...sc,amount:e.target.value})} required />
						<button className="btn-primary" onClick={addSc} disabled={!sc.mentorId || !sc.studentName || !sc.amount}>Add Charge</button>
					</div>
					<div className="overflow-hidden rounded-lg border border-gray-200">
						<table className="modern-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Mentor</th>
									<th>Student</th>
									<th>Amount</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{scs?.items?.map((r:any, idx:number)=>(
									<tr key={r._id}>
										<td className="font-medium text-gray-500">{idx+1}</td>
										<td>{users?.items?.find((u:any)=>u._id===r.mentorId)?.firstName || r.mentorId}</td>
										<td className="font-medium">{r.studentName}</td>
										<td className="font-semibold">${r.amount?.toLocaleString()}</td>
										<td><span className={r.status === "received" ? "badge badge-success" : "badge badge-warning"}>{r.status || "pending"}</span></td>
									</tr>
								))}
								{!scs?.items?.length && (
									<tr>
										<td colSpan={5} className="text-center py-8 text-gray-500">No service charges</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</ProtectedRoute>
	);
}
