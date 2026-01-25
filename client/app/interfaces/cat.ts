import { HostFamily } from '@/app/interfaces/hostFamily';

type catSex = "Mâle" | "Femelle";
type catStatus = "negatif" | "positif" | "non testé";

export interface Vaccine {
    id: number;
    cat_id: number;
    date: Date;
    pictures: string[]
}

export interface Cat {
    id: number;
    slug: string;
    description?: string;
    name: string;
    status?: catStatus;
    numIdentification?: string;
    sex?: catSex;
    dress?: string;
    race?: string;
    isSterilized?: boolean;
    sterilizationDate?: Date;
    birthday?: string;
    isDuringVisit?: boolean;
    isAdopted?: boolean;
    adoptionDate?: string;
    hostFamily?: HostFamily;
    vaccines: Vaccine[];
    pictures: string[]
}