import {
  useEffect,
  useState,
} from 'react';

import {
  MessageAttachment,
  Messaging,
} from '../../interfaces/messaging';

/**
 * Permet de récupèrer les bons vétérinaire depuis la base de données
 * 
 * @function messagingService
 * @returns { messaging: Messaging[], loading: boolean, refresh: any, error: boolean }
 */
export function messagingService(token: string, userId: string): { messaging: Messaging[], loading: boolean, refresh: any, error: boolean } {
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
    token: string,
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
    token: string,
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
    token: string,
    threadId: string,
    userId: string,
    content: string,
    attachments: MessageAttachment[] = []
) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sendmessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ threadId, userId, content, attachments})
    });
};

export const uploadMessageFiles = async (
  token: string,
  files: File[]
): Promise<MessageAttachment[]> => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  return data.attachments ?? [];
};

export const addMembers = async (
    token: string,
    threadId: string,
    members: string[]
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/addmembers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                threadId,
                members
            }),
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const removeMembers = async (
    token: string,
    threadId: string,
    members: string[]
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/removemembers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                threadId,
                members
            }),
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const renameThread = async (
    token: string,
    threadId: string,
    groupName: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/renamethread`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                threadId,
                groupName,
            }),
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const createThread = async (
    token: string,
    type: string,
    toUserId: string,
    fromUserId: string,
    groupName: string | undefined,
    memberIds: string[]
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/messaging`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            body: JSON.stringify({
                type,
                toUserId,
                fromUserId,
                groupName,
                memberIds,
            }),
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const getUnreadMessageByUserId = async (
    token: string,
    userId: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/unread/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const unreadMessageListByUserId = async(
    token: string,
    userId: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/unreadlist/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const leaveThread = async (
    token: string,
    threadId: string,
    userId: string,
    isLastMember: boolean
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/leaveThread`, {
            method: "POST",
            body: JSON.stringify({
                threadId,
                userId,
                isLastMember
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};

export const createThreadAndSendMessage = async (
    token: string,
    fromUserId: string,
    userIds: string[],
    message: string
) => {
    try {
        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/createandsendmessage`, {
            method: "POST",
            body: JSON.stringify({
                fromUserId,
                userIds,
                message
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        return await res.json();
    } catch (err) {
        return { error: err };
    }
};