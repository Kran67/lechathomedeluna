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
