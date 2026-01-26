export interface User {
    id: string;
    name: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    role: string;
    email: string;
    blacklisted: number;
    referrer_id?: string;
}