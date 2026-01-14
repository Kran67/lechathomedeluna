'use client'

import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Interface pour les propriétés d'initialisation d'un élément du menu
 * 
 * @interface MenuItemProps
 */
interface MenuItemProps {
    text: string;
    isActive?: boolean;
    url: string;
    className?: string;
}

/**
 * Affiche d'un élément du menu
 * 
 * @function MenuItem
 * @param { text, isActive = false, url, className } MenuItemProps - Les proriétés d'un élément du menu
 * @param {string} MenuItemProps.text - Text de l'élément
 * @param {boolean?} MenuItemProps.isActive - Statut de l'élément actif ou non actif
 * @param {string?} MenuItemProps.url - Url de redirection lors du clique sur l'élément
 * @param {string?} MenuItemProps.className - Classes css de l'élément
 */
export default function MenuItem({ text, isActive = false, url, className }: MenuItemProps) {
    const router: AppRouterInstance = useRouter();

    const handleClick: () => void = () => {
        router.push(url);
    };

    return (
        <button className={(isActive ? "text-(--main-red) font-bold " : "") + className} onClick={handleClick} role="button">{text}</button>
    );
}