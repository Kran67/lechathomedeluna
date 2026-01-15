import { LogoSizes } from "@/app/enums/enums";
import Logo from "@/app/components/ui/Logo";

/**
 * Affiche le bas de page
 * 
 * @function Footer
 */
export default function Footer() {
    return (
        <footer className="flex w-full xl:w-1140 py-8 px-10 md:px-40 justify-between border-t-1 border-t-(--pink) border-t-solid items-center">
            <Logo size={LogoSizes.Small} className="" />
            <div className="flex gap-5">
                <span className="text-(--text) text-xs">© 2026 LeChatHomeDeLuna.</span>
                <span className="text-(--text) text-xs">Tous droits réservés</span>
            </div>
        </footer>
    );
}