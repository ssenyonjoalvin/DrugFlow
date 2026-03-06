import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STOREKEEPER" | "VIEWER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "STOREKEEPER" | "VIEWER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STOREKEEPER" | "VIEWER";
  }
}

export type Role = "ADMIN" | "STOREKEEPER" | "VIEWER";
