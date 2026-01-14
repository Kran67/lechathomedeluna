'use client'

import { LogoSizes, HeaderMenuItems, IconButtonImages } from "@/app/enums/enums";
import { useState } from "react";
import Logo from "@/app/components/ui/Logo";
import MenuItem from "@/app/components/ui/MenuItem";
import Link from "@/app/components/ui/Link";
import IconButton from "@/app/components/ui/IconButton";
import Button from "@/app/components/ui/Button";
import { useUser } from "@/app/contexts/userContext";
import { Cookies, useCookies } from 'next-client-cookies';
import { prepareBodyToShowModal } from "@/app/lib/utils";

/**
 * Interface pour des paramétres pour l'affichage du menu actif
 * 
 * @interface PropsPC
 */
interface HeaderProps {
    activeMenu?: HeaderMenuItems;
}

/**
 * Affiche l'entête de page
 * 
 * @function Header
 * @param { activeMenu } HeaderProps
 * @param { HeaderMenuItems? } HeaderProps.activeMenu - Le menu actif
 */
export default function Header({ activeMenu }: HeaderProps) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const { user, clear } = useUser();
    const cookies: Cookies = useCookies();

    const handleLogout = () => {
        cookies.remove("token");
        cookies.remove("userId");
        clear();
    }

    return (
        <header
            className="flex w-full md:w-1000 md:px-100 items-center justify-between font-normal">
            <Logo size={LogoSizes.Small} className="flex md:hidden" />
            <Logo size={LogoSizes.Large} className="hidden md:flex" />
            <MenuItem
                text="Les chats à adopter"
                isActive={activeMenu === HeaderMenuItems.Home}
                url="/"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />
            <MenuItem
                text="À propos"
                isActive={activeMenu === HeaderMenuItems.About}
                url="/about"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold" />
            {/* <MenuItem
                text="Les chats à adopter"
                isActive={activeMenu === HeaderMenuItems.Adoption}
                url="/adoption"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold w-62 whitespace-nowrap" /> */}
            <IconButton
                icon={isMenuVisible ? IconButtonImages.Cross : IconButtonImages.Menu}
                className="md:hidden mr-11 mb-6"
                imgWidth={isMenuVisible ? 25 : 28}
                imgHeight={isMenuVisible ? 25 : 20}
                svgFill={isMenuVisible ? "#0D0D0D" : "#565656"}
                onClick={() => {
                    setIsMenuVisible(!isMenuVisible);
                    prepareBodyToShowModal(isMenuVisible ? "" : "hidden");
                }} />
            <div
                className={`flex flex-col gap-28 absolute top-85 left-0 right-0 h-full pt-28 px-16 z-2 bg-(--white) items-start ` +
                    (isMenuVisible ? "" : "hidden")}>
                <Link
                    text="Accueil"
                    url="/"
                    className="text-2xl hover:text-(--main-red) hover:font-bold w-full"
                    isActive={activeMenu === HeaderMenuItems.Home}
                />
                <hr className="w-full h-1 border-(--light-grey)" />
                <Link
                    text="À propos"
                    url="/about"
                    className="text-2xl hover:text-(--main-red) hover:font-bold w-full"
                    isActive={activeMenu === HeaderMenuItems.About}
                />
                <hr className="w-full h-1 border-(--light-grey)" />
                <Link
                    text="Messagerie"
                    url="/messenging"
                    className="text-2xl hover:text-(--main-red) hover:font-bold w-full"
                    isActive={activeMenu === HeaderMenuItems.Messaging}
                />
                <hr className="w-full h-1 border-(--light-grey)" />
                <Link
                    text="Adoption"
                    url="/Adoption"
                    className="text-2xl hover:text-(--main-red) hover:font-bold w-full"
                    isActive={activeMenu === HeaderMenuItems.Adoption}
                />
                <hr className="w-full h-1 border-(--light-grey)" />
                {/* <Button
                    text="Ajouter un logement"
                    className="flex items-center bg-(--main-red) rounded-[10px] p-8 px-32 text-(--white) w-full content-center" /> */}
            </div>
        </header >
    );
}
