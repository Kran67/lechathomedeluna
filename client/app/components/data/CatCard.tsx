// À cause de l'événement onClick
'use client'

import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Cat } from "@/app/interfaces/cat";
import { truncate } from "@/app/lib/utils";
import { useUser } from "@/app/contexts/userContext";

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
        router.push(`/cat/${cat.id}`);
    };

    return (
        <div className="flex flex-col rounded-[10px] bg-(--white) w-full md:w-355 relative">
            <div className="relative h-376 overflow-hidden rounded-t-[10px]">
                <img src={cat.cover} alt="Image du chat" className="absolute h-376" width={355} height={376} />
            </div>
            <div className="flex flex-col justify-between pt-16 pb-24 cursor-pointer" onClick={() => handleClick()}>
                <div className="flex flex-col gap-8">
                    <span className="text-lg text-(--text)">{cat.name}</span>
                    <span className="text-sm text-(--text) font-normal">{truncate(cat.description ?? "", 210)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-(--text) font-medium">Age : {cat.age} an(s)</span>
                    <span className="text-sm text-(--text) font-medium">Sexe : {cat.sex}</span>
                    <span className="text-sm text-(--text) font-medium">Robe : {cat.dress}</span>
                    {user && <span className="text-sm text-(--text) font-medium">Status (FIV & ) : {cat.status}</span>}
                </div>
            </div>
        </div>
    );
}