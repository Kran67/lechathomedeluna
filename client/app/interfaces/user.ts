export interface User {
    id: string;
    name: string;
    lastName: string;
    social_number?: string;
    phone: string;
    address: string;
    city: string;
    roles: string;
    email: string;
    blacklisted: boolean;
    referrer_id?: string;
    capacity?: string;
}