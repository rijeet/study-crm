import { Schema, model, models, type Model, Types } from "mongoose";

export interface LeadAllocationDoc {
	leadId: Types.ObjectId;
	fromUserId: Types.ObjectId | null;
	fromRole: string;
	toUserId: Types.ObjectId;
	toRole: string;
	createdAt: Date;
}

const LeadAllocationSchema = new Schema<LeadAllocationDoc>({
	leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
	fromUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	fromRole: { type: String, required: true },
	toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	toRole: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

LeadAllocationSchema.index({ toUserId: 1, createdAt: -1 });

export const LeadAllocation: Model<LeadAllocationDoc> = models.LeadAllocation || model<LeadAllocationDoc>("LeadAllocation", LeadAllocationSchema);


