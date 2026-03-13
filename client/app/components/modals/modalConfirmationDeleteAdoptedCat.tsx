"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import { toast } from 'react-toastify';

import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import { IconButtonImages } from '@/app/core/enums/enums';
import { deleteCat } from '@/app/core/services/server/catsService';

export default function ModalConfirmationDeleteAdoptedCat({
    catSlug,
    closeModal,
    onSuccess,
}: {
    catSlug: string;
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const [clone, setClone] = useState<boolean>(false);

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res: Response| null = await deleteCat(token, catSlug, clone);
        if (res?.ok) {
            toast.success(`La fiche du chat a bien été supprimée.\n${clone ? "Son retour a bien étté pris en compte, vous pouvez le retrouver dans les chats en FA." : ""}`);
            onSuccess();
        } else {
            toast.error(<div>Erreur lors de la suppression de la fiche du chat adopté</div>);
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
        <aside className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-1 w-320 md:w-full" onClick={ (e) => { e.stopPropagation(); closeModal(); }}>
            <div
                className="bg-(--white) relative px-8 py-10 md:px-36 md:py-39 rounded-[10px] flex flex-col gap-20 md:gap-40 w-full md:w-380 border border-(--primary) border-1"
                onClick={(e) => { e.stopPropagation();  }}
            >
                <h4 className="text-(--primary)">Attention, vous êtes sur le point de supprimer la fiche d'un chat adopté.<br />Cette action est irréversible, cependant, si le chat adopté doit revenir dans l'association, veuillez cocher la case retour à l'association.<br /><br />Êtes-vous sûr de vouloir continuer ?</h4>
                    <div className="flex flex-1 gap-10 items-center">
                        <input type="checkbox" name="clone" id="clone" checked={clone} onChange={(e) => { setClone(!clone) }} />
                        <label htmlFor='clone' className='text-(--primary) text-sm'>Retour à l'association</label>
                    </div>
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