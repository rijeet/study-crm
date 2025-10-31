import { connectToDatabase } from "@/lib/db/mongoose";
import { Role } from "@/models/Role";
import { User } from "@/models/User";

/**
 * Resolves effective permissions for a user by merging role permissions with user-specific permissions.
 * 
 * @param userId - The user's ID
 * @returns Array of effective permissions (role permissions + user permissions, merged)
 * 
 * How it works:
 * 1. Gets the user's role from the database
 * 2. Fetches the role's default permissions
 * 3. Merges with user's personal permissions (user permissions act as additions)
 * 4. Returns merged set of permissions (removes duplicates)
 */
export async function resolveUserPermissions(userId: string | any): Promise<string[]> {
	await connectToDatabase();
	
	// Get user (with role)
	const user = await User.findById(userId).select('role permissions');
	
	if (!user) {
		throw new Error('User not found');
	}

	// Get role permissions
	const role = await Role.findOne({ name: user.role }).select('permissions');
	const rolePermissions = role?.permissions || [];

	// Get user-specific permissions (overrides/additions)
	const userPermissions = user.permissions || [];

	// Merge: role permissions + user permissions
	// Using Set to automatically remove duplicates
	const allPermissions = new Set([...rolePermissions, ...userPermissions]);

	return Array.from(allPermissions);
}

/**
 * Resolves permissions for a user object that already has role and permissions loaded.
 * Use this when you already have the role data.
 */
export function mergePermissions(rolePermissions: string[] = [], userPermissions: string[] = []): string[] {
	const merged = new Set([...rolePermissions, ...userPermissions]);
	return Array.from(merged);
}

