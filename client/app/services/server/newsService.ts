export const create = async (
    token: string | undefined,
    date: string | null,
    pictures: any,
    ) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                date,
            }),
        });
        const id = await res.json();

        // upload des images
        pictures?.map(async (picture: any) => {
            const formData = new FormData();
            formData.append("file", picture);
            formData.append("id", id);
            formData.append("context", "news");
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, },
                body: formData
            });
        });
    } catch (err) {
        console.error("Erreur lors de la création de l'actualité :", err);
        return null;
    }
}

export const remove = async (
    token: string | undefined,
    id: string,
    ) => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
    } catch (err) {
        console.error("Erreur lors de la supression de l'activité :", err);
        return null;
    }
}
