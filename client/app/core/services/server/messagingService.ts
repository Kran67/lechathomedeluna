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
