"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

const sections = [
	{ title: "Dashboard", href: "/dashboard" },
	{ title: "Locations", items: [
		{ href: "/locations/countries", label: "Countries" },
		{ href: "/locations/states", label: "States" },
		{ href: "/locations/cities", label: "Cities" },
	] },
	{ title: "Academics", items: [
		{ href: "/academics/programs", label: "Programs" },
		{ href: "/academics/language-tests", label: "Language" },
	] },
	{ title: "University", items: [
		{ href: "/universities", label: "Universities" },
		{ href: "/branches", label: "Branches" },
	] },
	{ title: "Status", items: [
		{ href: "/status-groups", label: "Status Groups" },
		{ href: "/statuses", label: "Statuses" },
	] },
	{ title: "CRM", items: [
		{ href: "/users", label: "Users" },
		{ href: "/leads", label: "Leads" },
		{ href: "/leads/import", label: "Upload" },
		{ href: "/notifications", label: "Notifications" },
		{ href: "/tasks", label: "Tasks" },
		{ href: "/accounts", label: "Accounts" },
		{ href: "/reports", label: "Reports" },
	] },
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { setAccessToken } = useAuth();

	const logout = async () => {
		try { await fetch("/api/v1/auth/logout", { method: "POST" }); } catch {}
		setAccessToken(null);
		router.replace("/login");
	};

	return (
		<aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
			<div className="px-6 py-5 border-b border-gray-200">
				<h1 className="text-xl font-bold text-gray-900">StudyCRM</h1>
				<p className="text-xs text-gray-500 mt-0.5">Study Abroad CRM</p>
			</div>
			<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
				{sections.map((s) => {
					const items: { href: string; label: string }[] = s.items ?? [{ href: s.href as string, label: s.title }];
					return (
						<div key={s.title} className="mb-6">
							<div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.title}</div>
							<div className="space-y-1">
								{items.map((l) => {
									const isActive = pathname === l.href;
									return (
										<Link
											key={l.href}
											href={l.href}
											className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
												isActive
													? "bg-blue-50 text-blue-700 border border-blue-200"
													: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
											}`}
										>
											{l.label}
										</Link>
									);
								})}
							</div>
						</div>
					);
				})}
			</nav>
			<div className="p-4 border-t border-gray-200">
				<button
					onClick={logout}
					className="w-full btn-secondary text-sm py-2"
				>
					Logout
				</button>
			</div>
		</aside>
	);
}
