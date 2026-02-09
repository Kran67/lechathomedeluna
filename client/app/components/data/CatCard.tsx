// À cause de l'événement onClick
'use client'

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { useUser } from '@/app/contexts/userContext';
import { IconButtonImages } from '@/app/enums/enums';
import { Cat } from '@/app/interfaces/cat';
import {
  dateAge,
  hasRole,
  truncate,
} from '@/app/lib/utils';

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

    // au clique sur les détails, redirection vers la page du chat
    const handleClick: () => void = () => {
        router.push(`/cat/${cat.slug}`);
    };

    return (
        <div className="flex flex-col rounded-[10px] bg-(--white) w-full md:w-355 relative cursor-pointer" onClick={() => handleClick()}>
            {!cat.isAdopted && user && hasRole(user.role, ["Admin"]) && <IconButton
                icon={IconButtonImages.Pen}
                imgWidth={16}
                imgHeight={16}
                className={"w-32 h-32 absolute right-16 top-16 bg-(--primary) z-1 rounded-[5px] flex items-center justify-center"}
                svgFill="#FFF"
                url={`/admin/cat/${cat.slug}`}
                onClick={(e) => {e.stopPropagation();}}
                title="Éditer la fiche"
            />}
            <div className="relative h-376 overflow-hidden rounded-t-[10px]">
                <img src={(cat.pictures?.[0].includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + cat.pictures?.[0]} alt="Image du chat" className="absolute h-376" width={355} height={376} />
            </div>
            <div className="flex flex-col justify-between pt-16 pb-24">
                <div className="flex flex-col gap-8">
                    <span className="text-lg text-(--text)">{cat.name}</span>
                    <span className="text-sm text-(--text) font-normal md:h-80">{truncate(cat.description ?? "", 210)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-(--text) font-medium">Age : {dateAge(cat.birthDate)} an(s)</span>
                    <span className="text-sm text-(--text) font-medium">Sexe : {cat.sex}</span>
                    <span className="text-sm text-(--text) font-medium">Robe : {cat.dress}</span>
                    {user && <span className="text-sm text-(--text) font-medium">Statut (FIV & FELV) : {cat.status}</span>}
                </div>
            </div>
        </div>
    );
}