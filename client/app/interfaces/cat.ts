import { HostFamily } from '@/app/interfaces/hostFamily';

type catSex = "Mâle" | "Femelle";
type catStatus = "negatif" | "positif" | "non testé";

export interface CatDocument {
    id: string;
    cat_id: string;
    date: string;
    picture: any;
    type: "vaccin" | "antiparasitaire" | "examen";
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
    isAdoptable?: boolean;
    adoptionDate?: string;
    hostFamily?: HostFamily;
    documents: CatDocument[];
    pictures: string[];
}