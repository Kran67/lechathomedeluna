import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import { HeaderMenuItems } from "@/app/enums/enums";
import Image from "next/image";
import { Metadata } from "next";
import Luna from "@/app/assets/images/luna.png";

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
        <main className="flex flex-col gap-40 w-full items-center md:pt-40 md:px-140">
            <Header activeMenu={HeaderMenuItems.About} />
            <div className="flex flex-col gap-51 md:gap-40 w-full xl:w-1115 items-center px-16 md:pb-80 ">
                <div className="flex flex-col gap-8 w-full md:w-742">
                    <span className="text-[32px] font-bold text-(--primary)">Qui est Luna ?</span>
                    <div className="flex gap-5">
                        <Image src={Luna} width={240} height={300} alt="Photo de Luna" />
                        <span className="text-lg text-(--text)">
                            Née d'une chatte errante, Luna est la minette de notre présidente Sylive qui avait à coeur d'aider les chats comme elle aideLuna au quotidient.
                            <br /><br />
                            Et oui, notre belle mascotte de 17 ans est malade depuis plus de 10 ans. Atteinte de diabète, d'insuffisance rénale, d'une pancréatite chronique et d'hypertension.
                            <br /><br />
                            C'est Sylvie qui, tous les jours, lui adlinistre tous les soins. C'est son petit bébé et c'est pour cela qu'elle à souhaité donner son nom à l'association.
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-51 md:gap-40 w-full xl:w-1115 items-center px-16 md:pb-80 ">
                <div className="flex flex-col gap-8 w-full md:w-742">
                    <span className="text-[32px] font-bold text-(--primary)">Notre histoire</span>
                    <span className="text-lg text-(--text)">
                        Nous sommes une association bas-rhinoise qui milite pour la protection des chats errants et abandonnés.
                        <br /><br />
                        Nos bénévoles trappent les chats abandonnés, errants, ou encore mal en point, afin qu’ils soient pris en charge pour être soignés, identifiés, stérilisés. Certains de ces chats sont proposés à l’adoption, si nous jugeons qu’ils peuvent l’être. Dans le cas contraire, les loulous sont relâchés sur une colonie où ils sont nourris tous les jours. Ils deviennent alors nos protégés, et bénéficient de soins et d’un suivi médical.
                        <br /><br />
                        Notre association participe à diverses actions comme des collectes de nourriture, litière, jouets, etc. dans les magasins du secteur. De plus, nous organisons des campagnes de stérilisation dans les villages avec l’aide de la sacpa du bas-rhin, afin de stériliser la population féline à la demande des maires des communes.
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-51 md:gap-40 w-full xl:w-1115 items-center px-16 md:pb-80 ">
                <div className="flex flex-col gap-8 w-full md:w-742">
                    <span className="text-[32px] font-bold text-(--primary)">Nos missions</span>
                    <span className="text-lg text-(--text)">
                        Nous sommes fiers d'assumer une véritable mission d'intérêt général en agissant pour la sécurité et l'amélioration de la qualité de vie des chats libres et des chats domestiques abandonnés. Nos bénévoles agissent avec leur coeur et leurs convictions.
                        Voici quelques lignes qui résument les diverses actions que nous menons sur le terrain :
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-51 md:gap-40 w-full xl:w-1115 items-center px-16 md:pb-80 ">
                <div className="flex flex-col gap-8 w-full md:w-742">
                    <span className="text-[32px] font-bold text-(--primary)">Qui sommes-nous</span>
                    <span className="text-lg text-(--text)">
                        Nous sommes une association Bas-Rhinoise qui milite pour la protection des chats errants et abandonnés.
                        <br /><br />
                        Nos bénévoles trappent les chats abandonnés, errants, ou encore mal en point, afin qu’ils soient pris en charge pour être soignés, identifiés, stérilisés. Certains de ces chats sont proposés à l’adoption, si nous jugeons qu’ils peuvent l’être. Dans le cas contraire, les loulous sont relâchés sur une colonie où ils sont nourris tous les jours. Ils deviennent alors nos protégés, et bénéficient de soins et d’un suivi médical.
                        <br /><br />
                        Notre association participe à diverses actions comme des collectes de nourriture, litière, jouets, etc. dans les magasins du secteur. De plus, nous organisons des campagnes de stérilisation dans les villages avec l’aide de la SACPA du Bas-Rhin, afin de stériliser la population féline à la demande des maires des communes.
                    </span>
                </div>
            </div>
            <Footer />
        </main>
    );
}
