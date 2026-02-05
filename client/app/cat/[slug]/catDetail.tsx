'use client'

import {
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useRouter } from 'next/navigation';

import Carousel from '@/app/components/data/Carousel';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import CollapseElement from '@/app/components/ui/CollapseElement';
import IconButton from '@/app/components/ui/IconButton';
import {
  HeaderMenuItems,
  IconButtonImages,
} from '@/app/enums/enums';
import { Cat } from '@/app/interfaces/cat';
import {
  dateAge,
  prepareBodyToShowModal,
} from '@/app/lib/utils';

/**
 * Interface pour les chats d'initialisation d'un chat
 * 
 * @interface CatProps
 */
interface CatProps {
    cat: Cat | undefined;
}

/**
 * Affiche les détails d'un chat
 * 
 * @async
 * @function Cat
 * @param { string } slug - Identifiant du chat
 */
export default function Property({ cat }: CatProps) {
    const [viewCarousel, setViewCarousel] = useState(false);
    const [carouselImageIndex, setCarouselImageIndex] = useState(0);
    const router = useRouter();

    const viewCarouselAndActiveImage = (viewCarousel: boolean, index: number) => {
        setViewCarousel(viewCarousel);
        setCarouselImageIndex(index);
    }

    const collapseElementContent: string[] = [];
    if (cat?.birthDate) {
        collapseElementContent.push(`${dateAge(cat?.birthDate)} an(s)`);
    }
    if (cat?.sex) {
        collapseElementContent.push(cat?.sex);
    }
    if (cat?.dress) {
        collapseElementContent.push(cat?.dress);
    }
    if (cat?.status) {
        collapseElementContent.push(cat?.status);
    }

    useEffect(() => {
        prepareBodyToShowModal(viewCarousel ? "hidden" : "");
    }, [viewCarousel]);

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            {viewCarousel &&
                createPortal(
                    <Carousel images={cat?.pictures ?? []} imageIndex={carouselImageIndex} closeCarousel={() => setViewCarousel(false)} onIndexChange={setCarouselImageIndex} />,
                    document.body
                )}
            <Header activeMenu={cat?.isAdopted ? HeaderMenuItems.AdoptedCats : HeaderMenuItems.Home} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="lg:flex lg:flex-row lg:gap-10 w-full lg:py-16 lg:px-7 border-b-0 lg:border-b-1 border-solid border-b-(--pink)">
                    <IconButton
                        icon={IconButtonImages.LeftArrow}
                        imgWidth={8}
                        imgHeight={6}
                        text="Retour aux chats"
                        url="#"
                        onClick={() => router.back()}
                        svgFill="#902677"
                        className="text-sm text-(--text) gap-5 bg-(--white) rounded-[10px] py-8 px-16 w-189" />
                </div>
                <div className="flex flex-col lg:flex-row gap-10 w-full lg:flex-wrap">
                    <div className="flex flex-col w-full lg:flex-row gap-10">
                        <div className="flex h-302 overflow-hidden md:justify-center rounded-[10px] ">
                            {cat?.pictures[0] && <img
                                data-testid="property-image-1"
                                src={(cat?.pictures[0].includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + cat?.pictures[0]}
                                alt="Image du chat n°1"
                                className="cursor-pointer rounded-[10px] "
                                style={{ objectFit: "contain" }}
                                onClick={() => viewCarouselAndActiveImage(true, 0)} />}
                        </div>
                        <div className="flex flex-1 flex-wrap gap-10 justify-center lg:justify-normal" style={{ width: "460px" }}>
                            {cat?.pictures.map((pic, idx) => idx > 0 && 
                                <div key={idx} className="rounded-[10px] w-65 h-65 lg:w-146 lg:h-146 overflow-hidden relative">
                                    <img
                                        data-testid={"chat-image-" + idx}
                                        src={(pic.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + pic}
                                        alt={"Image du chat n°" + idx}
                                        className="cursor-pointer"
                                        style={{ objectFit: "contain" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 1)} />
                                    </div>)}
                        </div>
                        { cat?.hostFamily && <div
                            className="flex flex-col w-full lg:w-185 gap-8 border border-solid border-(--pink) rounded-[10px] p-24 bg-(--white) order-1 lg:order-0">
                            <span className="text-base text-(--text)">L'adoptant</span>
                            <div className="flex flex-1 gap-18 pt-16 pb-16 items-center">
                                <div className="rounded-[10px] w-81 h-82 overflow-hidden relative">
                                    {/* {cat?.host.picture && <Image src={cat?.host.picture} alt="Image de l'hôte" fill style={{ objectFit: "cover" }} />} */}
                                </div>
                                <span className="text-base text-(--text) font-normal">{cat?.hostFamily?.name}</span>
                            </div>
                            <Button
                                url="/messenging"
                                text="Envoyer un message"
                                className="text-sm text-(--white) bg-(--primary) rounded-[10px] py-8 px-8" />
                        </div>}
                    </div>
                    <div className="flex flex-col gap-40 lg:w-full bg-(--white) rounded-[10px] border boder-solid border-(--pink) p-24 order-0 lg:order-1">
                        <div className="flex flex-col gap-32">
                            <div className="flex flex-col gap-16">
                                <span className="text-2xl text-(--text)">{cat?.name}</span>
                            </div>
                            <p className="text-sm text-(--text) font-normal whitespace-break-spaces">{cat?.description}</p>
                        </div>
                        <CollapseElement title="Informations" content={collapseElementContent} />
                    </div>
                </div>
            </div>
            <Footer />
        </main >
    );
}
