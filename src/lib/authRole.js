"use client";

export function isAdminUser(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (typeof user.role === "string") return user.role.toLowerCase() === "admin";
  if (Array.isArray(user.roles)) {
    return user.roles.some((role) => String(role).toLowerCase() === "admin");
  }
  return false;
}
