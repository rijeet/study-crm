import { Schema, model, models, type Model, Types } from "mongoose";

export interface SecurityDepositDoc {
	mentorId: Types.ObjectId;
	studentName: string;
	paymentType?: string | null;
	depositType?: string | null;
	depositDate?: Date | null;
	receivedDate?: Date | null;
	note?: string | null;
	amount: number;
	status?: string | null;
}

const SecurityDepositSchema = new Schema<SecurityDepositDoc>({
	mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	studentName: { type: String, required: true },
	paymentType: { type: String, default: null },
	depositType: { type: String, default: null },
	depositDate: { type: Date, default: null },
	receivedDate: { type: Date, default: null },
	note: { type: String, default: null },
	amount: { type: Number, required: true },
	status: { type: String, default: "pending" },
}, { timestamps: true });

export const SecurityDeposit: Model<SecurityDepositDoc> = models.SecurityDeposit || model<SecurityDepositDoc>("SecurityDeposit", SecurityDepositSchema);

export interface ServiceChargeDoc {
	mentorId: Types.ObjectId;
	studentName: string;
	country?: string | null;
	university?: string | null;
	paymentType?: string | null;
	paymentDate?: Date | null;
	receivedDate?: Date | null;
	amount: number;
	status?: string | null;
}

const ServiceChargeSchema = new Schema<ServiceChargeDoc>({
	mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	studentName: { type: String, required: true },
	country: { type: String, default: null },
	university: { type: String, default: null },
	paymentType: { type: String, default: null },
	paymentDate: { type: Date, default: null },
	receivedDate: { type: Date, default: null },
	amount: { type: Number, required: true },
	status: { type: String, default: "pending" },
}, { timestamps: true });

export const ServiceCharge: Model<ServiceChargeDoc> = models.ServiceCharge || model<ServiceChargeDoc>("ServiceCharge", ServiceChargeSchema);


