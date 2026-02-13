import {
  useEffect,
  useState,
} from 'react';

import { VetVoucher } from '../../interfaces/vetVoucher';

/**
 * Permet de récupèrer les bons vétérinaire depuis la base de données
 * 
 * @function vetVouchersService
 * @returns { vetVouchers: VetVoucher[] | null, loading: boolean, refresh: any, error: boolean }
 */
export function vetVouchersService(token: string | undefined, year: number = 0, clinic: string = '-', voucherObject: string = '-'): { vetVouchers: VetVoucher[] | null, loading: boolean, refresh: any, error: boolean } {
    const [vetVouchers, setVetVouchers] = useState<VetVoucher[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vetvouchers/${year}/${clinic}/${voucherObject}`;

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                setVetVouchers(null);
                setError(true);
                return;
            }

            const data = await res.json();

            setVetVouchers(data);
        } catch (err) {
            console.error("Erreur fetch VetVouchers:", err);
            setVetVouchers(null);
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

    return { vetVouchers, loading, refresh, error };
}