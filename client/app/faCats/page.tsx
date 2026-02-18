'use client';

import {
  SetStateAction,
  useEffect,
  useState,
} from 'react';

//import { Metadata } from 'next';
import Gallery from '@/app/components/data/Gallery';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  InputImageTypes,
  UserRole,
} from '@/app/enums/enums';
import { hasRoles } from '@/app/lib/utils';
import { catsService } from '@/app/services/client/catsService';

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
 * Affiche la page Adoption
 * 
 * @function AdoptionPage
 */
export default function AdoptionPage() {
  const [search, setSearch] = useState<string>("");
  const { user } = useUser();
  const service = catsService(undefined, search);

  useEffect(() => {
    service.refresh(search);
  }, [search]);

  return (
        <main className="flex flex-col gap-20 w-full items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.Adoption} />
            <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
                <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
                <span className="text-[32px] text-(--primary) w-full">Les chats nouvellement accuillis</span>
                <span className="text-lg text-(--text) font-normal w-full">Fiches de chats en attente de validation</span>
                    <div className="flex w-full items-center justify-center gap-10">
                    {user && hasRoles(user.roles, [UserRole.Admin, UserRole.Assistant]) &&
                            <Input
                            name="search"
                            placeHolder="Rechercher un chat par son numéro d'identification ou son nom"
                            imageType={InputImageTypes.Search}
                            className="lg:max-w-357 w-full"
                            value={search}
                            showLabel={false}
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearch(e.target.value)} />
                    }
                </div>
                </div>
            </div>
            <Gallery cats={service.cats ?? []} />
            {/* <div className="flex flex-col gap-51 md:gap-20 w-full xl:w-1115 items-center px-16 md:pb-20 ">
                <span className="text-[32px] font-bold text-(--primary)">Pourquoi adopter ?</span>
                <span className="text-lg font-bold text-(--primary)">Pourquoi adopter auprès d’une association ?</span>
                <Image src={Adoption} width={707} height={426} alt="Photo d'adoption" />
                <span className="text-lg font-bold text-(--primary)">L'adoption, ce n'est pas si coûteux qu'on ne le pense...</span>
                <Image src={AdoptionTarifs} width={451} height={509} alt="Photo d'adoption tarifs" />
                <span className="text-sm font-bold text-(--primary)">+ 20 € si l'association prend en charge le rappel du vaccin</span>
                <span className="text-lg font-bold text-(--primary)">Pourquoi adopter auprès d’une association ?</span>
            </div>
            <div className="flex flex-col gap-51 md:gap-20 w-full xl:w-1115 px-16 md:pb-80 ">
                <span className="text-base text-(--text) font-normal text-left">Pas de surprise sur la personnalité de l’animal et sa santé !</span>
                <p className="text-sm text-(--black) font-normal text-justify">
                    Tous nos loulous bénéficient d’un suivi vétérinaire depuis leur arrivée au CHL ! Nous vous remettrons le carnet de santé à jour de votre animal ; son état de santé n’aura donc pas de secret pour vous ! 
                    Nous suivons aussi l’évolution comportementale de chaque nouvel arrivant au CHL ! La plupart de nos chats à l’adoption ont connu un passé traumatisant (errance, abandon, maltraitance…). Une fois que tous les soins nécessaires sont prodigués, nous plaçons les chats en famille d’accueil. Elle a le rôle d’observer le développement et les capacités d’adaptabilité de nos petits protégés ! Cette phase de sociabilisation est gage de réussite : elle nous permettra de définir les besoins spécifiques de chaque chat et de choisir la meilleure famille pour eux !                    
                </p>
                <span className="text-base text-(--text) font-normal text-left">Un accompagnement de proximité, avec beaucoup d’humanité !</span>
                <p className="text-sm text-(--black) font-normal text-justify">
                    Le CHL est une petite association composée de passionnés et de fervents défenseurs de la protection des p’tits félins ! Quand l’un de nos petits protégés est adopté, nous prenons des nouvelles de sa nouvelle famille. Échanges, partages, convivialité, entraide, solidarité… Nous formons une famille et nous nous assurons que tout se passe bien, même après l’adoption !
                    Nous avons aussi la chance de compter parmi nos bénévoles des experts en bien-être animal : comportementaliste, ostéopathe, homéopathe, maître Reiki… Des soins alternatifs doux et naturels qui font tellement de bien à nos amis poilus ! Selon vos besoins, elles pourront vous guider et vous apporter de précieux conseils.                </p>
            </div>
            <div className="flex flex-col gap-51 md:gap-20 w-full xl:w-1115 items-center px-16 md:pb-20 ">
                <span className="text-[32px] font-bold text-(--primary)">Êtes-vous prêt pour l'adoption ?</span>
                <Image src={AdoptionReady} width={576} height={576} alt="Photo êtes-vous prêt pour l'adoption" />
            </div> */}
            <Footer />
        </main>
    );
}
