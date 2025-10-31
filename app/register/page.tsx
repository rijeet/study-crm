"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RegisterLeadPage() {
	const { data: countries } = useSWR("/api/v1/locations/countries", fetcher);
	const { data: programs } = useSWR("/api/v1/academics/programs", fetcher);
	const [form, setForm] = useState({ name: "", email: "", phone: "", destinationCountryId: "", programId: "", intake: "" });
	const [status, setStatus] = useState<"idle"|"ok"|"error">("idle");
	const [error, setError] = useState<string | null>(null);

	// Ensure CSRF token cookie is set by making a request to a safe endpoint
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Fetch countries endpoint to trigger middleware to set CSRF cookie if needed
			fetch("/api/v1/locations/countries").catch(() => {});
		}
	}, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("idle"); setError(null);
		try {
			// Get CSRF token from cookie
			const getCsrfToken = () => {
				if (typeof document === "undefined") return null;
				const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
				return match ? decodeURIComponent(match[1]) : null;
			};

			const csrfToken = getCsrfToken();
			const headers: Record<string, string> = { "Content-Type": "application/json" };
			if (csrfToken) {
				headers["x-csrf-token"] = csrfToken;
			}

			const res = await fetch("/api/v1/leads/register", {
				method: "POST",
				headers,
				body: JSON.stringify({
					name: form.name,
					email: form.email || undefined,
					phone: form.phone || undefined,
					destinationCountryId: form.destinationCountryId || undefined,
					programId: form.programId || undefined,
					intake: form.intake || undefined,
				})
			});
			if (!res.ok) {
				const txt = await res.text();
				throw new Error(txt || "Failed to register");
			}
			setStatus("ok");
		} catch (e:any) {
			setError(e.message || "Failed");
			setStatus("error");
		}
	};

	if (status === "ok") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
				<div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
						<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you!</h1>
					<p className="text-gray-600 text-lg">Your registration has been received successfully.</p>
					<p className="text-gray-500 mt-2">Our consultants will contact you shortly to guide you through the next steps.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
			<form onSubmit={submit} className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-5">
				<div className="text-center mb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
						<span className="text-white text-2xl font-bold">SC</span>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Apply for Study Abroad</h1>
					<p className="text-gray-600 mt-2">Fill out the form below to get started</p>
				</div>
				<label className="block">
					<div className="text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></div>
					<input className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required placeholder="John Doe" />
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label className="block">
						<div className="text-sm font-medium text-gray-700 mb-2">Email</div>
						<input type="email" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="john@example.com" />
					</label>
					<label className="block">
						<div className="text-sm font-medium text-gray-700 mb-2">Phone</div>
						<input type="tel" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} placeholder="+1 234 567 8900" />
					</label>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label className="block">
						<div className="text-sm font-medium text-gray-700 mb-2">Destination Country</div>
						<select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.destinationCountryId} onChange={(e)=>setForm({...form,destinationCountryId:e.target.value})}>
							<option value="">Select Country</option>
							{countries?.items?.map((c:any)=>(<option key={c._id} value={c._id}>{c.name}</option>))}
						</select>
					</label>
					<label className="block">
						<div className="text-sm font-medium text-gray-700 mb-2">Program</div>
						<select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.programId} onChange={(e)=>setForm({...form,programId:e.target.value})}>
							<option value="">Select Program</option>
							{programs?.items?.map((p:any)=>(<option key={p._id} value={p._id}>{p.name}</option>))}
						</select>
					</label>
				</div>
				<label className="block">
					<div className="text-sm font-medium text-gray-700 mb-2">Intake</div>
					<input className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" value={form.intake} onChange={(e)=>setForm({...form,intake:e.target.value})} placeholder="Fall 2024" />
				</label>
				{error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
				<button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">Submit Application</button>
				<p className="text-xs text-center text-gray-500">By submitting this form, you agree to be contacted by our consultants regarding your study abroad journey.</p>
			</form>
		</div>
	);
}
