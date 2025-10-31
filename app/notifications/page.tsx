"use client";
import useSWR from "swr";
import { api } from "@/lib/client/api";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function NotificationsPage() {
	const { data, mutate } = useSWR("/api/v1/notifications", fetcher);
	const onRead = async (id: string) => { try { await api.post(`/api/v1/notifications/${id}/read`); mutate(); } catch {} };
	const onReadAll = async () => {
		if (!data?.items) return;
		for (const n of data.items) {
			if (!n.readAt) await api.post(`/api/v1/notifications/${n._id}/read`).catch(() => {});
		}
		mutate();
	};
	const unreadCount = data?.items?.filter((n: any) => !n.readAt).length || 0;
	return (
		<ProtectedRoute>
			<main className="p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
						<p className="text-gray-500 mt-1">{unreadCount} unread notifications</p>
					</div>
					{unreadCount > 0 && (
						<button className="btn-secondary" onClick={onReadAll}>Mark all as read</button>
					)}
				</div>
				<div className="card overflow-hidden">
					<div className="divide-y divide-gray-100">
						{(data?.items||[]).map((n:any)=>(
							<div key={n._id} className={`p-6 flex items-start justify-between hover:bg-gray-50 transition-colors ${!n.readAt ? "bg-blue-50/30" : ""}`}>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<div className={`h-2 w-2 rounded-full ${!n.readAt ? "bg-blue-600" : "bg-gray-300"}`} />
										<div className="font-semibold text-gray-900">{n.type.replace(/_/g, " ")}</div>
										{!n.readAt && <span className="badge badge-info text-xs">New</span>}
									</div>
									<div className="text-gray-600 text-sm ml-4">Lead #{n.payload?.leadId || "-"}</div>
									<div className="text-gray-400 text-xs ml-4 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
								</div>
								<div>
									{!n.readAt ? (
										<button className="btn-primary text-xs px-3 py-1.5" onClick={()=>onRead(n._id)}>Mark read</button>
									) : (
										<span className="text-xs text-gray-500">Read</span>
									)}
								</div>
							</div>
						))}
						{(data?.items||[]).length===0 && (
							<div className="p-12 text-center text-gray-500">
								<svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
								</svg>
								<p>No notifications</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</ProtectedRoute>
	);
}
