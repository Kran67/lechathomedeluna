'use client'

import {
  useEffect,
  useState,
} from 'react';

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

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
    onClick?: () => void;
    badge?: number;
    iconPath: string;
    forceDisplayTextOnMobile?: boolean;
}

/**
 * Affiche d'un élément du menu
 * 
 * @function MenuItem
 * @param { text, isActive = false, url, className } MenuItemProps - Les propriétés d'un élément du menu
 * @param {string} MenuItemProps.text - Text de l'élément
 * @param {boolean?} MenuItemProps.isActive - Statut de l'élément actif ou non actif
 * @param {string?} MenuItemProps.url - Url de redirection lors du clique sur l'élément
 * @param {string?} MenuItemProps.className - Classes css de l'élément
 * @param {function?} MenuItemProps.onClick - Function à executer sur le clique du lien avant redirection si elle est passée
 * @param {string} MenuItemProps.iconPath - Classes css de l'élément
 */
export default function MenuItem({ text, isActive = false, url, className, onClick, badge, iconPath, forceDisplayTextOnMobile = true }: MenuItemProps) {
    const router: AppRouterInstance = useRouter();
    const [innerWidth, setInnerWidth] = useState<number>(0);

    useEffect(() => {
        // Initialisation au montage
        setInnerWidth(window.innerWidth);

        const handleResize = () => setInnerWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);   

    const handleClick: () => void = () => {
        onClick?.();
        router.push(url);
    };

    return (
        <button
            className={"relative flex items-center w-full " + (isActive ? "text-(--main-red) font-bold " : "") + className}
            onClick={handleClick}
            role="button">
                {innerWidth >= 1280 || forceDisplayTextOnMobile ? <span className='text-xl md:text-sm'>{text}</span> : <img src={iconPath} alt={text}  title={text} className={"min-w-48 min-h-48 border-(--pink) hover:border-b-2" + (isActive ? " border-b-2" : "")} />}
                <span className={'flex items-center justify-center md:absolute mx-10 md:mx-0 -top-10 xl:top-0 -right-14 w-24 xl:w-12 h-24 xl:h-12 bg-(--primary) text-[16px] xl:text-[8px] text-(--white) rounded-[50%]' + (badge && badge > 0 ? "" : " hidden")}>{badge}</span>
        </button>
    );
}