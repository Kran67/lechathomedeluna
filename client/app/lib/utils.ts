/**
 * Prépare le corps du document html pour l'affichage de fenêtre modale, enlève la scrollbar
 * 
 * @function
 * @param overflow: string - le type de débordement
 * @returns 
 */
export const prepareBodyToShowModal = (overflow: string): any => {
    document.body.style.overflow = overflow;

    return () => {
        document.body.style.overflow = "";
    };
}

/**
 * Valide que le mot de passe est conforme à la norme (8 caractère minimum, une lettre majuscule, un chiffre)
 * 
 * @function validatePassword
 * @param pw: string - le mot de passe à vérifier
 * @returns vrai ou faux
 */
export const validatePassword = (pw: string): boolean => {
    if (!pw || pw.trim() === "") return false;

    const regex: RegExp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pw);
}

export const truncate = (str: string, maxlength: number = 100): string => {
    const finalStr: string = str.substring(0, maxlength);
    return finalStr ? `${finalStr}...` : "";
}

export const dateAge = (dateStr: string | undefined) => {
    if (dateStr === undefined) return 0;
    const date = new Date(dateStr);
    return Math.abs((new Date(Date.now() - date.getTime()).getUTCFullYear()) - 1970);
}

export const hasRole = (userRole: string, rolesToCheck: string[]): boolean => {
    return rolesToCheck.includes(userRole);
}

/**
 * Lance une redirection de page avec un délai
 * @param url: string - l'adresse de redirection
 * @param delay: number - (default 0) le delai avant la redirection
 */
export const redirectWithDelay = (url: string, delay: number = 0): void => {
    setTimeout(() => window.location.href = url, delay);
}

export function formatYMMDD(date: Date) {
    const y = date.getFullYear();
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function formatDDMMY(date: Date) {
    const y = date.getFullYear();
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${y}`;
}