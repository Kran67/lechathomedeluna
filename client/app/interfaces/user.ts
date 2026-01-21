import { UserRole } from '@/app/enums/enums';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    idFARef?: string;
    blacklisted?: boolean;    
    picture: string;
    roles: UserRole[];
}