import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            role: UserRole
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: UserRole
    }
} 