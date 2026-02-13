import { cache } from 'react';

import type { CatDocument } from '@/app/interfaces/cat';

/**
 * Récupère les informations d'un chat
 *
 * @async
 * @function getBySlug
 * @param {string} slug - Identifiant du chat
 * @returns {Promise<any>} - Un chat ou un objet { error: string }
 */
export const getBySlug = cache(async (slug: string) => {
    const data: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats/${slug}`, {
        method: "GET",
        cache: "no-store",
        headers: { 'Content-Type': 'application/json', }
    });
    return await data.json();
});

export const create = async (
    token: string | undefined,
    name: string,
    description: string,
    status: string | null,
    numIdentification: string | null,
    sex: string | null,
    dress: string | null,
    race: string | null,
    isSterilized: boolean | null,
    sterilizationDate: string | null,
    birthDate: string | null,
    isDuringVisit: boolean | null,
    isAdopted: boolean | null,
    adoptionDate: string | null,
    hostFamilyId: string | null,
    pictures: any
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                name,
                description,
                status,
                numIdentification,
                sex,
                dress,
                race,
                isSterilized,
                sterilizationDate,
                birthDate,
                isDuringVisit,
                isAdopted,
                adoptionDate,
                hostFamilyId
            }),
        });
        const result = await res.json();

        // upload des images
        pictures?.map(async (picture: any, idx: number) => {
            const formData = new FormData();
            formData.append("file", picture);
            formData.append("cat_id", result.id);
            
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, },
                body: formData
            });
        });

        return result;
    } catch (err) {
        console.error("Erreur lors de la création de la fiche du chat :", err);
        return null;
    }
}

export const update = async (
    token: string | undefined,
    slug: string,
    name: string,
    description: string,
    status: string | null,
    numIdentification: string | null,
    sex: string | null,
    dress: string | null,
    race: string | null,
    isSterilized: boolean | null,
    sterilizationDate: string | null,
    birthDate: string | null,
    isDuringVisit: boolean | null,
    isAdopted: boolean | null,
    adoptionDate: string | null,
    hostFamilyId: string | null,
    newPictures: any,
    picturesToDelete: string[] | null,
    newDocuments: CatDocument[],
    documentsToDelete: string[] | null
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                name,
                description,
                status,
                numIdentification,
                sex,
                dress,
                race,
                isSterilized,
                sterilizationDate,
                birthDate,
                isDuringVisit,
                isAdopted,
                adoptionDate,
                hostFamilyId
            }),
        });
        const result = await res.json();

        // upload des images
        if (picturesToDelete && picturesToDelete.length > 0) {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/images`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({ urls: picturesToDelete, context: "pictures" }),
            });
        }
        newPictures?.map(async (picture: any, idx: number) => {
            const formData = new FormData();
            formData.append("file", picture);
            formData.append("cat_id", result.id);
            formData.append("context", "pictures");
            
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, },
                body: formData
            });
        });

        // upload des vaccins
        if (documentsToDelete && documentsToDelete.length > 0) {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/images`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({ urls: documentsToDelete, context: "documents" }),
            });
        }
        newDocuments?.map(async (document: CatDocument) => {
            const formData = new FormData();
            formData.append("file", document.picture);
            formData.append("cat_id", result.id);
            formData.append("date", document.date);
            formData.append("type", document.type);
            formData.append("context", "documents");
            
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, },
                body: formData
            });
        });

        return result;
    } catch (err) {
        console.error("Erreur lors de la modification de la fiche du chat :", err);
        return null;
    }
}
