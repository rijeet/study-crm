import { Schema, model, models, type Model, Types } from "mongoose";

export interface RefreshTokenDoc {
	userId: Types.ObjectId;
	tokenHash: string;
	fingerprint?: string | null;
	expiresAt: Date;
	createdAt: Date;
	rotatedAt?: Date | null;
	invalidated: boolean;
}

const RefreshTokenSchema = new Schema<RefreshTokenDoc>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		tokenHash: { type: String, required: true, index: true },
		fingerprint: { type: String, default: null },
		expiresAt: { type: Date, required: true, index: true },
		rotatedAt: { type: Date, default: null },
		invalidated: { type: Boolean, default: false },
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

RefreshTokenSchema.index({ userId: 1, tokenHash: 1 }, { unique: true });

export const RefreshToken: Model<RefreshTokenDoc> =
	models.RefreshToken || model<RefreshTokenDoc>("RefreshToken", RefreshTokenSchema);


