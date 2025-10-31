"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";

const links = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/locations/countries", label: "Countries" },
	{ href: "/locations/states", label: "States" },
	{ href: "/locations/cities", label: "Cities" },
	{ href: "/academics/programs", label: "Programs" },
	{ href: "/academics/language-tests", label: "Language" },
	{ href: "/universities", label: "Universities" },
	{ href: "/branches", label: "Branches" },
	{ href: "/users", label: "Users" },
	{ href: "/leads", label: "Leads" },
];

export default function Nav() {
	const pathname = usePathname();
	const router = useRouter();
	const { setAccessToken } = useAuth();

	const logout = async () => {
		try { await fetch("/api/v1/auth/logout", { method: "POST" }); } catch {}
		setAccessToken(null);
		router.replace("/login");
	};

	return (
		<header className="sticky top-0 z-10 bg-white border-b">
			<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
				<nav className="flex flex-wrap gap-3 text-sm">
					{links.map((l) => (
						<Link key={l.href} href={l.href} className={`px-2 py-1 rounded ${pathname===l.href?"bg-gray-900 text-white":"hover:bg-gray-100"}`}>{l.label}</Link>
					))}
				</nav>
				<button onClick={logout} className="text-sm px-3 py-1 border rounded hover:bg-gray-50">Logout</button>
			</div>
		</header>
	);
}


