import { cache } from 'react';

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
        console.error("Erreur lors de la récupération des utilisateurs' :", err);
        return null;
    }
});

export const create = async (token: string | undefined, email: string, name: string, lastName: string, social_number: string, phone: string, address: string, city: string, role: string, blacklisted: boolean, referrer_id: string | null) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({ name, lastName, email, social_number, phone, address, city, role, blacklisted, referrer_id }),
        });

        return await res.json();
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
export const update = cache(async (token: string | undefined, id: string, name: string, lastName: string, social_number: string, phone: string, address: string, city: string, roles: string, blacklisted: boolean, referrer_id: string | null) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({ name, lastName, social_number, phone, address, city, roles, blacklisted, referrer_id }),
        });

        return await res.json();
    } catch (err) {
        console.error("Erreur lors de l'enregistrement' :", err);
        return null;
    }
});

/**
 * Permet de reinitialiser le mot de passe d'un utilisateur
 * 
 * @async
 * @function resetPassword
 * @param { string } email - email de l'utilisateur
 * @returns { Promise<any> } Un object contenant l'utilisateur ou un object contenant une erreur
 */
export const resetPassword = cache(async (email: string) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/resetpassword/${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        return await res.json();
    } catch (err) {
        console.error("Erreur lors de l'envoi de l'email : ", err);
        return null;
    }
});

export async function checkResetTokenValidity(token: string): Promise<{ valid: boolean }> {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resetpassword/validate/${token}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la vérification du token de réinitialisation du mot de passe:", err);
        return { valid: false };
    }
}

export const updatePassword = async (token: string, password: string) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/updatepassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: password }),
        });
        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la mise à jour du mot de passe :", err);
        return null;
    }
}