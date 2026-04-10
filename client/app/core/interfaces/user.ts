export interface User {
    id: string;
    name: string;
    lastName: string;
    placeOfBirth?: string;
    phone: string;
    address: string;
    city: string;
    roles: string;
    email: string;
    blacklisted: boolean;
    referrer_id?: string;
    capacity?: string;
    postalCode?: string;
    cityId?: string;
    birthDate?: string;
}