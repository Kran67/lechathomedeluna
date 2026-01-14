import { HostFamily } from "@/app/interfaces/hostFamily";

type catSex = "Mâle" | "Femelle";
type catStatus = "negatif" | "positif";

export interface Cat {
    id: string;
    description?: string;
    name: string;
    status: catStatus;
    numIdentification?: string;
    sex: catSex;
    dress: string;
    isSterilized?: boolean;
    sterilizationDate?: Date;
    age: number;
    isAdopted?: boolean;
    adoptionDate?: Date;
    hostFamily?: HostFamily;
    cover?: string;
    vaccines: string[];
    pictures: string[]
}