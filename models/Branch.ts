import { Schema, model, models, type Model, Types } from "mongoose";

export interface BranchDoc {
	countryId: Types.ObjectId;
	stateId?: Types.ObjectId | null;
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	status: string;
}

const BranchSchema = new Schema<BranchDoc>({
	countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true },
	stateId: { type: Schema.Types.ObjectId, ref: "State", default: null, index: true },
	name: { type: String, required: true },
	phone: { type: String },
	email: { type: String },
	address: { type: String },
	status: { type: String, default: "active" },
}, { timestamps: true });

BranchSchema.index({ countryId: 1, name: 1 }, { unique: true });

export const Branch: Model<BranchDoc> = models.Branch || model<BranchDoc>("Branch", BranchSchema);


