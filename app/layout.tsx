import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
	title: "StudyCRM",
	description: "Study abroad CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-white text-gray-900 antialiased">
				<AuthProvider>
					<Sidebar />
					<div className="pl-64">{children}</div>
				</AuthProvider>
			</body>
		</html>
	);
}


