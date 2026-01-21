import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';

export const usersMock: User[] = [
    {
        id: "1",
        name: "Sandra  Daout",
        email: "admin@exemple.com",
        password: "",
        phone: "",
        city: "",
        picture: "",
        roles: [UserRole.Admin]
    },
    {
        id: "2",
        name: "Sandra  Daout",
        email: "assistant@exemple.com",
        password: "",
        phone: "",
        city: "",
        picture: "",
        roles: [UserRole.Assistant]
    },
    {
        id: "3",
        name: "Sandra  Daout",
        email: "faref@exemple.com",
        password: "",
        phone: "",
        city: "",
        picture: "",
        roles: [UserRole.HostFamily]
    },
    {
        id: "4",
        name: "Sandra  Daout",
        email: "fa@exemple.com",
        password: "",
        phone: "",
        city: "",
        picture: "",
        idFARef: "3",
        roles: [UserRole.HostFamily]
    },
    {
        id: "5",
        name: "Sandra  Daout",
        email: "benevole@exemple.com",
        password: "",
        phone: "",
        city: "",
        picture: "",
        roles: [UserRole.Volunteer]
    }
];