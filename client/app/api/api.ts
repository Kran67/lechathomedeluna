import { cache } from 'react';

import { cookies } from 'next/headers';

import { catsMock } from '@/app/mocks/cats';

import { usersMock } from '../mocks/users';

/**
 * Récupère la liste des propriétés
 * 
 * @async
 * @function getCats
 * @returns {Promise<any>} - Une liste de chats ou un objet { error: string }
 */
export const getCats = cache(async () => {
    const data: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties`, {
        method: "GET",
        cache: "no-store",
        headers: { 'Content-Type': 'application/json', }
    });
    return await data.json();
});

/**
 * Récupère les informations d'un chat
 *
 * @async
 * @function getCat
 * @param {string} id - Identifiant du chat
 * @returns {Promise<any>} - Un chat ou un objet { error: string }
 */
export const getCat = cache(async (slug: string) => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
        return catsMock.find((p) => p.id === slug);
    } else {
        const data: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cats/${slug}`, {
            method: "GET",
            cache: "no-store",
            headers: { 'Content-Type': 'application/json', }
        });
        return await data.json();
    }
});

/**
 * Récupère les informations de l'utilisateur connecté)
 *
 * @async
 * @function getProfile
 * @param {string} id - Identifiant de la propriété
 * @returns {Promise<any>} - Une propriétés ou un objet { error: string }
 */
export const getProfile = cache(async (id: string) => {
    const cookieStore = await cookies();
    const token: string | undefined = cookieStore.get("token")?.value;

    if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
        return usersMock.find((u) => u.id === id);
    } else {
        if (!token) return null;

        try {
            const data: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: "no-store",
            });
            return await data.json();
        } catch (err) {
            console.error("Erreur lors de la récupération du profil :", err);
            return null;
        }
    }
});