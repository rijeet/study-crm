import { Schema, model, models, type Model, Types } from "mongoose";

export interface NotificationDoc {
	recipientUserId: Types.ObjectId;
	type: string;
	payload: Record<string, unknown>;
	readAt?: Date | null;
	createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDoc>({
	recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	type: { type: String, required: true },
	payload: { type: Schema.Types.Mixed, required: true },
	readAt: { type: Date, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

NotificationSchema.index({ recipientUserId: 1, createdAt: -1 });

export const Notification: Model<NotificationDoc> = models.Notification || model<NotificationDoc>("Notification", NotificationSchema);


