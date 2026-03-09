export const create = async (
    token: string | undefined,
    date: string,
    user_id: string,
    cat_id: string,
    clinic: string,
    object: string,
    created_by: string
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vetvouchers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                date,
                user_id,
                cat_id,
                clinic,
                object,
                created_by
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
