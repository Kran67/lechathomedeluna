import { cache } from 'react';

/**
 * Permet de récupèrer les utilisateurs
 * 
 * @async
 * @function getUsers
 * @param { string } token - identifiant de l'utilisateur
 * @returns { Promise<any> } Un object contenant les utilisateurs ou un object contenant une erreur
 */
export const getAll = cache(async (token: string | undefined) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });

        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur' :", err);
        return null;
    }
});


/**
 * Permet de récupèrer un utilisateur depuis la base de données
 * 
 * @async
 * @function getUser
 * @param { string } id - identifiant de l'utilisateur
 * @returns { Promise<any> } Un object contenant l'utilisateur ou un object contenant une erreur
 */
export const getById = cache(async (token: string | undefined, id: string) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });

        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur' :", err);
        return null;
    }
});

export const create = async (token: string | undefined, email: string, name: string, lastName: string, phone: string, address: string, city: string, role: string, blacklisted: boolean, referrer_id: string | null) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({ name, lastName, email, phone, address, city, role, blacklisted, referrer_id }),
        });

        return await res.json()
    } catch (err) {
        console.error("Erreur lors de la création de l'utilisateur :", err);
        return null;
    }
}

/**
 * Permet de mettre à jour un utilisateur
 * 
 * @async
 * @function update
 * @param { string } name - prénom de l'utilisateur
 * @param { string } lastName - nom de l'utilisateur
 * @param { string } email - L'email de l'utilisateur
 * @returns { Promise<any> } Un object contenant l'utilisateur ou un object contenant une erreur
 */
export const update = cache(async (token: string | undefined, id: string, name: string, lastName: string, phone: string, address: string, city: string, role: string, blacklisted: boolean, referrer_id: string | null) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({ name, lastName, phone, address, city, role, blacklisted, referrer_id }),
        });

        return await res.json()
    } catch (err) {
        console.error("Erreur lors de l'enregistrement' :", err);
        return null;
    }
});