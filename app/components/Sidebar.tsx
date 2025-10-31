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
	{ title: "CRM", items: [
		{ href: "/users", label: "Users" },
		{ href: "/leads", label: "Leads" },
		{ href: "/leads/import", label: "Upload" },
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
		<aside className="fixed inset-y-0 left-0 w-64 border-r bg-white px-3 py-4 overflow-y-auto">
			<div className="px-2 pb-4 text-base font-semibold">StudyCRM</div>
			<nav className="space-y-4 text-sm">
				{sections.map((s) => {
					const items: { href: string; label: string }[] = s.items ?? [{ href: s.href as string, label: s.title }];
					return (
						<div key={s.title}>
							<div className="px-2 text-gray-500 uppercase tracking-wide text-[11px]">{s.title}</div>
							<div className="mt-1 flex flex-col">
								{items.map((l) => (
									<Link key={l.href} href={l.href} className={`px-2.5 py-1.5 rounded hover:bg-gray-100 ${pathname===l.href?"bg-gray-900 text-white hover:bg-gray-900":""}`}>{l.label}</Link>
								))}
							</div>
						</div>
					);
				})}
			</nav>
			<button onClick={logout} className="mt-6 text-xs px-2.5 py-1.5 border rounded w-full hover:bg-gray-50">Logout</button>
		</aside>
	);
}


