'use client'

import { useState } from 'react';

import IconButton from '@/app/components/ui/IconButton';
import Link from '@/app/components/ui/Link';
import Logo from '@/app/components/ui/Logo';
import MenuItem from '@/app/components/ui/MenuItem';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  LogoSizes,
  UserRole,
} from '@/app/enums/enums';
import {
  hasRole,
  prepareBodyToShowModal,
} from '@/app/lib/utils';

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
    const { user } = useUser();

    return (
        <header
            className="flex w-full xl:w-1140 md:p-20 items-center justify-between font-normal">
            <Logo size={LogoSizes.Small} className="flex md:hidden" />
            <Logo size={LogoSizes.Large} className="hidden md:flex" />
            <MenuItem
                text="Les chats à adopter"
                isActive={activeMenu === HeaderMenuItems.Home}
                url="/"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />
            {user && hasRole(user.role, [UserRole.Admin, UserRole.Assistant]) && <MenuItem
                text="Registre sanitaire"
                isActive={activeMenu === HeaderMenuItems.HealthRegister}
                url="/healthRegister"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && hasRole(user.role, [UserRole.Admin, UserRole.Assistant]) && <MenuItem
                text="Bons vétérinaires"
                isActive={activeMenu === HeaderMenuItems.VeterinaryVouchers}
                url="/veterinary"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && hasRole(user.role, [UserRole.Admin, UserRole.Volunteer]) && <MenuItem
                text="Evénements"
                isActive={activeMenu === HeaderMenuItems.Events}
                url="/events"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            <MenuItem
                text="Adoption"
                isActive={activeMenu === HeaderMenuItems.Adoption}
                url="/adoption"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />
            {user && hasRole(user.role, [UserRole.Admin, UserRole.Assistant, UserRole.Volunteer]) && <MenuItem
                text="Bénévoles"
                isActive={activeMenu === HeaderMenuItems.Volunteers}
                url="/"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            <MenuItem
                text="Les chats adoptés"
                isActive={activeMenu === HeaderMenuItems.AdoptedCats}
                url="/adoptedCats"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />
            {user && hasRole(user.role, [UserRole.Admin, UserRole.Assistant, UserRole.HostFamily]) && <MenuItem
                text="Messagerie"
                isActive={activeMenu === HeaderMenuItems.Messaging}
                url="/messaging"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            <MenuItem
                text="À propos"
                isActive={activeMenu === HeaderMenuItems.About}
                url="/about"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold" />
            {!user && <MenuItem
                text="Se connecter"
                isActive={activeMenu === HeaderMenuItems.Login}
                url="/login"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && <MenuItem
                text={user.name + " " + user.lastName}
                isActive={activeMenu === HeaderMenuItems.Profile}
                url="/admin/profile"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold w-90" />}
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
