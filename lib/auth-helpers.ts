import { Session } from "next-auth";
import { Role } from "@prisma/client";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

/**
 * Validates that the active session belongs to one of the allowed roles.
 * Throws an AuthError if validation fails, otherwise returns the authenticated user's session data.
 */
export function requireRole(session: Session | null, allowedRoles: Role[]) {
  if (!session || !session.user) {
    throw new AuthError("Unauthorized: Authentication required", 401);
  }

  const userRole = session.user.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new AuthError("Forbidden: Insufficient permissions", 403);
  }

  return session.user;
}
