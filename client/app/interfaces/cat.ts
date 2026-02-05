import { HostFamily } from '@/app/interfaces/hostFamily';

type catSex = "Mâle" | "Femelle";
type catStatus = "negatif" | "positif" | "non testé";

export interface Vaccine {
    id: string;
    cat_id: string;
    date: string;
    picture: any;
}

export interface Cat {
    id: string;
    slug: string;
    description?: string;
    name: string;
    status?: catStatus;
    numIdentification?: string;
    sex?: catSex;
    dress?: string;
    race?: string;
    isSterilized?: boolean;
    sterilizationDate?: string;
    birthDate?: string;
    isDuringVisit?: boolean;
    isAdopted?: boolean;
    adoptionDate?: string;
    hostFamily?: HostFamily;
    vaccines: Vaccine[];
    pictures: string[];
}