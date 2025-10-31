import { Schema, model, models, type Model, Types } from "mongoose";

export interface StatusGroupDoc {
	name: string;
	description?: string;
	status: string;
}

const StatusGroupSchema = new Schema<StatusGroupDoc>({
	name: { type: String, required: true, unique: true, index: true },
	description: { type: String },
	status: { type: String, default: "active" },
}, { timestamps: true });

export const StatusGroup: Model<StatusGroupDoc> = models.StatusGroup || model<StatusGroupDoc>("StatusGroup", StatusGroupSchema);

export interface StatusDoc {
	statusGroupId: Types.ObjectId;
	name: string;
	color?: string;
	description?: string;
	status: string;
}

const StatusSchema = new Schema<StatusDoc>({
	statusGroupId: { type: Schema.Types.ObjectId, ref: "StatusGroup", required: true, index: true },
	name: { type: String, required: true },
	color: { type: String },
	description: { type: String },
	status: { type: String, default: "active" },
}, { timestamps: true });

StatusSchema.index({ statusGroupId: 1, name: 1 }, { unique: true });

export const Status: Model<StatusDoc> = models.Status || model<StatusDoc>("Status", StatusSchema);

