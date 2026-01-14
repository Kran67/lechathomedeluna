import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import Button from "@/app/components/ui/Button";
import type { Metadata } from "next";

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
export const metadata: Metadata = {
    title: "Le Chat'Home de Luna - Page non trouvée",
};

/**
 * Affiche la page 404
 * 
 * @function NotFoundPage
 */
export default function NotFoundPage() {
    return (
        <main className="flex flex-col gap-40 w-full items-center px-5 md:pt-40 md:px-140 h-screen justify-between">
            <Header />
            <div className="flex flex-col gap-40 w-full md:w-342">
                <div className="flex flex-col items-center">
                    <span className="text-[100px] text-(--primary) font-black">404</span>
                    <span className="text-sm text-(--text) text-center">Il semble que la page que vous cherchez ait pris des vacances… ou n’ait jamais existé.</span>
                </div>
                <div className="flex flex-col gap-14 items-center">
                    <Button text="Accueil" url='/' className="flex justify-center bg-(--main-red) rounded-[10px] p-8 px-32 text-(--white) w-200" />
                    <Button text="Logements" url='/' className="flex justify-center bg-(--main-red) rounded-[10px] p-8 px-32 text-(--white) w-200" />
                </div>
            </div>
            <Footer />
        </main>
    )
}