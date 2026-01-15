import { User } from "@/app/interfaces/user";
import { UserRole } from "@/app/enums/enums";

export const usersMock: User[] = [
    { id: "1", name: "Sandra  Daout", email: "admin@exemple.com", picture: "", role: UserRole.Admin },
    { id: "1", name: "Sandra  Daout", email: "fa@exemple.com", picture: "", role: UserRole.HostFamily },
    { id: "1", name: "Sandra  Daout", email: "visitor@exemple.com", picture: "", role: UserRole.Visitor },
];