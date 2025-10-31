"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
	accessToken: string | null;
	setAccessToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [accessToken, setAccessTokenState] = useState<string | null>(null);
	useEffect(() => {
		try {
			const t = localStorage.getItem("access_token");
			if (t) setAccessTokenState(t);
		} catch {}
	}, []);
	const setAccessToken = (t: string | null) => {
		setAccessTokenState(t);
		try {
			if (t) localStorage.setItem("access_token", t);
			else localStorage.removeItem("access_token");
		} catch {}
	};
	const value = useMemo(() => ({ accessToken, setAccessToken }), [accessToken]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


