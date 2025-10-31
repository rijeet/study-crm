import { Schema, model, models, type Model, Types } from "mongoose";

export interface UniversityDoc {
	countryId: Types.ObjectId;
	name: string;
	applicationFees?: string | number;
	initialDeposit?: string | number;
	ranking?: number | string;
	internshipAvailable?: boolean | string;
	bridgingProgram?: boolean | string;
	scholarship?: boolean | string;
	currency?: string;
	symbol?: string;
	status: string;
	metadata?: Record<string, unknown>;
}

const UniversitySchema = new Schema<UniversityDoc>({
	countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true },
	name: { type: String, required: true },
	applicationFees: { type: Schema.Types.Mixed },
	initialDeposit: { type: Schema.Types.Mixed },
	ranking: { type: Schema.Types.Mixed },
	internshipAvailable: { type: Schema.Types.Mixed },
	bridgingProgram: { type: Schema.Types.Mixed },
	scholarship: { type: Schema.Types.Mixed },
	currency: { type: String },
	symbol: { type: String },
	status: { type: String, default: "active" },
	metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

UniversitySchema.index({ countryId: 1, name: 1 }, { unique: true });

export const University: Model<UniversityDoc> = models.University || model<UniversityDoc>("University", UniversitySchema);


