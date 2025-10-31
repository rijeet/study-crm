import { Schema, model, models, type Model, Types } from "mongoose";

export type UserRoleName =
	| "Admin"
	| "BranchManager"
	| "Marketer"
	| "JuniorConsultant"
	| "SeniorConsultant"
	| "Admission"
	| "Accounts";

export interface UserDoc {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	phone?: string;
	branchId?: Types.ObjectId | null;
	isActive: boolean;
	role: UserRoleName;
	permissions?: string[];
	lastLogin?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
	{
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		phone: { type: String },
		branchId: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
		isActive: { type: Boolean, default: true },
		role: { type: String, required: true },
		permissions: { type: [String], default: [] },
		lastLogin: { type: Date, default: null },
	},
	{ timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<UserDoc> = models.User || model<UserDoc>("User", UserSchema);


