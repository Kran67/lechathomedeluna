"use client";

import {
  FormEvent,
  useEffect,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import { toast } from 'react-toastify';

import { useUser } from '@/app/contexts/userContext';
import { IconButtonImages } from '@/app/enums/enums';

import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

export default function ModalLeaveThread({
    threadId,
    closeModal,
    onSuccess,
}: {
    threadId: string;
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const { user } = useUser();

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/leaveThread`, {
            method: "POST",
            body: JSON.stringify({
                threadId,
                userId: user?.id,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (res.ok) {
            toast.success(`Vous avez bien quitté le groupe.`);
            onSuccess();
        } else {
            const data = await res.json();
            toast.error(<div>Erreur lors du quitter du groupe<br />{data.message}</div>);
        }
    };

    useEffect(() => {
        const closeOnEsc = (e: KeyboardEvent): void => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", closeOnEsc);
        return () => document.removeEventListener("keydown", closeOnEsc);
    }, []);

    return (
        <aside className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-1 w-320 md:w-full" onClick={closeModal}>
            <div
                className="bg-(--white) relative px-8 py-10 md:px-36 md:py-39 rounded-[10px] flex flex-col gap-20 md:gap-40 w-full md:w-380 border border-(--primary) border-1"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="text-(--primary)">Êtes-vous sûr de vouloir quitter ce groupe ?</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-24" role="form" aria-label="Information du groupe">
                    <div className="flex flex-1 gap-10">
                        <Button text="Annuler" onClick={(e) => { e.preventDefault(); closeModal(); }} className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                        <Button text="Confirmer" className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                    </div>
                </form>
                <IconButton icon={IconButtonImages.Cross} onClick={closeModal} imgWidth={20} imgHeight={20} className='absolute top-15 right-15 cursor-pointer' svgFill='#902677' />
            </div>
        </aside>
    );
}