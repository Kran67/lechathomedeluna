'use client'

import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Interface pour les propriétés d'initialisation d'un lien
 * 
 * @interface LinkProps
 */
interface LinkProps {
    text: string;
    url?: string;
    className?: string;
    onClick?(): void;
    isActive?: boolean;
}

/**
 * Affiche d'un lien
 * 
 * @function Link
 * @param { text, url = "#", disabled = false, onClick, className } LinkProps - Les proriétés d'un lien
 * @param {string} LinkProps.text - Valeur du lien
 * @param {string?} LinkProps.url - Url de redirection lors du lien
 * @param {string?} LinkProps.className - Classes css du lien
 * @isActive {boolean?} LinkProps.isActive - Indique si le lien est le lien actif ou non
 * @param {function?} LinkProps.onClick - Function à executer sur le clique du lien avant redirection si elle est passée
 */
export default function Link({ text, url = "#", onClick, className, isActive = false }: LinkProps) {
    const router: AppRouterInstance = useRouter();

    const handleClick: () => void = () => {
        onClick?.();
        if (url) router.push(url);
    };

    return (
        <a href={url}
            className={className + (isActive ? " text-(--primary-dark)" : " text-(--primary)")}
            onClick={handleClick}>
            {text}
        </a>
    );
}