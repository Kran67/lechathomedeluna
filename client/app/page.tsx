'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import dynamic from 'next/dynamic';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  UserRole,
} from '@/app/enums/enums';
import { hasRoles } from '@/app/lib/utils';
import {
  deleteNew,
  newsService,
} from '@/app/services/client/newsService';
import { newsPeriods } from '@/app/staticLists/staticLists';

import IconButton from './components/ui/IconButton';
import { New } from './interfaces/new';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//  title: "Le Chat'Home de Luna - Accueil",
//  description: "Affichage de la page d'accueil avec la listes des actualités"
//};

/**
 * Affiche la page d'accueil
 * 
 * @function HomePage
 */
export default function HomePage() {
  const [period, setPeriod] = useState<"current" | "next">("current");
  const { user } = useUser();
  const service = newsService(period);
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");

  useEffect(() => {
    service.refresh(period);
  }, [period]);

  const deleteNews = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
      await deleteNew(token, id);
      service.refresh(period);      
    }
  };
  
  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.Home} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115 jsustify-center items-center">
        <div className="flex gap-8 w-full lg:w-260 items-center justify-center">
          <span className="text-[32px] text-(--primary)">Actualités</span>
          <Select
            options={newsPeriods}
            className="select"
            classNamePrefix="select"
            name="period"
            id="period"
            isMulti={false}
            isClearable={false}
            isSearchable={false}
            placeholder="Période"
            value={period ? newsPeriods.find((option) => option.value === period) : null}
            onChange={(e:any) => setPeriod(e?.value ?? null)}
            styles={{container: provided => ({
                ...provided,
                maxWidth: 140
            })}}
          />
        </div>
        <div className="flex w-full items-center justify-center gap-10">
          {user && hasRoles(user.roles, [UserRole.Admin]) && 
            <Button text='Ajouter une actualité' url='/admin/news' className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white) md:w-170' /> }
        </div>
        {service.news && service.news.length === 0 && <span className="text-(--text) text-center">Aucune actualité pour le moment.</span>}
        {service.news && service.news.map((newItem: New, idx: number) => (
          <div key={newItem.id + idx} className='relative'>
            {user && hasRoles(user.roles, [UserRole.Admin]) && <IconButton
                            icon={IconButtonImages.Trash}
                            imgWidth={16}
                            imgHeight={16}
                            className={"w-32 h-32 absolute right-16 top-16 bg-(--primary) z-1 rounded-[5px] flex items-center justify-center"}
                            svgFill="#FFF"
                            onClick={(e) => deleteNews(e, newItem.id)}
                            title="Supprimer l'actualité"
                        />
            }
            <img
              src={(newItem.url.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + newItem.url}
              alt={`Image de l'actualité du ${newItem.date}`} className="" />
            </div>
          ))}
      </div>
      <Footer />
    </main>
  );
}
