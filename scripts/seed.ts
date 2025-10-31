import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Role } from "@/models/Role";
import { User } from "@/models/User";
import { Country, State, City } from "@/models/Location";
import { Program, LanguageTest } from "@/models/Academic";
import { University } from "@/models/University";

async function upsertRole(name: string, permissions: string[], description?: string) {
	await Role.updateOne(
		{ name },
		{ $set: { name, permissions, description } },
		{ upsert: true }
	);
}

async function seedRoles() {
	await upsertRole("Admin", ["*"], "Superuser with all permissions");
	await upsertRole("BranchManager", ["leads:read","leads:update","users:manage","branches:manage","reports:read"], "Manage branch operations");
	await upsertRole("Marketer", ["leads:create","leads:read"], "Create and view own leads");
	await upsertRole("JuniorConsultant", ["leads:read","leads:update"], "Handle lead follow-ups");
	await upsertRole("SeniorConsultant", ["leads:read","leads:update"], "Approve and advance leads");
	await upsertRole("Admission", ["leads:read","universities:manage"], "Manage applications");
	await upsertRole("Accounts", ["reports:read"], "Handle payments and ledgers");
}

async function seedAdmin() {
	const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
	const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123456";
	const passwordHash = await bcrypt.hash(password, 12);
	await User.updateOne(
		{ email },
		{
			$setOnInsert: {
				firstName: "System",
				lastName: "Admin",
				passwordHash,
				role: "Admin",
				permissions: ["*"],
				isActive: true,
			},
		},
		{ upsert: true }
	);
}

async function seedLocations() {
	const countries = [
		{ name: "Malaysia", code: "MY", phoneCode: "60" },
		{ name: "Canada", code: "CA", phoneCode: "1" },
		{ name: "New Zealand", code: "NZ", phoneCode: "64" },
		{ name: "Australia", code: "AU", phoneCode: "61" },
		{ name: "United States", code: "US", phoneCode: "1" },
		{ name: "United Kingdom", code: "GB", phoneCode: "44" },
		{ name: "Bangladesh", code: "BD", phoneCode: "88" },
	];
	for (const c of countries) {
		await Country.updateOne({ code: c.code }, { $set: { ...c, status: "active" } }, { upsert: true });
	}
	const bd = await Country.findOne({ code: "BD" });
	if (bd) {
		const states = [
			["Dhaka","DHA"],
			["Chattogram","CHA"],
			["Rajshahi","RAJ"],
			["Khulna","KHU"],
			["Barishal","BAR"],
			["Sylhet","SYL"],
			["Rangpur","RAN"],
			["Mymensingh","MYM"],
		] as const;
		for (const [name, code] of states) {
			await State.updateOne({ countryId: bd._id, code }, { $set: { countryId: bd._id, name, code, status: "active" } }, { upsert: true });
		}
		const mym = await State.findOne({ countryId: bd._id, code: "MYM" });
		const ran = await State.findOne({ countryId: bd._id, code: "RAN" });
		if (mym) {
			const cities = [
				["Mymensingh","2200"],
				["Netrokona","2400"],
				["Sherpur","2100"],
				["Jamalpur","2000"],
			];
			for (const [name, zip] of cities) {
				await City.updateOne({ stateId: mym._id, name }, { $set: { countryId: bd._id, stateId: mym._id, name, zip, status: "active" } }, { upsert: true });
			}
		}
		if (ran) {
			const cities = [
				["Lalmonirhat","5500"],
				["Nilphamari","5300"],
				["Thakurgaon","5100"],
				["Panchagarh","5000"],
				["Gaibandha","5700"],
				["Kurigram","5600"],
			];
			for (const [name, zip] of cities) {
				await City.updateOne({ stateId: ran._id, name }, { $set: { countryId: bd._id, stateId: ran._id, name, zip, status: "active" } }, { upsert: true });
			}
		}
	}
}

async function seedAcademics() {
	const programs = [
		"SSC","HSC","O Level","A Level","Deploma","Vocational","Undergraduate","Postgraduate","Doctorate",
	];
	for (const name of programs) {
		await Program.updateOne({ shortName: name }, { $set: { name, shortName: name, status: "active" } }, { upsert: true });
	}
	const langs = ["IELTS","PTE","TOEFL","Duolingo","OXFORD ELLT","DELE","DALF","JLPT","GZB1"];
	for (const name of langs) {
		await LanguageTest.updateOne({ shortName: name }, { $set: { name, shortName: name, status: "active" } }, { upsert: true });
	}
}

async function seedUKUniversities() {
	const gb = await Country.findOne({ code: "GB" });
	if (!gb) return;
	const list = [
		{ name: "University of Winchester", applicationFees: "£ 28", initialDeposit: "£ 7000", ranking: 1201, internshipAvailable: "Yes", bridgingProgram: "No", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "Cardiff and Vale College", applicationFees: "£ 0", initialDeposit: "100 %", ranking: 201, internshipAvailable: "No", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "De Montfort University", applicationFees: "£ 0", initialDeposit: "50 %", ranking: 711, internshipAvailable: "Yes", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "Coventry University", applicationFees: "£ 0", initialDeposit: "100 %", ranking: 601, internshipAvailable: "Yes", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "St Andrews College", applicationFees: "£ 0", initialDeposit: "50 %", ranking: 113, internshipAvailable: "Yes", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "Canterbury Christ Church University", applicationFees: "£ 0", initialDeposit: "£ 5000", ranking: 1201, internshipAvailable: "Yes", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "University of Wales Trinity Saint David", applicationFees: "£ 0", initialDeposit: "100 %", ranking: "Yes", internshipAvailable: "No", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "University of Gloucestershire", applicationFees: "£ 0", initialDeposit: "£ 4000", ranking: 771, internshipAvailable: "Yes", bridgingProgram: "No", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "University of Roehampton", applicationFees: "£ 0", initialDeposit: "£ 4000", ranking: "No", internshipAvailable: "No", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
		{ name: "University of Greenwich", applicationFees: "£ 0", initialDeposit: "50 %", ranking: "No", internshipAvailable: "No", bridgingProgram: "Yes", scholarship: "Yes", currency: "GBP", symbol: "£" },
	];
	for (const u of list) {
		await University.updateOne(
			{ countryId: gb._id, name: u.name },
			{ $set: { countryId: gb._id, status: "active", ...u } },
			{ upsert: true }
		);
	}
}

async function main() {
	await connectToDatabase();
	await seedRoles();
	await seedAdmin();
	await seedLocations();
	await seedAcademics();
	await seedUKUniversities();
	console.log("Seed completed");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


