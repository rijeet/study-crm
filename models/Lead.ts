import { Schema, model, models, type Model, Types } from "mongoose";

export interface LeadStatusEvent { status: string; at: Date; by?: Types.ObjectId | null; note?: string }

export interface LeadDoc {
	studentId: string;
	name: string;
	phone?: string;
	email?: string;
	reference?: string;
	// location + destination
	destinationCountryId?: Types.ObjectId | null;
	stateId?: Types.ObjectId | null;
	cityId?: Types.ObjectId | null;
	// academics
	programId?: Types.ObjectId | null;
	langTestId?: Types.ObjectId | null;
	intake?: string | null;
	academicDetails?: { details?: string | null };
	// finance + situation
	financialSituation?: string | null;
	situation?: string | null;
	// appointments
	appointmentAt?: Date | null;
	statusHistory: LeadStatusEvent[];
	assignedToUserId?: Types.ObjectId | null;
	// allocation pointers
	currentBranchId?: Types.ObjectId | null;
	currentBmUserId?: Types.ObjectId | null;
	currentConsultantUserId?: Types.ObjectId | null;
	juniorConsultantId?: Types.ObjectId | null;
	juniorReceivedAt?: Date | null;
	seniorConsultantId?: Types.ObjectId | null;
	seniorReceivedAt?: Date | null;
	createdBy?: Types.ObjectId | null;
	// registration immutability
	immutableAfterRegistration?: boolean;
	duplicates?: Types.ObjectId[];
	remarks?: string | null;
}

const LeadSchema = new Schema<LeadDoc>({
	studentId: { type: String, required: true, unique: true, index: true },
	name: { type: String, required: true },
	phone: { type: String },
	email: { type: String },
	reference: { type: String },
	destinationCountryId: { type: Schema.Types.ObjectId, ref: "Country", default: null },
	stateId: { type: Schema.Types.ObjectId, ref: "State", default: null },
	cityId: { type: Schema.Types.ObjectId, ref: "City", default: null },
	programId: { type: Schema.Types.ObjectId, ref: "Program", default: null },
	langTestId: { type: Schema.Types.ObjectId, ref: "LanguageTest", default: null },
	intake: { type: String, default: null },
	academicDetails: { type: Object, default: {} },
	financialSituation: { type: String, default: null },
	situation: { type: String, default: null },
	appointmentAt: { type: Date, default: null },
	statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: { type: Schema.Types.ObjectId, ref: "User", default: null }, note: String }],
	assignedToUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	currentBranchId: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
	currentBmUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	currentConsultantUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	juniorConsultantId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	juniorReceivedAt: { type: Date, default: null },
	seniorConsultantId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	seniorReceivedAt: { type: Date, default: null },
	createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
	immutableAfterRegistration: { type: Boolean, default: true },
	duplicates: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
	remarks: { type: String, default: null },
}, { timestamps: true });

LeadSchema.index({ email: 1 }, { sparse: true });
LeadSchema.index({ phone: 1 }, { sparse: true });
LeadSchema.index({ currentBranchId: 1 });
LeadSchema.index({ currentConsultantUserId: 1 });

export const Lead: Model<LeadDoc> = models.Lead || model<LeadDoc>("Lead", LeadSchema);


