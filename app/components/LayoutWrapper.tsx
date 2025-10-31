"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/client/api";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLoginPage = pathname === "/login";
	const isRegisterPage = pathname === "/register";
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState<any[]>([]);
	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				const { data } = await api.get("/api/v1/notifications");
				if (!ignore) setItems(data.items || []);
			} catch {}
		})();
		return () => { ignore = true; };
	}, [pathname]);
	
	if (isLoginPage || isRegisterPage) {
		return <>{children}</>;
	}
	
	return (
		<>
			<Sidebar />
			<div className="pl-64 min-h-screen bg-gray-50">
				<div className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-40">
					<div className="relative">
						<button
							className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
							onClick={() => setOpen((v) => !v)}
							aria-label="Notifications"
						>
							<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
							</svg>
							{items.length > 0 && (
								<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5 font-semibold">
									{Math.min(9, items.length)}
								</span>
							)}
						</button>
						{open && (
							<div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-auto z-50">
								<div className="p-4 text-sm font-semibold text-gray-900 border-b border-gray-200 bg-gray-50">Notifications</div>
								<ul className="divide-y divide-gray-100">
									{items.map((n) => (
										<li key={n._id} className="p-4 hover:bg-gray-50 transition-colors">
											<div className="font-medium text-gray-900 text-sm">{n.type.replace(/_/g, " ")}</div>
											<div className="text-gray-600 text-xs mt-1">Lead #{n.payload?.leadId || "-"}</div>
											<div className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</div>
										</li>
									))}
									{items.length === 0 && <li className="p-4 text-sm text-gray-500 text-center">No notifications</li>}
								</ul>
								<div className="p-3 text-right text-xs border-t border-gray-200 bg-gray-50">
									<a href="/notifications" className="text-blue-600 hover:text-blue-700 font-medium">View all</a>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="p-0">
					{children}
				</div>
			</div>
		</>
	);
}
