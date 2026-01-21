import { Metadata } from 'next';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import { HeaderMenuItems } from '@/app/enums/enums';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export const metadata: Metadata = {
    title: "Le Chat'Home de Luna - Bons vétérinaires",
    description: "Bons vétérinaires - Le Chat'Home de Luna"
};

/**
 * Affiche la page Veterinary
 *
 * @function VeterinaryPage
 */
export default function VeterinaryPage() {
    return (
        <main className="flex flex-col gap-20 w-full items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.VeterinaryVouchers} />
            <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
                <span className="text-[32px] text-(--primary) w-full">Page des bons vétérinaires</span>
            </div>
            <Footer />
        </main>
    );
}
