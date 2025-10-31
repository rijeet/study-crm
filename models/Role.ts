import { Schema, model, models, type Model } from "mongoose";

export type PermissionKey =
	| "leads:create"
	| "leads:read"
	| "leads:update"
	| "leads:delete"
	| "users:manage"
	| "universities:manage"
	| "locations:manage"
	| "programs:manage"
	| "languagetests:manage"
	| "branches:manage"
	| "reports:read";

export interface RoleDoc {
	name: string;
	description?: string;
	permissions: PermissionKey[];
	createdAt: Date;
	updatedAt: Date;
}

const RoleSchema = new Schema<RoleDoc>(
	{
		name: { type: String, required: true, unique: true, index: true },
		description: { type: String },
		permissions: { type: [String], default: [] },
	},
	{ timestamps: true }
);

export const Role: Model<RoleDoc> = models.Role || model<RoleDoc>("Role", RoleSchema);


