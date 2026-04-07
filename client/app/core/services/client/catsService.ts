import { useState } from 'react';

import type { Cat } from '@/app/core/interfaces/cat';

/**
 * Permet de récupèrer les chats depuis la base de données
 * 
 * @function catService
 * @returns { cats: Cat[] | null, loading: boolean, refresh: any, error: boolean }
 */
export function catsService(type: "adopted" | "adoptable" | undefined, numIdOrName?: string, year: number = 0, hostFamilyId: string | undefined = undefined): { cats: Cat[] | null, loading: boolean, refresh: any, error: boolean } {
    const [cats, setCats] = useState<Cat[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats`;
            if (type === "adopted") {
                url+=`adopted/${year}`;
            } else if (type === "adoptable") {
                url+="adoptable";
            } else if (hostFamilyId) {
                url+=`Mine/${hostFamilyId}`;
            }

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json', }
            });

            if (!res.ok) {
                setCats(null);
                setError(true);
                return;
            }

            const data = await res.json();
            if (numIdOrName) {
                const filteredCats = data.filter((cat: Cat) => cat.numIdentification?.includes(numIdOrName) || cat.name.toLowerCase().includes(numIdOrName));
                setCats(filteredCats);
                return;
            }

            setCats(data);
        } catch (err) {
            console.error("Erreur fetch cats:", err);
            setCats(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return { cats, loading, refresh, error };
}

export const getFACatNotFullyCompletedCount = async (
    token: string,
    id: string | null
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facatnotfullycompletedcount${id ? "/" + id : ""}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getFACatNotFullyCompletedList = async (
    token: string,
    id: string | null
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facatnotfullycompletedlist${id ? "/" + id : ""}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getAdoptedCatNotFullyCompletedCount = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adoptedcatnotfullycompletedcount`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getAdoptedCatNotFullyCompletedList = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adoptedcatnotfullycompletedlist`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getHasPreVisitWithoutDateList = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hasprevisitwithoutdatelist`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getAdoptedCount = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/adoptedcount`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const createAdoptionRequest = async (
    catId: string,
    lastName: string,
    firstName: string,
    email: string,
    facebook: string,
    lifePlace: string,
    area: string,
    isOutsideAccess: boolean,
    householdPeopleNumber: string,
    alreadyPresenAnimalsNumber: string,
    dailyTimeOff: string,
    holidaysChildcareSolution: string,
    catName: string,
    catSlug: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/createadoptionrequest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                catId,
                lastName,
                firstName,
                email,
                facebook,
                lifePlace,
                area,
                isOutsideAccess,
                householdPeopleNumber,
                alreadyPresenAnimalsNumber,
                dailyTimeOff,
                holidaysChildcareSolution,
                baseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL,
                catName,
                catSlug
            })
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
}

export const getCatBoosterVaccinationNoLaterThanOneMonthCount = async (
    token: string,
    id: string | null
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/catboostervaccinationnolaterthanonemonthcount${id ? "/" + id : ""}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getCatBoosterVaccinationNoLaterThanOneMonthList = async (
    token: string,
    id: string | null
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/catboostervaccinationnolaterthanonemonthlist${id ? "/" + id : ""}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

