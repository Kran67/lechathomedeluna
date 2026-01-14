import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { HeaderMenuItems } from "@/app/enums/enums";
import HomeImage from "@/app/assets/images/home.jpg";
import Image from "next/image";
import Gallery from "@/app/components/data/Gallery";
import { Metadata } from "next";

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export const metadata: Metadata = {
  title: "Le Chat'Home de Luna - Accueil",
  description: "Affichage de la page d'accueil avec la listes des chats"
};

/**
 * Affiche la page d'accueil
 * 
 * @function HomePage
 */
export default function HomePage() {
  return (
    <main className="flex flex-col gap-51 md:gap-40 w-full items-center md:pt-40 md:px-140">
      <Header activeMenu={HeaderMenuItems.Home} />
      <div className="flex flex-col gap-51 md:gap-40 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) lg:w-342 w-full">Association de protection des animaux</span>
          <span className="text-sm text-(--text) font-normal w-full">​Ensemble, écrivons un avenir meilleur pour nos amis les chats !</span>
        </div>
        {/* <div className="flex flex-col rounded-[20px] bg-(--white) relative overflow-hidden h-458">
          <Image src={HomeImage} alt="Image de la propriété" className="absolute -left-389 md:-left-2 -top-219 max-w-1117 h-894" />
        </div> */}
      </div>
      <Gallery />
      {/* <div className="flex flex-col gap-40 w-full lg:w-1114 py-40 px-8 md:p-40 rounded-[10px] bg-(--white)">
        <div className="flex flex-col gap-16 items-center">
          <span className="text-2xl text-(--text) font-semibold">Comment ça marche ?</span>
          <span className="text-sm text-(--text) font-normal text-center">Que vous partiez pour un week-end improvisé, des vacances en famille ou un voyage professionnel,<br />Kasa vous aide à trouver un lieu qui vous ressemble.</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16 justify-center">
          <div className="flex flex-col text-(--white) bg-(--primary) py-44 px-22 gap-17 w-full lg:w-270 rounded-[10px] h-199">
            <span className="text-lg">Recherchez</span>
            <span className="text-xs font-normal">Entrez votre destination, vos dates et laissez Kasa faire le reste</span>
          </div>
          <div className="flex flex-col text-(--white) bg-(--primary) py-44 px-22 gap-17 w-full lg:w-270 rounded-[10px] h-199">
            <span className="text-lg">Réservez</span>
            <span className="text-xs font-normal">Profitez d’une plateforme sécurisée et de profils d’hôtes vérifiés.</span>
          </div>
          <div className="flex flex-col text-(--white) bg-(--primary) py-44 px-22 gap-17 w-full lg:w-270 rounded-[10px] h-199">
            <span className="text-lg">Vivez l’expérience</span>
            <span className="text-xs font-normal">Installez-vous, profitez de votre séjour, et sentez-vous chez vous, partout.</span>
          </div>
        </div>
      </div> */}
      <Footer />
    </main>
  );
}
