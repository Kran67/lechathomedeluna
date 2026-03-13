// À cause de l'événement onClick
'use client'

import { useState } from 'react';
import { createPortal } from 'react-dom';

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { useUser } from '@/app/core/contexts/userContext';
import {
  IconButtonImages,
  UserRoles,
} from '@/app/core/enums/enums';
import { Cat } from '@/app/core/interfaces/cat';
import { DateUtils } from '@/app/core/lib/dateUtils';
import {
  dateAge,
  hasRoles,
  redirectWithDelay,
  truncate,
} from '@/app/core/lib/utils';

import ModalConfirmationDeleteAdoptedCat
  from '../modals/modalConfirmationDeleteAdoptedCat';
import ModalMessage from '../modals/modalMessage';
import IconButton from '../ui/IconButton';

/**
 * Interface pour des paramétres pour l'affichage des détails d'un chat
 * 
 * @interface PropsCC
 */
interface PropsCC {
    cat: Cat;
}

/**
 * Affiche la carte d'un chat
 * 
 * @function CatCard
 * @param {Cat} PropsCC
 * @param {Cat} PropsCC.cat - Les données du chat
 */
export default function CatCard({ cat }: PropsCC) {
    const router: AppRouterInstance = useRouter();
    const { user } = useUser();
    const [showModalMessage, setShowModalMessage] = useState<boolean>(false);
    const [showModalConfirmationDeleteAdoptedCat, setShowModalConfirmationDeleteAdoptedCat] = useState<boolean>(false);
    const [catSlugToDelete, setCatSlugToDelete] = useState<string | undefined>(undefined);
    const [toUserId, setToUserId] = useState<string>("");

    // au clique sur les détails, redirection vers la page du chat
    const handleClick: () => void = () => {
        router.push(`/cat/${cat.slug}`);
    };

    const askBeforeDeletion = (e:React.MouseEvent<HTMLButtonElement>, catSlug: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCatSlugToDelete(catSlug);
        setShowModalConfirmationDeleteAdoptedCat(true);
    }

    return (
        <div className="flex flex-col rounded-[10px] bg-(--white) w-full md:w-355 relative cursor-pointer border border-(--primary) p-5" onClick={() => handleClick()}>
            {showModalMessage && createPortal(
                <ModalMessage
                    userIds={[toUserId]}
                    closeModal={() => setShowModalMessage(false)}
                    onSuccess={() => {
                        setShowModalMessage(false);
                    }}
                />,
                document.body
            )}
            {showModalConfirmationDeleteAdoptedCat && createPortal(
                <ModalConfirmationDeleteAdoptedCat
                    catSlug={catSlugToDelete as string}
                    closeModal={() => setShowModalConfirmationDeleteAdoptedCat(false)}
                    onSuccess={() => {
                        setShowModalConfirmationDeleteAdoptedCat(false);
                        redirectWithDelay("/adoptedcats");
                    }}
                />,
                document.body
            )}
            {cat.isDuringVisit && <div className="absolute ruban -left-5 -top-5 w-145 h-145 z-1 overflow-hidden">
                <span className='absolute -left-30 top-40 w-160 text-center rotate-[-45deg] text-(--white) text-sm bg-gradient-to-b from-(--pink) to-(--primary) pl-5 pr-5'>EN COURS DE VISITE</span>
            </div>}
            {!cat.adoptionDate && user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]) && <IconButton
                icon={IconButtonImages.Pen}
                imgWidth={16}
                imgHeight={16}
                className={"w-32 h-32 absolute right-16 top-16 bg-(--primary) z-1 rounded-[5px] flex items-center justify-center"}
                svgFill="#FFF"
                url={`/admin/cat/${cat.slug}`}
                onClick={(e) => {e.stopPropagation();}}
                title="Éditer la fiche"
            />}
            {cat.adoptionDate && user && hasRoles(user.roles, [UserRoles.Admin]) && <IconButton
                icon={IconButtonImages.Trash}
                imgWidth={16}
                imgHeight={16}
                className={"w-32 h-32 absolute right-16 top-16 bg-(--primary) z-1 rounded-[5px] flex items-center justify-center"}
                svgFill="#FFF"
                onClick={(e:React.MouseEvent<HTMLButtonElement>) => { askBeforeDeletion(e, cat.slug); }}
                title="Supprimer la fiche"
            />}
            <div className="relative h-376 overflow-hidden flex justify-center">
                <img
                    src={(cat.pictures?.[0].includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + cat.pictures?.[0]}
                    alt="Image du chat"
                    className="absolute h-376"
                    style={{ objectFit: "contain" }}
                />
            </div>
            <div className="flex flex-col justify-between pt-16 pb-24">
                <div className="flex flex-col gap-8">
                    <span className="text-lg text-(--text)">{cat.name} {cat.hostFamily?.id !== user?.id && cat.hostFamily?.id && (<><span>(FA : </span>
                        <span onClick={(e) => { e.stopPropagation(); setToUserId(cat.hostFamily?.id as string); setShowModalMessage(true); }}>{cat.hostFamily?.name}</span>)</>)}</span>
                    <span className="text-sm text-(--text) font-normal md:h-80">{truncate(cat.description ?? "", 210)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-(--text) font-medium">Age : {dateAge(cat.birthDate)}</span>
                    <span className="text-sm text-(--text) font-medium">Sexe : {cat.sex}</span>
                    <span className="text-sm text-(--text) font-medium">Robe : {cat.dress}</span>
                    {user && <span className="text-sm text-(--text) font-medium">Statut (FIV & FELV) : {cat.status}</span>}
                    <span className="text-sm text-(--text) font-medium">Date d'entrée : {cat.entryDate ? DateUtils.differenceDate(new Date(cat.entryDate)).text : ""}</span>
                    {user && <span className="text-sm text-(--text) font-medium">Provenance : {cat.provenance}</span>}
                </div>
            </div>
        </div>
    );
}