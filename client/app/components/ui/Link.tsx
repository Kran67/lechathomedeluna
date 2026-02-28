'use client'

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

/**
 * Interface pour les propriétés d'initialisation d'un lien
 * 
 * @interface LinkProps
 */
interface LinkProps {
    text: string;
    url?: string;
    className?: string;
    onClick?(e: React.MouseEvent<HTMLAnchorElement>): void;
    isActive?: boolean;
    title?: string;
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
 * @param {string} LinkProps.title - Bulle d'information du lien
 */
export default function Link({ text, url = "#", onClick, className, isActive = false, title }: LinkProps) {
    const router: AppRouterInstance = useRouter();

    const handleClick: (e: React.MouseEvent<HTMLAnchorElement>) => void = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (url) router.push(url);
    };

    return (
        <a href={url}
            className={className + (isActive ? " text-(--primary-dark)" : " text-(--primary)")}
            title={title}
            onClick={(e) => handleClick(e) }>
            {text}
        </a>
    );
}