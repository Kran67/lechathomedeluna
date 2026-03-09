import { cache } from 'react';

/**
 * Permet de connecter un utilisateur
 * 
 * @async
 * @function login
 * @param { string } email - L'email de l'utilisateur
 * @param { string } password - Le mot de passe de l'utilisateur
 * @returns { Promise<any> } Un object contenant le token et l'utilisateur ou un object contenant une erreur
 */
export const login = cache(async (email: string, password: string) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        return await res.json();
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        return null;
    }
});

/**
 * Permet d'enregistrer un utilisateur
 * 
 * @async
 * @function signin
 * @param { string } name - (Prénom Nom) de l'utilisateur
 * @param { string } email - L'email de l'utilisateur
 * @param { string } password - Le mot de passe de l'utilisateur
 * @returns { Promise<any> } Un object contenant l'utilisateur ou un object contenant une erreur
 */
export const signin = cache(async (name: string, email: string, password: string) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role: "client" }),
        });

        return await res.json()
    } catch (err) {
        console.error("Erreur lors de l'enregistrement' :", err);
        return null;
    }
});