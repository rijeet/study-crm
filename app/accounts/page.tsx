"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";

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
		<main className="p-6 space-y-10">
			<h1 className="text-xl font-semibold">Accounts</h1>
			<section className="space-y-3">
				<h2 className="font-medium">Security Deposit Receive</h2>
				<div className="flex flex-wrap gap-2 items-center">
					<select className="border rounded px-2 py-1" value={sd.mentorId} onChange={(e)=>setSd({...sd,mentorId:e.target.value})}>
						<option value="">Mentor</option>
						{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName}</option>))}
					</select>
					<input className="border rounded px-2 py-1" placeholder="Student" value={sd.studentName} onChange={(e)=>setSd({...sd,studentName:e.target.value})} />
					<input className="border rounded px-2 py-1" placeholder="Amount" value={sd.amount} onChange={(e)=>setSd({...sd,amount:e.target.value})} />
					<button className="bg-black text-white px-3 py-1 rounded" onClick={addSd} disabled={!sd.mentorId || !sd.studentName || !sd.amount}>Add</button>
				</div>
				<table className="w-full text-sm border">
					<thead className="bg-gray-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Mentor</th><th className="p-2 text-left">Student</th><th className="p-2 text-left">Amount</th><th className="p-2 text-left">Status</th></tr></thead>
					<tbody>
						{sds?.items?.map((r:any, idx:number)=>(<tr key={r._id} className="border-t"><td className="p-2">{idx+1}</td><td className="p-2">{users?.items?.find((u:any)=>u._id===r.mentorId)?.firstName || r.mentorId}</td><td className="p-2">{r.studentName}</td><td className="p-2">{r.amount}</td><td className="p-2">{r.status}</td></tr>))}
					</tbody>
				</table>
			</section>

			<section className="space-y-3">
				<h2 className="font-medium">Service Charge Receive</h2>
				<div className="flex flex-wrap gap-2 items-center">
					<select className="border rounded px-2 py-1" value={sc.mentorId} onChange={(e)=>setSc({...sc,mentorId:e.target.value})}>
						<option value="">Mentor</option>
						{users?.items?.map((u:any)=>(<option key={u._id} value={u._id}>{u.firstName}</option>))}
					</select>
					<input className="border rounded px-2 py-1" placeholder="Student" value={sc.studentName} onChange={(e)=>setSc({...sc,studentName:e.target.value})} />
					<input className="border rounded px-2 py-1" placeholder="Amount" value={sc.amount} onChange={(e)=>setSc({...sc,amount:e.target.value})} />
					<button className="bg-black text-white px-3 py-1 rounded" onClick={addSc} disabled={!sc.mentorId || !sc.studentName || !sc.amount}>Add</button>
				</div>
				<table className="w-full text-sm border">
					<thead className="bg-gray-50"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Mentor</th><th className="p-2 text-left">Student</th><th className="p-2 text-left">Amount</th><th className="p-2 text-left">Status</th></tr></thead>
					<tbody>
						{scs?.items?.map((r:any, idx:number)=>(<tr key={r._id} className="border-t"><td className="p-2">{idx+1}</td><td className="p-2">{users?.items?.find((u:any)=>u._id===r.mentorId)?.firstName || r.mentorId}</td><td className="p-2">{r.studentName}</td><td className="p-2">{r.amount}</td><td className="p-2">{r.status}</td></tr>))}
					</tbody>
				</table>
			</section>
		</main>
	);
}


