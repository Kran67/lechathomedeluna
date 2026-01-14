import { User } from "@/app/interfaces/user";
import { UserRole } from "@/app/enums/enums";

export const usersMock: User[] = [
    { id: "1", name: "Sandra  Daout", email: "dr.daout@gmail.com", picture: "", role: UserRole.Admin },
];