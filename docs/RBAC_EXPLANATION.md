# Role-Based Access Control (RBAC) - Permission System

## Current Issue

Both **Users** and **Roles** have a `permissions` field, but currently **only User permissions are used**. This is inefficient and doesn't leverage the role-based system properly.

## Why Both Should Exist (Design Intent)

### 1. **Role Permissions** (Base/Template)
- **Purpose**: Define the **default permissions** for a role
- **Example**: All "Consultant" role users get `["leads:read", "leads:update", "universities:view"]`
- **Benefit**: Easy to update permissions for ALL users of a role at once

### 2. **User Permissions** (Overrides/Additions)
- **Purpose**: **Individual user permission overrides** beyond their role
- **Use Cases**:
  - Give a Consultant extra permissions: `["reports:read"]` 
  - Temporarily restrict a user: Remove `["leads:delete"]` even if role has it
  - Grant special access to specific users

## How It Should Work

```
Final User Permissions = Role Permissions + User Permissions (merged)
```

**Example:**
- Role "Consultant" has: `["leads:read", "leads:update"]`
- User "John" has personal permissions: `["reports:read"]`
- **John's effective permissions**: `["leads:read", "leads:update", "reports:read"]`

## Current Problem

The system currently **only uses `user.permissions`** and **ignores `role.permissions`**:

- Login endpoint only reads `user.permissions`
- No merging logic exists
- Role permissions are stored but never used

## Solution (IMPLEMENTED)

1. **Merge permissions on login**: `role.permissions + user.permissions`
2. **User permissions act as additions**, not replacements
3. **Use Set to avoid duplicates** when merging
4. **Store merged permissions in JWT token**

### Implementation Details

- **`lib/auth/resolve-permissions.ts`**: New helper function that:
  - Fetches user's role
  - Gets role's default permissions
  - Merges with user's personal permissions
  - Returns combined array
  
- **Updated endpoints**:
  - `app/api/v1/auth/login/route.ts` - Now resolves permissions on login
  - `app/api/v1/auth/refresh/route.ts` - Now resolves permissions on refresh

### How It Works Now

1. **User logs in** → System fetches user's role
2. **Gets role permissions** → From `Role` collection
3. **Gets user permissions** → From `User.permissions` field
4. **Merges them** → `new Set([...rolePerms, ...userPerms])`
5. **Stores in JWT** → Token contains effective permissions

### Example Flow

```javascript
// Role "Consultant" in database
{ name: "Consultant", permissions: ["leads:read", "leads:update"] }

// User "John" in database
{ role: "Consultant", permissions: ["reports:read"] }

// After login, John's JWT token contains:
{ permissions: ["leads:read", "leads:update", "reports:read"] }
```

## Benefits

- ✅ **Easier management**: Update role = update all users (on next login)
- ✅ **Flexibility**: Override specific users when needed
- ✅ **Consistency**: All users of a role start with same permissions
- ✅ **Audit trail**: Role changes affect all users automatically
- ✅ **Efficient**: No need to manually update every user

