import type { Role } from "@/types/auth";

const ROLE_ACCESS: Record<string, Role[]> = {
  "/admin": ["ADMIN"],
  "/inventory": ["ADMIN", "STOREKEEPER"],
  "/distribution": ["ADMIN", "STOREKEEPER"],
  "/reports": ["ADMIN", "STOREKEEPER", "VIEWER"],
  "/dashboard": ["ADMIN", "STOREKEEPER", "VIEWER"],
  "/": ["ADMIN", "STOREKEEPER", "VIEWER"],
};

function getRoleForPath(pathname: string): Role[] | null {
  const entries = Object.entries(ROLE_ACCESS);
  const exact = entries.find(([path]) => pathname === path);
  if (exact) return exact[1];
  const prefix = entries
    .filter(([path]) => path !== "/" && pathname.startsWith(path + "/"))
    .sort(([a], [b]) => b.length - a.length)[0];
  return prefix ? ROLE_ACCESS[prefix[0]] : null;
}

export function isPathProtected(pathname: string): boolean {
  return getRoleForPath(pathname) !== null;
}

export function canAccess(pathname: string, role: Role | undefined): boolean {
  const allowedRoles = getRoleForPath(pathname);
  if (!allowedRoles) return true; // public or unknown path
  if (!role) return false;
  return allowedRoles.includes(role);
}
