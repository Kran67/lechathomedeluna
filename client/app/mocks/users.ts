import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';

export const usersMock: User[] = [
    {
        id: "1",
        name: "Sandra  Daout",
        email: "admin@exemple.com",
        phone: "",
        city: "",
        roles: UserRole.Admin,
        lastName: '',
        address: '',
        blacklisted: false
    },
    {
        id: "2",
        name: "Sandra  Daout",
        email: "assistant@exemple.com",
        phone: "",
        city: "",
        roles: UserRole.Assistant,
        lastName: '',
        address: '',
        blacklisted: false
    },
    {
        id: "3",
        name: "Sandra  Daout",
        email: "faref@exemple.com",
        phone: "",
        city: "",
        roles: UserRole.HostFamily,
        lastName: '',
        address: '',
        blacklisted: false
    },
    {
        id: "4",
        name: "Sandra  Daout",
        email: "fa@exemple.com",
        phone: "",
        city: "",
        referrer_id: "3",
        roles: UserRole.HostFamily,
        lastName: '',
        address: '',
        blacklisted: false
    },
    {
        id: "5",
        name: "Sandra  Daout",
        email: "benevole@exemple.com",
        phone: "",
        city: "",
        roles: UserRole.Volunteer,
        lastName: '',
        address: '',
        blacklisted: false
    }
];