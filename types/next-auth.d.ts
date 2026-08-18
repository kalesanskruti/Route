import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      institutionId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    email: string;
    name: string;
    institutionId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    institutionId: string | null;
  }
}
