export const PERMISSIONS = [
	"leads:create",
	"leads:read",
	"leads:update",
	"leads:delete",
	"users:manage",
	"universities:manage",
	"locations:manage",
	"programs:manage",
	"languagetests:manage",
	"branches:manage",
	"reports:read",
] as const;

export type Permission = typeof PERMISSIONS[number];


