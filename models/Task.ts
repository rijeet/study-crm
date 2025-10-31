import { Schema, model, models, type Model, Types } from "mongoose";

export interface TaskDoc {
	assignorId: Types.ObjectId;
	executorId: Types.ObjectId;
	duration?: string | null;
	description: string;
	status: "pending" | "in_progress" | "done" | "cancelled";
	createdAt: Date;
	updatedAt: Date;
}

const TaskSchema = new Schema<TaskDoc>({
	assignorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	executorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	duration: { type: String, default: null },
	description: { type: String, required: true },
	status: { type: String, default: "pending" },
}, { timestamps: true });

export const Task: Model<TaskDoc> = models.Task || model<TaskDoc>("Task", TaskSchema);


