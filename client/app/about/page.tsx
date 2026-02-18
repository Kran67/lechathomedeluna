import { Metadata } from 'next';
import Image from 'next/image';

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
    title: "Le Chat'Home de Luna - À propos",
    description: "À propos Le Chat'Home de Luna"
};

/**
 * Affiche la page À propos
 * 
 * @function AboutPage
 */
export default function AboutPage() {
    return (
        <main className="flex flex-col gap-20 w-full md:pt-20 md:px-140 items-center">
            <Header activeMenu={HeaderMenuItems.About} />
            <div className="flex flex-col gap-10 w-900 text-xl text-(--primary) relative">
                <h1 className="text-[32px] self-center font-bold text-(--primary) uppercase">Qui est Luna ?</h1>
                <div className="self-center text-xl text-(--primary)">Le mot de Sylvie, la présidente.</div>
                <div className="text-[32px] font-bold text-(--primary)">Luna, tu es rentrée dans ma vie et tu as tout changé.</div><br />
                <div className="text-xl text-(--primary) self-start">Tout a commencé grâce à toi, Luna, le jour où nos routes se sont croisées.</div><br />
                <div className="text-xl text-(--primary) self-start">Toute ta vie a été un combat face à toutes ces maladies que tu as développées et que nous avons toujours réussi à faire reculer..</div>
                <div className="text-xl text-(--primary) self-start">Tu étais une force de la nature, portée par <span className="text-[24px] font-bold">mon amour inconditionnel</span>.</div><br />
                <div className="text-xl text-(--primary) self-start">Aujourd’hui, tu nous a quitté, à l’aube de tes 20 ans, dans mes bras.</div>
                <div className="text-xl text-(--primary) self-start">Ton dernier souffle sur mon cou m’a insufflé <span className="text-[24px] font-bold">la force</span> pour continuer.</div>
                <div className="text-xl text-(--primary) self-start">J’ai compris, mon amour, mon trésor que tu serai là, <span className="text-[24px] font-bold">pour toujours</span>.</div><br />
                <div className="text-xl text-(--primary) self-start"><span className="text-[24px] font-bold">En ton honneur</span>, et pour tout l’amour que je te porte à jamais, ce combat sera dorénavant <span className="text-[24px] font-bold">plus fort et plus intense encore</span>.</div><br />
                <div className="text-xl text-(--primary) self-start">Grace à toi, nous avons sauvé tant d’autres chats qui vivaient la même détresse que ta maman que nous avons recueilli juste avant ta naissance.</div>
                <div className="text-xl text-(--primary) self-start"><span className="text-[24px] font-bold">Cette mission</span>, je vais la poursuivre aussi longtemps que possible, avec toujours toi dans mes pensées.</div>
                <div className="text-[24px] font-bold text-(--primary) self-start"> Ce n’est que le début.</div><br /><br /><br /><br />
                <div className="text-xl text-(--primary) self-start">Tous les bénévoles, familles d’accueil, généreux donateurs, adoptants, simples anonymes venant à notre rencontre œuvrent pour cette belle mission.</div>
                <div className="text-xl text-(--primary) self-start">Je fais le voeux que là où tu es aujourd’hui, tu es apaisée, entourée de douceur, et que tu reposes en paix.</div>
                <div className="text-xl text-(--primary) self-start">Tu seras toujours là, avec nous, pour l’éternité.</div><br />
                <div className="text-[32px] text-(--primary) self-center">TOI, MA FILLE, <span className="text-[36px] font-bold">LUNA</span></div>
                <i className="absolute fa fa-paw -rotate-25 !text-[80px] text-(--primary) left-200 opacity-50"></i>
                <i className="absolute fa fa-paw rotate-30 !text-[50px] text-(--primary) right-10 opacity-50 top-300"></i>
                <i className="absolute fa fa-paw -rotate-15 !text-[40px] text-(--primary) -left-40 opacity-50 top-450"></i>
                <i className="absolute fa fa-paw rotate-15 !text-[40px] text-(--primary) right-0 opacity-50 top-800"></i>
                <i className="absolute fa fa-paw -rotate-35 !text-[40px] text-(--primary) opacity-50 left-250 top-1150"></i>
                <i className="absolute fa fa-paw rotate-45 !text-[40px] text-(--primary) right-0 opacity-50 top-1150"></i>
                <Image src="/images/luna.png" alt="Luna" width={114} height={145} className="absolute right-100 top-800" />
            </div>
            <Footer />
        </main>
    );
}
