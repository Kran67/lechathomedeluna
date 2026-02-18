'use client';

import Gallery from '@/app/components/data/Gallery';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import { HeaderMenuItems } from '@/app/enums/enums';
import { catsService } from '@/app/services/client/catsService';

import { useUser } from '../contexts/userContext';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//  title: "Le Chat'Home de Luna - Accueil",
//  description: "Affichage de la page d'accueil avec la listes des chats"
//};

/**
 * Affiche la page mes chats
 * 
 * @function MyCats
 */
export default function MyCats() {
  const { user } = useUser();
  const service = catsService(undefined, undefined, 0, user?.id);

  const Years: {
    value: number;
    label: number;
  }[] = [];
  for (let i = 2026; i <= new Date().getFullYear(); i++) {
    Years.push({ value: i, label: i});
  }
  
  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.MyCats} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) w-full">Mes chats</span>
        </div>
      </div>
      <Gallery cats={service.cats ?? []} />
      <Footer />
    </main>
  );
}
