import { UserRole } from "@/app/enums/enums";

export interface User {
    id: string;
    email?: string;
    name: string;
    picture: string;
    role: UserRole;
}