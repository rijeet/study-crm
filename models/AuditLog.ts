import { Schema, model, models, type Model, Types } from "mongoose";

export interface AuditLogDoc {
	actorId?: Types.ObjectId | null;
	action: string;
	target?: string | null; // e.g., collection/id
	meta?: Record<string, unknown>;
	createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDoc>({
	actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
	action: { type: String, required: true },
	target: { type: String, default: null },
	meta: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AuditLog: Model<AuditLogDoc> = models.AuditLog || model<AuditLogDoc>("AuditLog", AuditLogSchema);


