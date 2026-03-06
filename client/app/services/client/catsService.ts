import {
  useEffect,
  useState,
} from 'react';

import type { Cat } from '@/app/interfaces/cat';

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
                url+=`Adopted/${year}`;
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

    // permet d'actualiser les données lors d'un changement
    useEffect(() => {
        let active: boolean = true;

        async function load() {
            await refresh();
            if (active) setLoading(false);
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    return { cats, loading, refresh, error };
}

export const getCatNotFullyCompletedCount = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/catnotfullycompletedcount`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};


export const getCatNotFullyCompletedList = async (
    token: string,
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/catnotfullycompletedlist`, {
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