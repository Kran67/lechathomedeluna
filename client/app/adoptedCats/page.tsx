'use client';

import {
  useEffect,
  useState,
} from 'react';

import dynamic from 'next/dynamic';

import Gallery from '@/app/components/data/Gallery';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Input from '@/app/components/ui/Input';
import {
  HeaderMenuItems,
  InputImageTypes,
} from '@/app/enums/enums';
import { catsService } from '@/app/services/catsService';

const Select = dynamic(() => import("react-select"), { ssr: false });

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
 * Affiche la page des chats adoptés
 * 
 * @function AdoptedCats
 */
export default function AdoptedCats() {
  const [search, setSearch] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const service = catsService(true, search, year);

  const Years: {
    value: number;
    label: number;
  }[] = [];
  for (let i = 2022; i <= new Date().getFullYear(); i++) {
    Years.push({ value: i, label: i});
  }

  useEffect(() => {
    service.refresh(search);
  }, [search, year]);
  
  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.AdoptedCats} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) w-full">Les chats qui ont été adoptés</span>
          <div className="flex gap-5 w-full items-center justify-center">
            <Input
              name="search"
              placeHolder="Rechercher un chat par son numéro d'identification"
              imageType={InputImageTypes.Search}
              className="lg:max-w-357 w-full"
              value={search}
              showLabel={false}
              onChange={(e) => setSearch(e.target.value)} />
            <Select
                options={Years}
                className="select"
                classNamePrefix="select"
                name="role"
                id="role"
                isMulti={false}
                isClearable={false}
                isSearchable={true}
                placeholder="Année d'adoption"
                value={Years.find(c => c.value === year)}
                onChange={(e:any) => setYear(e?.value ?? "")}
                styles={{container: provided => ({
                    ...provided,
                    width: 170
                })}}
            />

          </div>
        </div>
      </div>
      <Gallery cats={service.cats ?? []} />
      <Footer />
    </main>
  );
}
