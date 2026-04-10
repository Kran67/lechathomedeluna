"use client";

import {
  FormEvent,
  useEffect,
} from 'react';

import { IconButtonImages } from '@/app/core/enums/enums';
import { formatDDMMY } from '@/app/core/lib/utils';

import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

export default function ModalConditionsOfUse({
    firstName,
    lastName,
    closeModal,
    onSuccess,
}: {
    firstName: string,
    lastName: string,
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSuccess();
    };

    useEffect(() => {
        const closeOnEsc = (e: KeyboardEvent): void => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", closeOnEsc);
        return () => document.removeEventListener("keydown", closeOnEsc);
    }, []);

    return (
        <aside className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-1 w-500 md:w-full" onClick={closeModal}>
            <div
                className="bg-(--white) relative px-8 py-10 md:px-36 md:py-39 rounded-[10px] flex flex-col gap-10 w-full md:w-800 border border-(--primary) border-1"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="text-(--primary)">AUTORISATION DE TRAITEMENT DES DONNEES PERSONNELLES</h4>
                <span className='text-(--text) text-sm'>Je soussigné(e) {firstName} {lastName} autorise le traitement de mes données personnelles [sensibles] suivantes :</span>
                <ul className='text-(--text) text-sm list-disc list-inside'>
                    <li>Nom, prénom, date de naissance</li>
                    <li>Adresse email</li>
                    <li>Adresse postale</li>
                    <li>Téléphone</li>
                </ul>
                <span className='text-(--text) text-sm'>Je reconnais que les informations recueillies par le 'LeChat’HomeDeLuna' feront l’objet d’un traitement informatique.</span>
                <span className='text-(--text) text-sm'>Je reconnais avoir volontairement donné ces informations et que mon éventuel refus n’aurait l’objet d’aucune sanction à mon encontre.</span>
                <span className='text-(--text) text-sm'>Ces données personnelles seront conservées aussi longtemps que nécessaire pour réaliser les traitements indiqués ci-dessus ou à d’autres fins essentielles telles que se conformer à aux obligations légales, résoudre les éventuels litiges et appliquer les conventions.</span>
                <span className='text-(--text) text-sm'>Conformément à la loi « Informatique et Libertés » et au Règlement européen 2016/679 du 27 avril 2016 (RGPD), vous bénéficiez d’un droit d’accès et de rectification aux informations qui vous concernent. Vous bénéficiez également de la possibilité d’effectuer une réclamation auprès de la CNIL par courrier postal au 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07 ou en vous rendant sur le site <a className="underline" href="https://www.cnil.fr/fr/plaintes" target="_blank">https://www.cnil.fr/fr/plaintes</a>.</span>
                <span className='text-(--text) text-sm'>Si vous souhaitez exercer ce droit et obtenir communication des informations vous concernant, veuillez-vous adresser à 'LeChat’HomeDeLuna'.</span>
                <span className='text-(--text) text-sm'>En date du : {formatDDMMY(new Date())}</span>
                <div className='flex flex-col gap-10'>
                    <span className='text-(--text) text-sm'>Signature :</span>
                    <span className='text-(--text) text-2xl ml-50 mt-[-50px] font-(family-name:--font-indieflower) rotate-[-10deg]'>{firstName} {lastName}</span>
                </div>
                <br />
                <br />
                <br />
                <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-24" role="form" aria-label="Information du groupe">
                    <div className="flex flex-1 justify-between">
                        <Button text="Annuler" onClick={(e) => { e.preventDefault(); closeModal(); }} className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                        <Button text="Confirmer" className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) w-200 self-center' />
                    </div>
                </form>
                <IconButton icon={IconButtonImages.Cross} onClick={closeModal} imgWidth={20} imgHeight={20} className='absolute top-15 right-15 cursor-pointer' svgFill='#902677' />
            </div>
        </aside>
    );
}