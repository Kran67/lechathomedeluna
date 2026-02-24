import {
  useEffect,
  useState,
} from 'react';

import { New } from '../../interfaces/new';

/**
 * Permet de récupèrer les bons vétérinaire depuis la base de données
 * 
 * @function newsService
 * @returns { news: New[] | null, loading: boolean, refresh: any, error: boolean }
 */
export function newsService(period: 'current' |'next'): { news: New[] | null, loading: boolean, refresh: any, error: boolean } {
    const [news, setNews] = useState<New[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news/${period}`;

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                setNews(null);
                setError(true);
                return;
            }

            const data = await res.json();

            setNews(data);
        } catch (err) {
            console.error("Erreur fetch News:", err);
            setNews(null);
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

    return { news, loading, refresh, error };
}

export const deleteNew = async (
    token: string | undefined,
    id: string
) => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
    } catch (err) {
        console.error("Erreur lors de la supression de l'actualité :", err);
        return null;
    }
};
