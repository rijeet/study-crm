import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import LayoutWrapper from "./components/LayoutWrapper";

export const metadata: Metadata = {
	title: "StudyCRM",
	description: "Study abroad CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
				<AuthProvider>
					<LayoutWrapper>{children}</LayoutWrapper>
				</AuthProvider>
			</body>
		</html>
	);
}


