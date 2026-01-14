import { LogoSizes } from "@/app/enums/enums";
import Logo from "@/app/components/ui/Logo";

/**
 * Affiche le bas de page
 * 
 * @function Footer
 */
export default function Footer() {
    return (
        <footer className="flex w-full xl:w-1140 py-8 px-40 justify-between border-t-1 border-t-(--light-grey) border-t-solid items-center bg-(--white)">
            <Logo size={LogoSizes.Small} className="" />
            <span className="text-(--dark-grey) text-xs whitespace-nowrap">© 2026 LeChatHomeDeLuna. Tous droits réservés</span>
        </footer>
    );
}