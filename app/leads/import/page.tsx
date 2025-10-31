"use client";
import { useState } from "react";
import { api } from "@/lib/client/api";

export default function LeadImportPage() {
	const [file, setFile] = useState<File|undefined>();
	const [result, setResult] = useState<any>(null);
	const onUpload = async () => {
		if (!file) return;
		const fd = new FormData();
		fd.append("file", file);
		const { data } = await api.post("/api/v1/leads/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
		setResult(data);
	};
	return (
		<main className="p-6 space-y-4">
			<h1 className="text-xl font-semibold">Import Leads (CSV)</h1>
			<p className="text-sm text-gray-600">Expected headers: name, phone, email, destinationCountryId, programId</p>
			<input type="file" accept=".csv" onChange={(e)=>setFile(e.target.files?.[0])} />
			<button className="bg-black text-white px-3 py-1 rounded" onClick={onUpload} disabled={!file}>Upload</button>
			{result && (
				<div className="text-sm">
					<div>Created: {result.createdCount}</div>
					<div>Duplicates: {result.duplicates?.length || 0}</div>
				</div>
			)}
		</main>
	);
}


