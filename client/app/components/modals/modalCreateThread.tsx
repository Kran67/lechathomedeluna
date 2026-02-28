"use client";

import {
  FormEvent,
  useEffect,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { useUser } from '@/app/contexts/userContext';
import {
  IconButtonImages,
  InputTypes,
} from '@/app/enums/enums';

import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';

export default function ModalCreateThread({
    type,
    userList,
    closeModal,
    onSuccess,
}: {
    type: "private" | "group";
    userList: { value: string, label: string | undefined }[];
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const { user } = useUser();

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);

        const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messaging`, {
            method: "POST",
            body: JSON.stringify({
                type,
                toUserId:formData.getAll("participants")[0], // For private thread, we take the first participant as the recipient
                fromUserId : user?.id,
                groupName: type === "group" ? formData.get("name"): undefined,
                memberIds: type === "group" ? formData.getAll("participants") : [],
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (res.ok) {
            toast.success("La discussion a bien été créée.\nRedirection vers la page de messagerie...");
            onSuccess();
        } else {
            const data = await res.json();
            toast.error(<div>Erreur dans la création de la discussion<br />{data.message}</div>);
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
                <h4 className="text-(--primary)">Créer une discussion {type === "private" ?"privée" : "groupée"}</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-24" role="form" aria-label="Information de la discussion">
                    {type === "group" &&<Input name="name" label="Nom du groupe" type={InputTypes.Text} required={true} maxLength={200} />}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="participants" className='text-(--primary)'>Participant{type === "group" ? "s" : ""}</label>
                        <label id="dynamicSelect" htmlFor="react-select-3-input" className="invisible w-0 h-0">Choisir un (type === "group" ? "ou plusieurs " : "") participant{type === "group" ? "s" : ""}</label>
                        <Select
                            options={userList}
                            noOptionsMessage={() => "Aucun utilisateur trouvé"}
                            loadingMessage={() => "Récupération des utilisateurs..."}
                            className="text-(--primary)"
                            name="participants"
                            id="participants"
                            isMulti={type === "group"}
                            isClearable={true}
                            isSearchable={true}
                            placeholder={"Choisir un " + (type === "group" ? "ou plusieurs " : "") + "participant" + (type === "group" ? "s" : "")}
                        />
                    </div>
                    <Button text="Créer la discussion" className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) w-200 self-center' />
                </form>
                <IconButton icon={IconButtonImages.Cross} onClick={closeModal} imgWidth={20} imgHeight={20} className='absolute top-15 right-15 cursor-pointer' svgFill='#902677' />
            </div>
        </aside>
    );
}