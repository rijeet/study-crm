"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

type KPI = Record<string, number>;

function StatCard({ title, subtitle, value, accent }: { title: string; subtitle?: string; value: number | string; accent?: "blue"|"green"|"orange"|"indigo" }) {
	const accentColors = {
		blue: "from-blue-500 to-blue-600",
		green: "from-emerald-500 to-emerald-600",
		orange: "from-orange-500 to-orange-600",
		indigo: "from-indigo-500 to-indigo-600",
	};
	const accentBg = accentColors[accent || "blue"];
	return (
		<div className="card p-6 hover:shadow-lg transition-all duration-300">
			<div className="flex items-start justify-between mb-4">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					{subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
				</div>
				<div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accentBg} flex items-center justify-center shadow-lg`}>
					<span className="text-white text-xl font-bold">{value.toString()[0]}</span>
				</div>
			</div>
			<div className="text-4xl font-bold text-gray-900 tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</div>
		</div>
	);
}

function TwoRowCard({ title, subtitle, value, pendingLabel = "Pending", pendingCount = 0 }: { title: string; subtitle?: string; value: number; pendingLabel?: string; pendingCount?: number }) {
	return (
		<div className="card p-6 hover:shadow-lg transition-all duration-300">
			<div className="flex items-start justify-between mb-4">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					{subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
				</div>
				<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
					<span className="text-white text-xl">$</span>
				</div>
			</div>
			<div className="text-4xl font-bold text-gray-900 tracking-tight mb-2">{value.toLocaleString()}</div>
			<div className="flex items-center gap-2 text-sm">
				<span className={`badge ${pendingCount > 0 ? "badge-warning" : "badge-success"}`}>
					{pendingCount} {pendingLabel}
				</span>
			</div>
		</div>
	);
}

function LineChart({ months, leads, applications, enrollments }: { months: string[]; leads: number[]; applications: number[]; enrollments: number[] }) {
	const width = 900; const height = 300; const padding = 32;
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const maxVal = Math.max(1, ...leads, ...applications, ...enrollments);
	const x = (i: number) => padding + (i * (width - 2*padding)) / Math.max(1, months.length - 1);
	const y = (v: number) => height - padding - (v * (height - 2*padding)) / maxVal;
	const path = (arr: number[]) => arr.map((v, i) => `${i===0?"M":"L"}${x(i)},${y(v)}`).join(" ");

	return (
		<div className="overflow-x-auto bg-white rounded-xl border border-gray-200 p-6 relative">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
				<div className="flex items-center gap-6 text-xs">
					<div className="flex items-center gap-2"><span className="inline-block w-4 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded" /> Applications</div>
					<div className="flex items-center gap-2"><span className="inline-block w-4 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded" /> Enrollments</div>
					<div className="flex items-center gap-2"><span className="inline-block w-4 h-1 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded" /> Leads</div>
				</div>
			</div>
			<div className="relative">
				<svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" onMouseLeave={() => setHoveredIndex(null)}>
					{/* Grid lines */}
					{Array.from({ length: 5 }).map((_, i) => {
						const yy = padding + i * (height - 2*padding) / 4;
						return <line key={i} x1={padding} x2={width - padding} y1={yy} y2={yy} stroke="#e5e7eb" strokeDasharray="4 4" strokeWidth={1} />
					})}
					
					{/* Gradient definitions */}
					<defs>
						<linearGradient id="gradientLeads" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#6366f1" />
							<stop offset="100%" stopColor="#8b5cf6" />
						</linearGradient>
						<linearGradient id="gradientApps" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#f59e0b" />
							<stop offset="100%" stopColor="#f97316" />
						</linearGradient>
						<linearGradient id="gradientEnroll" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#10b981" />
							<stop offset="100%" stopColor="#34d399" />
						</linearGradient>
					</defs>

					{/* Chart lines */}
					<path d={path(leads)} fill="none" stroke="url(#gradientLeads)" strokeWidth={3} strokeLinecap="round" />
					<path d={path(applications)} fill="none" stroke="url(#gradientApps)" strokeWidth={2.5} strokeDasharray="4 2" strokeLinecap="round" />
					<path d={path(enrollments)} fill="none" stroke="url(#gradientEnroll)" strokeWidth={2.5} strokeDasharray="2 2" strokeLinecap="round" />
					
					{/* Data points with hover areas - vertical line for easier hovering */}
					{months.map((m, i) => {
						const maxY = Math.max(y(leads[i] || 0), y(applications[i] || 0), y(enrollments[i] || 0));
						const minY = Math.min(y(leads[i] || 0), y(applications[i] || 0), y(enrollments[i] || 0));
						return (
							<g key={`points-${i}`}>
								{/* Invisible vertical hover area - makes it easy to hover anywhere near the data points */}
								<rect
									x={x(i) - 15}
									y={Math.min(minY - 10, height - padding)}
									width="30"
									height={Math.max(maxY - minY + 20, 50)}
									fill="transparent"
									stroke="none"
									onMouseEnter={() => setHoveredIndex(i)}
									style={{ cursor: 'pointer' }}
								/>
								{/* Visible dots on hover */}
								{hoveredIndex === i && (
									<>
										{leads[i] > 0 && <circle cx={x(i)} cy={y(leads[i])} r="5" fill="#6366f1" stroke="white" strokeWidth={2} />}
										{applications[i] > 0 && <circle cx={x(i)} cy={y(applications[i])} r="5" fill="#f59e0b" stroke="white" strokeWidth={2} />}
										{enrollments[i] > 0 && <circle cx={x(i)} cy={y(enrollments[i])} r="5" fill="#10b981" stroke="white" strokeWidth={2} />}
									</>
								)}
							</g>
						);
					})}

					{/* Month labels */}
					{months.map((m, i) => (
						<text key={m+String(i)} x={x(i)} y={height - padding + 16} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="500">{m}</text>
					))}
				</svg>

				{/* Tooltip */}
				{hoveredIndex !== null && (
					<div
						className="absolute bg-gray-900 text-white rounded-lg shadow-xl p-3 pointer-events-none z-10 min-w-[180px]"
						style={{
							left: `calc(${(x(hoveredIndex) / width) * 100}% - 90px)`,
							top: '20px',
							transform: 'translateX(0)'
						}}
					>
						<div className="text-xs font-semibold mb-2 border-b border-gray-700 pb-2">{months[hoveredIndex]}</div>
						<div className="space-y-1.5 text-xs">
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500"></div>
									<span className="text-gray-300">Leads</span>
								</div>
								<span className="font-bold text-white">{leads[hoveredIndex]?.toLocaleString() || 0}</span>
							</div>
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
									<span className="text-gray-300">Applications</span>
								</div>
								<span className="font-bold text-white">{applications[hoveredIndex]?.toLocaleString() || 0}</span>
							</div>
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
									<span className="text-gray-300">Enrollments</span>
								</div>
								<span className="font-bold text-white">{enrollments[hoveredIndex]?.toLocaleString() || 0}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const { data } = useSWR("/api/v1/dashboard/metrics", fetcher);
	const kpis: KPI = data?.kpis || {};
	const ts = data?.timeseries || { months: [], leads: [], applications: [], enrollments: [] };
	const activity = (data?.consultantActivity as Array<{ label: string; count: number }>) || [];
	const appActivity = (data?.applicationActivity as Array<{ label: string; count: number }>) || [];

	return (
		<ProtectedRoute>
			<main className="p-8 space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
						<p className="text-gray-500 mt-1">Overview of your CRM performance</p>
					</div>
				</div>

				{/* Top row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<StatCard title="Lead" subtitle="ALL" value={kpis.leadsTotal ?? 0} accent="indigo" />
					<StatCard title="Application" subtitle="TODAY" value={kpis.applicationsToday ?? 0} accent="green" />
					<StatCard title="Enrollment" subtitle="TODAY" value={kpis.enrollmentsToday ?? 0} accent="orange" />
				</div>

				{/* Middle row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<TwoRowCard title="Service Charge" subtitle="TODAY" value={kpis.serviceChargeToday ?? 0} pendingCount={kpis.serviceChargePending ?? 0} />
					<TwoRowCard title="Security Deposit" subtitle="TODAY" value={kpis.securityDepositToday ?? 0} pendingCount={kpis.securityDepositPending ?? 0} />
					<TwoRowCard title="Deposit Return" subtitle="TODAY" value={kpis.depositReturnToday ?? 0} pendingCount={kpis.depositReturnPending ?? 0} />
				</div>

				{/* Bottom row */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<StatCard title="JuniorConsultant" subtitle="ALL" value={kpis.juniorReceived ?? 0} accent="green" />
					<StatCard title="SeniorConsultant" subtitle="ALL" value={kpis.seniorReceived ?? 0} accent="green" />
					<StatCard title="Admission" subtitle="ALL" value={kpis.admissionReceived ?? 0} accent="green" />
					<StatCard title="Compliance" subtitle="ALL" value={kpis.complianceReceived ?? 0} accent="green" />
				</div>

				{/* Chart */}
				<LineChart months={ts.months} leads={ts.leads} applications={ts.applications} enrollments={ts.enrollments} />

				{/* Activity Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="card p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Consultant Activity</h2>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ALL</span>
						</div>
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{activity.map((a, i) => (
								<div key={a.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
									<div className="flex items-center gap-3">
										<div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: ["#a78bfa","#34d399","#ef4444","#3b82f6","#f59e0b","#10b981","#8b5cf6","#22d3ee","#f97316","#64748b"][i % 10] }} />
										<span className="text-sm font-medium text-gray-700">{a.label || "Unknown"}</span>
									</div>
									<span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-full">{a.count}</span>
								</div>
							))}
							{activity.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No activity found.</p>}
						</div>
					</div>

					<div className="card p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Application Activity</h2>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ALL</span>
						</div>
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{appActivity.map((a, i) => (
								<div key={a.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
									<div className="flex items-center gap-3">
										<div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: ["#f43f5e","#22c55e","#a16207","#6b7280","#2563eb","#7c3aed","#b91c1c","#f59e0b","#e879f9"][i % 9] }} />
										<span className="text-sm font-medium text-gray-700">{a.label}</span>
									</div>
									<span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-full">{a.count}</span>
								</div>
							))}
							{appActivity.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No application activity found.</p>}
						</div>
					</div>
				</div>
			</main>
		</ProtectedRoute>
	);
}
