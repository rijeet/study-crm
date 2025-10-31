import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Role } from "@/models/Role";
import { User } from "@/models/User";
import { Country, State, City } from "@/models/Location";
import { Program, LanguageTest } from "@/models/Academic";
import { University } from "@/models/University";
import { Branch } from "@/models/Branch";
import { Lead } from "@/models/Lead";
import { LeadAllocation } from "@/models/LeadAllocation";
import { Notification } from "@/models/Notification";
import { SecurityDeposit, ServiceCharge } from "@/models/Account";
import { Task } from "@/models/Task";
import { StatusGroup, Status } from "@/models/Status";

async function upsertRole(name: string, permissions: string[], description?: string) {
	await Role.updateOne(
		{ name },
		{ $set: { name, permissions, description } },
		{ upsert: true }
	);
}

async function seedRoles() {
	await upsertRole("Admin", ["*"], "System superuser with all permissions");
	await upsertRole(
		"DatabaseManager",
		[
			"leads:create",
			"leads:read",
			"leads:update",
			"allocation:to_bm",
			"universities:manage",
			"users:read",
			"branches:read",
			"reports:read",
			"dashboard:system",
		],
		"Manages leads data and allocations to Branch Managers"
	);
	await upsertRole(
		"BranchManager",
		[
			"leads:read",
			"leads:update",
			"allocation:to_consultant",
			"universities:view",
			"dashboard:branch",
		],
		"Manages branch consultants and allocates leads to consultants"
	);
	await upsertRole(
		"Consultant",
		[
			"leads:read",
			"leads:update",
			"universities:view",
			"dashboard:consultant",
		],
		"Verifies and updates assigned leads"
	);
	await upsertRole(
		"DataEntry",
		[
			"universities:manage",
			"leads:update_basic",
		],
		"Handles university and basic lead data entry"
	);
	await upsertRole(
		"Lead",
		[
			"self:register",
			"self:view",
		],
		"External student user"
	);
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

async function seedBranches() {
    const bd = await Country.findOne({ code: "BD" });
    if (!bd) return;
    const branches = [
        { name: "Dhaka Branch", phone: "+8801700000000", email: "dhaka@example.com", address: "Dhaka", countryId: bd._id },
        { name: "Chattogram Branch", phone: "+8801800000000", email: "ctg@example.com", address: "Chattogram", countryId: bd._id },
    ];
    for (const b of branches) {
        await Branch.updateOne({ countryId: b.countryId, name: b.name }, { $set: { ...b, status: "active" } }, { upsert: true });
    }
}

async function seedUsersData() {
    const passwordHash = await bcrypt.hash("Password@123", 12);
    const branches = await Branch.find({});
    if (branches.length === 0) return;
    const dhaka = branches[0];
    const ctg = branches[1] || branches[0];

    const users = [
        { firstName: "Dina", lastName: "Manager", email: "dm@example.com", role: "DatabaseManager", branchId: null },
        { firstName: "Bashir", lastName: "BM", email: "bm.dhaka@example.com", role: "BranchManager", branchId: dhaka._id },
        { firstName: "Chawdhury", lastName: "BM", email: "bm.ctg@example.com", role: "BranchManager", branchId: ctg._id },
        { firstName: "Riya", lastName: "Consultant", email: "consultant.riya@example.com", role: "Consultant", branchId: dhaka._id },
        { firstName: "Sajib", lastName: "Consultant", email: "consultant.sajib@example.com", role: "Consultant", branchId: ctg._id },
        { firstName: "Data", lastName: "Entry", email: "data.entry@example.com", role: "DataEntry", branchId: dhaka._id },
    ];
    for (const u of users) {
        await User.updateOne(
            { email: u.email },
            { $setOnInsert: { ...u, passwordHash, isActive: true } },
            { upsert: true }
        );
    }
}

function randomOf<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

async function seedLeadsAndAllocations() {
    const [countries, programs, users, branches] = await Promise.all([
        Country.find({}),
        Program.find({}),
        User.find({ isActive: true }),
        Branch.find({}),
    ]);
    if (countries.length === 0 || programs.length === 0 || users.length === 0) return;
    const bms = users.filter(u=>u.role==="BranchManager");
    const consultants = users.filter(u=>u.role==="Consultant");
    const dm = users.find(u=>u.role==="DatabaseManager");

    for (let i=0;i<20;i++) {
        const name = `Student ${1000+i}`;
        const phone = `017${String(10000000+i).slice(0,7)}`;
        const email = `student${i}@example.com`;
        const lead = await Lead.create({
            studentId: String(Math.floor(10000000+Math.random()*90000000)),
            name, phone, email,
            destinationCountryId: randomOf(countries)._id,
            programId: randomOf(programs)._id,
            statusHistory: [{ status: "registered", at: new Date(), by: null }],
        });
        // allocate to BM
        const bm = randomOf(bms);
        await Lead.updateOne({ _id: lead._id }, { $set: { currentBranchId: bm.branchId, currentBmUserId: bm._id }, $push: { statusHistory: { status: "allocated_bm", at: new Date(), by: dm?._id || null } } });
        await LeadAllocation.create({ leadId: lead._id, fromUserId: dm?._id || null as any, fromRole: dm?"DatabaseManager":"Admin", toUserId: bm._id, toRole: "BranchManager" });
        await Notification.create({ recipientUserId: bm._id, type: "lead_assigned_dm_to_bm", payload: { leadId: lead._id } });
        // allocate to consultant
        const consultantsInBranch = consultants.filter(c=>String(c.branchId||"")===String(bm.branchId));
        const cons = consultantsInBranch.length? randomOf(consultantsInBranch) : randomOf(consultants);
        await Lead.updateOne({ _id: lead._id }, { $set: { currentConsultantUserId: cons._id }, $push: { statusHistory: { status: "allocated_consultant", at: new Date(), by: bm._id } } });
        await LeadAllocation.create({ leadId: lead._id, fromUserId: bm._id as any, fromRole: "BranchManager", toUserId: cons._id as any, toRole: "Consultant" });
        await Notification.create({ recipientUserId: cons._id as any, type: "lead_assigned_bm_to_consultant", payload: { leadId: lead._id, byUserId: bm._id } });
        // sometimes verify
        if (Math.random() > 0.5) {
            await Lead.updateOne({ _id: lead._id }, { $push: { statusHistory: { status: "verified", at: new Date(), by: cons._id } } });
        }
    }
}

async function seedAccountsAndTasks() {
    const users = await User.find({ isActive: true });
    const consultants = users.filter(u=>u.role==="Consultant");
    for (let i=0;i<5;i++) {
        const mentor = randomOf(consultants);
        await SecurityDeposit.create({ mentorId: mentor._id as any, studentName: `SD Student ${i}`, amount: 1000 + i*100, status: i%2?"pending":"received" });
        await ServiceCharge.create({ mentorId: mentor._id as any, studentName: `SC Student ${i}`, amount: 500 + i*50, status: i%2?"pending":"received" });
    }
    const bm = users.find(u=>u.role==="BranchManager");
    const cons = consultants[0];
    if (bm && cons) {
        await Task.create({ assignorId: bm._id as any, executorId: cons._id as any, description: "Follow up with 5 leads", status: "in_progress" });
    }
}

async function seedStatusGroupsAndStatuses() {
    const groups = [
        { name: "consultant", description: "Student contact and Decided university Application" },
        { name: "admission", description: "Application university & offer letter collect" },
        { name: "compliance", description: "Student interview manage and enrollment" },
    ];
    for (const g of groups) {
        await StatusGroup.updateOne({ name: g.name }, { $set: { ...g, status: "active" } }, { upsert: true });
    }
    const consultantGroup = await StatusGroup.findOne({ name: "consultant" });
    const admissionGroup = await StatusGroup.findOne({ name: "admission" });
    const complianceGroup = await StatusGroup.findOne({ name: "compliance" });
    if (!consultantGroup || !admissionGroup || !complianceGroup) return;
    const consultantStatuses = [
        { name: "No Answer" },
        { name: "Follow UP" },
        { name: "Not Interested" },
        { name: "Will Visit" },
        { name: "Busy" },
        { name: "Switched Off" },
        { name: "Call Again" },
        { name: "Not Eligible" },
        { name: "Wrong Number" },
        { name: "Working with other Agent" },
        { name: "Decision Pending" },
        { name: "Interested For Job Visa" },
        { name: "Waiting For English Test" },
        { name: "Apply" },
        { name: "Other Country" },
        { name: "Visited" },
        { name: "Will provide Document" },
        { name: "Stuck" },
        { name: "Document Submitted" },
    ];
    const admissionStatuses = [
        { name: "Pending", color: "#f43f5e" },
        { name: "Ready to Apply", color: "#22c55e" },
        { name: "Waiting for Document", color: "#a16207" },
        { name: "Submitted to the Portal", color: "#6b7280" },
        { name: "Submitted to the University / Applied", color: "#2563eb" },
        { name: "Conditional Offer Letter", color: "#7c3aed" },
        { name: "Unconditional Offer Letter", color: "#b91c1c" },
        { name: "Rejected", color: "#f59e0b" },
        { name: "Canceled", color: "#e879f9" },
    ];
    const complianceStatuses = [
        { name: "Collecting Document" },
        { name: "Biometrics Booked" },
        { name: "VISA Applied" },
        { name: "VISA Rejected" },
        { name: "VISA Approved" },
        { name: "Visa Interview" },
        { name: "Enrolled" },
        { name: "Did Not Enroll" },
        { name: "Class Attended" },
        { name: "Class Not Attended" },
    ];
    for (const s of consultantStatuses) {
        await Status.updateOne({ statusGroupId: consultantGroup._id, name: s.name }, { $set: { ...s, statusGroupId: consultantGroup._id, status: "active" } }, { upsert: true });
    }
    for (const s of admissionStatuses) {
        await Status.updateOne({ statusGroupId: admissionGroup._id, name: s.name }, { $set: { ...s, statusGroupId: admissionGroup._id, status: "active" } }, { upsert: true });
    }
    for (const s of complianceStatuses) {
        await Status.updateOne({ statusGroupId: complianceGroup._id, name: s.name }, { $set: { ...s, statusGroupId: complianceGroup._id, status: "active" } }, { upsert: true });
    }
}

async function main() {
	await connectToDatabase();
	await seedRoles();
	await seedAdmin();
	await seedLocations();
	await seedAcademics();
	await seedUKUniversities();
    await seedBranches();
    await seedUsersData();
    await seedLeadsAndAllocations();
    await seedAccountsAndTasks();
    await seedStatusGroupsAndStatuses();
	console.log("Seed completed");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


