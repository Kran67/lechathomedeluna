export interface User {
    id: string;
    name: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    role: string;
    email: string;
    blacklisted: boolean;
    referrer_id?: string;
}