'use client'

import {
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';

import IconButton from '@/app/components/ui/IconButton';
import Link from '@/app/components/ui/Link';
import Logo from '@/app/components/ui/Logo';
import MenuItem from '@/app/components/ui/MenuItem';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  LogoSizes,
  UserRoles,
} from '@/app/enums/enums';
import {
  hasRoles,
  prepareBodyToShowModal,
} from '@/app/lib/utils';
import {
  getAdoptedCatNotFullyCompletedCount,
  getCatNotFullyCompletedCount,
} from '@/app/services/client/catsService';
import {
  getUnreadMessageByUserId,
} from '@/app/services/client/messagingService';
import { getVetVouchersCount } from '@/app/services/client/vetVouchersService';

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
    const [unreadMsg, setUnreadMsg] = useState<number>(0);
    const [vetVoucherCount, setVetVoucherCount] = useState<number>(0);
    const [catNotFullyCompletedCount, setCatNotFullyCompletedCount] = useState<number>(0);
    const [adoptedCatNotFullyCompletedCount, setAdoptedCatNotFullyCompletedCount] = useState<number>(0);
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;

    useEffect(() => {
        if (token) {
            (async () => {
                const res = await getUnreadMessageByUserId(token, user?.id as string);
                setUnreadMsg(res);
            })();
            if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.VetVoucherReferent])) {
                (async () => {
                    const res = await getVetVouchersCount(token);
                    setVetVoucherCount(res);
                })();
            }
            if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.AdoptionReferent])) {
                (async () => {
                    const res = await getCatNotFullyCompletedCount(token);
                    setCatNotFullyCompletedCount(res);
                })();
            }
            if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember])) {
                (async () => {
                    const res = await getAdoptedCatNotFullyCompletedCount(token);
                    setAdoptedCatNotFullyCompletedCount(res);
                })();
            }
        }
    }, [user]);

    return (
        <header
            className="flex w-full xl:w-1140 md:p-20 items-center justify-between font-normal">
            <Logo size={LogoSizes.Small} className="flex md:hidden" />
            <Logo size={LogoSizes.Large} className="hidden md:flex" />
            <MenuItem
                text="Actualités / évènements"
                isActive={activeMenu === HeaderMenuItems.Home}
                url="/"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />
            {user && hasRoles(user.roles, [UserRoles.HostFamily]) && <MenuItem
                text="Mes chats"
                isActive={activeMenu === HeaderMenuItems.MyCats}
                url="/myCats"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && !hasRoles(user.roles, [UserRoles.HostFamily]) && <MenuItem
                text="Les chats à adopter"
                isActive={activeMenu === HeaderMenuItems.CatsForAdoption}
                url="/catsForAdoption"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]) && <MenuItem
                text="Mes alertes"
                isActive={activeMenu === HeaderMenuItems.Alerts}
                url="/myAlerts"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                badge={unreadMsg + vetVoucherCount + catNotFullyCompletedCount + adoptedCatNotFullyCompletedCount} />}
            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.VetVoucherReferent]) && <MenuItem
                text="Bons vétérinaires"
                isActive={activeMenu === HeaderMenuItems.VeterinaryVouchers}
                url="/veterinary"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                badge={vetVoucherCount} />}
            {/* {user && hasRoles(user.roles, [UserRole.Admin, UserRole.Volunteer]) && <MenuItem
                text="Evénements"
                isActive={activeMenu === HeaderMenuItems.Events}
                url="/events"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />} */}
            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HealthRegisterReferent, UserRoles.VetVoucherReferent]) && <MenuItem
                text="Chats en FA"
                isActive={activeMenu === HeaderMenuItems.Adoption}
                url="/faCats"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                badge={hasRoles(user.roles, [UserRoles.Admin, UserRoles.AdoptionReferent]) ? catNotFullyCompletedCount : 0} />}
            {/* {user && hasRoles(user.roles, [UserRole.Admin, UserRole.Assistant, UserRole.Volunteer]) && <MenuItem
                text="Bénévoles"
                isActive={activeMenu === HeaderMenuItems.Volunteers}
                url="/"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />} */}
            {user && !hasRoles(user.roles, [UserRoles.HostFamily]) && <MenuItem
                text="Les chats adoptés"
                isActive={activeMenu === HeaderMenuItems.AdoptedCats}
                url="/adoptedCats"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                badge={adoptedCatNotFullyCompletedCount} />}
            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]) && <MenuItem
                text="Messagerie"
                isActive={activeMenu === HeaderMenuItems.Messaging}
                url="/messaging"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                badge={unreadMsg} />}
            {!user && <MenuItem
                text="À propos"
                isActive={activeMenu === HeaderMenuItems.About}
                url="/about"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold" />}
            {!user && <MenuItem
                text="Se connecter"
                isActive={activeMenu === HeaderMenuItems.Login}
                url="/login"
                className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />}
            {user && <MenuItem
                text={user.lastName + " " + user.name}
                isActive={activeMenu === HeaderMenuItems.Profile}
                url="/admin/profile"
                className="hidden md:flex text-lg cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold w-90 catpaw" />}
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
                    url="/messaging"
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
