"use client";
import axios from "axios";

export const api = axios.create({ baseURL: "" });

api.interceptors.request.use((config) => {
	try {
		const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
		if (token) {
			config.headers = config.headers || {};
			(config.headers as any)["Authorization"] = `Bearer ${token}`;
		}
        // CSRF double-submit header for state-changing requests
        const method = (config.method || "get").toLowerCase();
        const needsCsrf = ["post","put","patch","delete"].includes(method);
        if (needsCsrf && typeof document !== "undefined") {
            const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
            const csrf = match ? decodeURIComponent(match[1]) : null;
            if (csrf) {
                (config.headers as any)["x-csrf-token"] = csrf;
            }
        }
	} catch {}
	return config;
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const status = error?.response?.status;
		const originalRequest = error.config;
		if (status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				await new Promise<void>((resolve) => pendingRequests.push(resolve));
				return api(originalRequest);
			}
			originalRequest._retry = true;
			isRefreshing = true;
			try {
				const { data } = await axios.post("/api/v1/auth/refresh");
				if (data?.accessToken) {
					localStorage.setItem("access_token", data.accessToken);
					pendingRequests.forEach((fn) => fn());
					pendingRequests = [];
					return api(originalRequest);
				}
			} catch (e) {
				localStorage.removeItem("access_token");
				pendingRequests.forEach((fn) => fn());
				pendingRequests = [];
				return Promise.reject(error);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	}
);


