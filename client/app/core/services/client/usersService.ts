import { useState } from 'react';

import { User } from '@/app/core/interfaces/user';

/**
 * Permet de récupèrer les utilisateurs depuis la base de données
 * 
 * @function usersService
 * @returns { users: User[] | null, loading: boolean, refresh: any, error: boolean }
 */
export function usersService(token: string | undefined): { users: User[] | null, loading: boolean, refresh: any, error: boolean } {
    const [users, setUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`;

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json',  }
            });

            if (!res.ok) {
                setUsers(null);
                setError(true);
                return;
            }

            const data = await res.json();

            setUsers(data);
        } catch (err) {
            console.error("Erreur fetch uers:", err);
            setUsers(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return { users, loading, refresh, error };
}
