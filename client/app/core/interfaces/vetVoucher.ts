export interface VetVoucher {
    id: string;
    date: string;
    appointmentDate: string;
    user_name: string;
    cat: { id:string, name: string, numId?: string, slug: string };
    clinic: string;
    object: string;
    processed_on: string;
    comment: string;
}
