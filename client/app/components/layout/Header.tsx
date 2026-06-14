'use client'

import {
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import { useRouter } from 'next/navigation';

import IconButton from '@/app/components/ui/IconButton';
import Logo from '@/app/components/ui/Logo';
import MenuItem from '@/app/components/ui/MenuItem';
import { useHeader } from '@/app/core/contexts/headerContext';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  LogoSizes,
  UserRoles,
} from '@/app/core/enums/enums';
import {
  hasRoles,
  prepareBodyToShowModal,
} from '@/app/core/lib/utils';
import {
  getAdoptedCatNotFullyCompletedCount,
  getAdoptedCount,
  getCatBoosterVaccinationNoLaterThanOneMonthCount,
  getFACatNotFullyCompletedCount,
} from '@/app/core/services/client/catsService';
import {
  getUnreadMessageByUserId,
} from '@/app/core/services/client/messagingService';
import {
  getVetVouchersCount,
} from '@/app/core/services/client/vetVouchersService';

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
    const { user, isImpersonating, originalUser, stopImpersonation } = useUser();
    const router = useRouter();
    const [unreadMsg, setUnreadMsg] = useState<number>(0);
    const [vetVoucherCount, setVetVoucherCount] = useState<number>(0);
    const [faCatNotFullyCompletedCount, setFACatNotFullyCompletedCount] = useState<number>(0);
    const [adoptedCatNotFullyCompletedCount, setAdoptedCatNotFullyCompletedCount] = useState<number>(0);
    const [adoptedCatCount, setAdoptedCatCount] = useState<number>(0);
    const [catBoosterVaccinationNoLaterThanOneMonthCount, setCatBoosterVaccinationNoLaterThanOneMonthCount] = useState<number>(0);
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    let isHostFamily: boolean = false;
    const { refreshBadges, refreshKey } = useHeader();
    const [innerWidth, setInnerWidth] = useState<number>(0);

    useEffect(() => {
        prepareBodyToShowModal("");
        const interval = setInterval(() => refreshBadges(), 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Initialisation au montage
        setInnerWidth(window.innerWidth);

        const handleResize = () => setInnerWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);   

    useEffect(() => {
        if (token && user) {
            isHostFamily = (hasRoles(user.roles, [UserRoles.HostFamily])) as boolean;
            (async () => {
                const res = await getUnreadMessageByUserId(token, user?.id as string);
                setUnreadMsg(res);
            })();
            if (hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent])) {
                (async () => {
                    const res = await getVetVouchersCount(token);
                    setVetVoucherCount(res);
                })();
            }
            if (hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily])) {
                (async () => {
                    const res = await getFACatNotFullyCompletedCount(token, isHostFamily ? user.id : null);
                    setFACatNotFullyCompletedCount(res);
                })();
            }
            if (hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember])) {
                (async () => {
                    const res = await getAdoptedCatNotFullyCompletedCount(token);
                    setAdoptedCatNotFullyCompletedCount(res);
                })();
            }
            if (hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.HostFamily])) {
                (async () => {
                    const res = await getCatBoosterVaccinationNoLaterThanOneMonthCount(token, isHostFamily ? user.id : null);
                    setCatBoosterVaccinationNoLaterThanOneMonthCount(res);
                })();
            }
        }
        (async () => {
            const res = await getAdoptedCount(token);
            setAdoptedCatCount(res);
        })();

    }, [user, refreshKey]);

    return (
        <>
        {isImpersonating && (
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-10 bg-orange-500 text-white text-sm px-16 py-8">
                <span>Vous naviguez en tant que <strong>{user?.lastName} {user?.name}</strong> (connecté : {originalUser?.lastName} {originalUser?.name})</span>
                <button
                    onClick={() => { stopImpersonation(); router.push('/admin/users'); }}
                    className="cursor-pointer rounded bg-white text-orange-600 font-semibold px-10 py-4 text-xs hover:bg-orange-100"
                >
                    Revenir à mon compte
                </button>
            </div>
        )}
        <header
            className={"flex w-full xl:w-1140 md:p-20 items-center justify-between font-normal" + (isImpersonating ? " mt-71 md:mt-36" : "")}>
            <Logo size={LogoSizes.Small} className="flex md:hidden" />
            <Logo size={LogoSizes.Large} className="hidden md:flex" />
            <div className={`flex flex-col md:flex-row gap-28 absolute md:relative md:h-auto h-[calc(100vh-60px)] left-0 right-0 md:top-auto pt-28 md:pt-0 px-16 z-2 bg-(--white) items-start md:items-center overflow-y-auto md:overflow-visible ` +
                    (isMenuVisible || innerWidth >= 768 ? "" : "hidden") + (isImpersonating ? " top-127" : " top-60")}>
                <MenuItem
                    text="Actualités / évènements"
                    isActive={activeMenu === HeaderMenuItems.Home}
                    url="/"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    iconPath="/images/news.png"
                    forceDisplayTextOnMobile={isMenuVisible} />
                {user && hasRoles(user.roles, [UserRoles.HostFamily]) && <MenuItem
                    text="Mes chats"
                    isActive={activeMenu === HeaderMenuItems.MyCats}
                    url="/mycats"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    iconPath="/images/meschats.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {(!user || (user && !hasRoles(user.roles, [UserRoles.HostFamily]))) && <MenuItem
                    text="Les chats à adopter"
                    isActive={activeMenu === HeaderMenuItems.CatsForAdoption}
                    url="/catsforadoption"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    iconPath="/images/chatsaadopter.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.VetVoucherReferent, UserRoles.HostFamily]) && <MenuItem
                    text="Mes alertes"
                    isActive={activeMenu === HeaderMenuItems.Alerts}
                    url="/myalerts"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    badge={faCatNotFullyCompletedCount + adoptedCatNotFullyCompletedCount + vetVoucherCount + catBoosterVaccinationNoLaterThanOneMonthCount}
                    iconPath="/images/alerte.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent]) && <MenuItem
                    text="Bons vétérinaires"
                    isActive={activeMenu === HeaderMenuItems.VeterinaryVouchers}
                    url="/veterinary"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    badge={vetVoucherCount}
                    iconPath="/images/bonveto.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {/* {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRole.Admin, UserRole.Volunteer]) && <MenuItem
                    text="Evénements"
                    isActive={activeMenu === HeaderMenuItems.Events}
                    url="/events"
                    className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />} */}
                {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HealthRegisterReferent/*, UserRoles.VetVoucherReferent*/]) && <MenuItem
                    text="Chats en FA"
                    isActive={activeMenu === HeaderMenuItems.Adoption}
                    url="/facats"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    badge={hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily]) ? faCatNotFullyCompletedCount : 0}
                    iconPath="/images/chatsFA.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {/* {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRole.Admin, UserRole.Assistant, UserRole.Volunteer]) && <MenuItem
                    text="Bénévoles"
                    isActive={activeMenu === HeaderMenuItems.Volunteers}
                    url="/"
                    className="hidden md:flex text-sm cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap" />} */}
                {(!user || (user && !hasRoles(user.roles, [UserRoles.HostFamily]))) && <MenuItem
                    text="Les chats adoptés Pris en charge"
                    isActive={activeMenu === HeaderMenuItems.AdoptedCats}
                    url="/adoptedcats"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold w-110"
                    badge={adoptedCatCount}
                    iconPath="/images/chatsadoptes.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent, UserRoles.HostFamily]) && <MenuItem
                    text="Messagerie"
                    isActive={activeMenu === HeaderMenuItems.Messaging}
                    url="/messaging"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    badge={unreadMsg}
                    iconPath="/images/messagerie.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {!user && <MenuItem
                    text="À propos"
                    isActive={activeMenu === HeaderMenuItems.About}
                    url="/about"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold"
                    iconPath="/images/apropos.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {!user && <MenuItem
                    text="Se connecter"
                    isActive={activeMenu === HeaderMenuItems.Login}
                    url="/login"
                    className="md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold whitespace-nowrap"
                    iconPath="/images/seconnecter.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
                {user && <MenuItem
                    text={user.lastName + " " + user.name}
                    isActive={activeMenu === HeaderMenuItems.Profile}
                    url="/admin/profile"
                    className={"md:flex cursor-pointer text-(--primary) hover:text-(--primary-dark) hover:font-bold w-90 mb-15 md:mb-0 "+ (innerWidth > 1280 ? "catpaw" : "")}
                    iconPath="/images/profile.png"
                    forceDisplayTextOnMobile={isMenuVisible} />}
            </div>
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
        </header>
        </>
    );
}
