import {
  useEffect,
  useState,
} from 'react';

import { Messenging } from '../../interfaces/messenging';

/**
 * Permet de récupèrer les bons vétérinaire depuis la base de données
 * 
 * @function messengingService
 * @returns { messenging: Messenging[], loading: boolean, refresh: any, error: boolean }
 */
export function messengingService(token: string | undefined, userId: string): { messenging: Messenging[], loading: boolean, refresh: any, error: boolean } {
    const [messenging, setMessenging] = useState<Messenging[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messenging/${userId}`;

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                setMessenging([]);
                setError(true);
                return;
            }

            const data = await res.json();

            setMessenging(data);
        } catch (err) {
            console.error("Erreur fetch Messenging:", err);
            setMessenging([]);
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

    return { messenging, loading, refresh, error };
}