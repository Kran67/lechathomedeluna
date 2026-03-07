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
import {
  createThreadAndSendMessage,
} from '@/app/services/client/messagingService';

import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

export default function ModalMessage({
    userIds,
    closeModal,
    onSuccess,
}: {
    userIds: string[];
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const { user } = useUser();

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);

        const res: Response = await createThreadAndSendMessage(token, user?.id as string, userIds, formData.get("message") as string);

        //if (res.ok) {
            toast.success(`Le message a bien été envoyé avec succès.`);
            onSuccess();
        //} else {
        //    const data = await res.json();
        //    toast.error(<div>Erreur dans l'envoi du message<br />{data.message}</div>);
        //}
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
                className="bg-(--white) relative px-8 py-10 md:px-36 md:py-39 rounded-[10px] flex flex-col gap-20 w-full md:w-480 border border-(--primary) border-1"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="text-(--primary)">Saisir le message</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-24" role="form" aria-label="Information du groupe">
                    <div className="flex flex-col gap-1">
                        <textarea
                            className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5'
                            name="message"
                            rows={5}
                            style={{ resize: "none"}}
                            placeholder="Saisissez votre message" />
                    </div>
                    <div className="flex flex-1 gap-10">
                        <Button text="Annuler" onClick={(e) => { e.preventDefault(); closeModal(); }} className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                        <Button text="Valider" className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                    </div>
                </form>
                <IconButton icon={IconButtonImages.Cross} onClick={closeModal} imgWidth={20} imgHeight={20} className='absolute top-15 right-15 cursor-pointer' svgFill='#902677' />
            </div>
        </aside>
    );
}