import {
  useEffect,
  useState,
} from 'react';

import { Messaging } from '../../interfaces/messaging';

/**
 * Permet de récupèrer les bons vétérinaire depuis la base de données
 * 
 * @function messagingService
 * @returns { messaging: Messaging[], loading: boolean, refresh: any, error: boolean }
 */
export function messagingService(token: string | undefined, userId: string): { messaging: Messaging[], loading: boolean, refresh: any, error: boolean } {
    const [messaging, setMessaging] = useState<Messaging[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // permet de rafaichir les données
    async function refresh() {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/${userId}`;

            const res: Response = await fetch(url, {
                method: "GET",
                cache: "no-store",
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                setMessaging([]);
                setError(true);
                return;
            }

            const data = await res.json();

            setMessaging(data);
        } catch (err) {
            console.error("Erreur fetch Messaging:", err);
            setMessaging([]);
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

    return { messaging, loading, refresh, error };
}

export const getAllMessagesById = async (
    token: string | undefined,
    threadId: string,
    userId: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/all/${threadId}/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération des messages :", err);
        return null;
    }
};

export const getAllUserThreads = async (
    token: string | undefined,
    userId: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération des discussions :", err);
        return null;
    }
};

export const sendMessage = async (
    token: string | undefined,
    threadId: string,
    userId: string,
    content: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sendmessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                threadId,
                userId,
                content
            })
        });
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération des discussions :", err);
        return null;
    }
};
