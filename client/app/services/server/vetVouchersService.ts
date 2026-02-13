export const create = async (
    token: string | undefined,
    date: string,
    user_name: string,
    cat_id: string,
    clinic: string,
    object: string
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vetvouchers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                date,
                user_name,
                cat_id,
                clinic,
                object
            }),
        });
        const result = await res.json();
        return result;
    } catch (err) {
        console.error("Erreur lors de la création du bon vétérinaire :", err);
        return null;
    }
}

export const update = async (
    token: string | undefined,
    id: string,
    processed_on: string
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vetvouchers/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({ processed_on }),
        });
        const result = await res.json();

        return result;
    } catch (err) {
        console.error("Erreur lors de la modification du bon vétérinaire :", err);
        return null;
    }
}
