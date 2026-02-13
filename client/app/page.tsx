'use client';

import {
  useEffect,
  useState,
} from 'react';

//import { Metadata } from 'next';
import Gallery from '@/app/components/data/Gallery';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import {
  HeaderMenuItems,
  InputImageTypes,
  UserRole,
} from '@/app/enums/enums';

import Button from './components/ui/Button';
import Input from './components/ui/Input';
import { useUser } from './contexts/userContext';
import { hasRoles } from './lib/utils';
import { catsService } from './services/client/catsService';

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
 * Affiche la page d'accueil
 * 
 * @function HomePage
 */
export default function HomePage() {
  const [search, setSearch] = useState<string>("");
  const { user } = useUser();
  const service = catsService(false, search);

  useEffect(() => {
    service.refresh(search);
  }, [search]);
  
  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.Home} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) w-full">Association de protection des animaux</span>
          <span className="text-lg text-(--text) font-normal w-full">​Ensemble, écrivons un avenir meilleur pour nos amis les chats !</span>
            <div className="flex w-full items-center justify-center gap-10">
              {user && hasRoles(user.roles, [UserRole.Admin, UserRole.HostFamily]) &&
                    <Input
                      name="search"
                      placeHolder="Rechercher un chat par son numéro d'identification"
                      imageType={InputImageTypes.Search}
                      className="lg:max-w-357 w-full"
                      value={search}
                      showLabel={false}
                      onChange={(e) => setSearch(e.target.value)} />
            }
            {user && hasRoles(user.roles, [UserRole.Admin]) && 
              <Button text='Ajouter une fiche chat' url='/admin/cat' className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) md:w-170' /> }
          </div>
        </div>
      </div>
      <Gallery cats={service.cats ?? []} />
      <Footer />
    </main>
  );
}
