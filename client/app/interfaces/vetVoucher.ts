export interface VetVoucher {
    id: string;
    date: string;
    user_name: string;
    cat: { id:string, name: string };
    clinic: string;
    object: string;
    processed_on: string;
}
