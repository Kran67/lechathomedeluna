import { useEffect, useState } from "react";
import type { Cat } from "@/app/interfaces/cat";
import { catsMock } from "@/app/mocks/cats";

/**
 * Permet de récupèrer un chat depuis la base de données
 * 
 * @function catService
 * @param {string } id - Identifiant du chat
 * @returns { cat: Cat | any, loading: boolean, refresh: any, error: boolean }
 */
export function catService(id: string): { cat: Cat | any, loading: boolean, refresh: any, error: boolean } {
    const [cat, setCat] = useState<Cat | any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false)

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
                setCat(catsMock.find((p) => p.id === id));
            } else {
                const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats/${id}`, {
                    method: "GET",
                    cache: "no-store",
                    headers: { 'Content-Type': 'application/json', }
                });

                if (!res.ok) {
                    setCat(null);
                    setError(true);
                    return;
                }

                const data = await res.json();

                setCat(data);
            }
        } catch (err) {
            console.error("Erreur fetch property:", err);
            setCat(null);
            setError(true);
        } finally {
            setLoading(false)
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

    return { cat, loading, refresh, error };
}