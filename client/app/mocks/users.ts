import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';

export const usersMock: User[] = [
    {
        id: "1",
        name: "Sandra  Daout",
        email: "admin@exemple.com",
        phone: "",
        city: "",
        role: UserRole.Admin,
        lastName: '',
        address: '',
        blacklisted: 0
    },
    {
        id: "2",
        name: "Sandra  Daout",
        email: "assistant@exemple.com",
        phone: "",
        city: "",
        role: UserRole.Assistant,
        lastName: '',
        address: '',
        blacklisted: 0
    },
    {
        id: "3",
        name: "Sandra  Daout",
        email: "faref@exemple.com",
        phone: "",
        city: "",
        role: UserRole.HostFamily,
        lastName: '',
        address: '',
        blacklisted: 0
    },
    {
        id: "4",
        name: "Sandra  Daout",
        email: "fa@exemple.com",
        phone: "",
        city: "",
        referrer_id: "3",
        role: UserRole.HostFamily,
        lastName: '',
        address: '',
        blacklisted: 0
    },
    {
        id: "5",
        name: "Sandra  Daout",
        email: "benevole@exemple.com",
        phone: "",
        city: "",
        role: UserRole.Volunteer,
        lastName: '',
        address: '',
        blacklisted: 0
    }
];