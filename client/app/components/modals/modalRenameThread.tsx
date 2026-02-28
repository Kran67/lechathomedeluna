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

import { IconButtonImages } from '@/app/enums/enums';

import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';

export default function ModalRenameThread({
    threadId,
    groupName,
    closeModal,
    onSuccess,
}: {
    threadId: string;
    groupName: string;
    closeModal: () => void;
    onSuccess: (newName: string) => void;
}) {
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const newGroupName: string = formData.get("groupName")?.toString() || groupName;

        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging/renameThread`, {
            method: "POST",
            body: JSON.stringify({
                threadId,
                groupName: newGroupName,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (res.ok) {
            toast.success(`Le groupe a été renommé avec succès.`);
            onSuccess(newGroupName);
        } else {
            const data = await res.json();
            toast.error(<div>Erreur dans la modification du nom du groupe<br />{data.message}</div>);
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
                <h4 className="text-(--primary)">Saisir le nouveau nom du groupe</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-24" role="form" aria-label="Information du groupe">
                    <div className="flex flex-col gap-1">
                        <Input name="groupName" value={groupName} label="Nom du groupe" placeHolder="Entrez le nouveau nom du groupe" />
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