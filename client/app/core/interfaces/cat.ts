import { HostFamily } from '@/app/core/interfaces/hostFamily';

type catSex = "Mâle" | "Femelle";
type catStatus = "negatif" | "positif" | "non testé";

export interface CatDocument {
    id: string;
    cat_id: string;
    date: string;
    picture: any;
    type: "vaccin" | "antiparasitaire" | "examen";
    fileName?: string;
    mimeType?: string;
    size?: number;
}

export interface Cat {
    id: string;
    slug: string;
    description?: string;
    name: string;
    statusFiv?: catStatus;
    statusFelv?: catStatus;
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
    favoriteCount: number;
    preVisitDate?: string;
    entryDate?: string;
    provenance?: string;
    destination?: string;
}