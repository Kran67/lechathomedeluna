'use client'

import {
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Image from 'next/image';
import {
  redirect,
  RedirectType,
} from 'next/navigation';

import Carousel from '@/app/components/data/Carousel';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import CollapseElement from '@/app/components/ui/CollapseElement';
import IconButton from '@/app/components/ui/IconButton';
import { useUser } from '@/app/contexts/userContext';
import { IconButtonImages } from '@/app/enums/enums';
import {
  dateAge,
  prepareBodyToShowModal,
} from '@/app/lib/utils';
import { catService } from '@/app/services/catService';

/**
 * Interface pour les chats d'initialisation d'un chat
 * 
 * @interface CatProps
 */
interface CatProps {
    slug: string;
}

/**
 * Affiche les détails d'un chat
 * 
 * @async
 * @function Cat
 * @param { string } slug - Identifiant du chat
 */
export default function Property({ slug }: CatProps) {
    const { user } = useUser();
    // on va chercher le chat
    const { cat, error } = catService(slug);
    // si le chat n'a pas été trouvée, on redirige vers la page 404
    if (cat?.error || error) {
        redirect("/404", RedirectType.push);
    }

    const [viewCarousel, setViewCarousel] = useState(false);
    const [carouselImageIndex, setCarouselImageIndex] = useState(0);

    const viewCarouselAndActiveImage = (viewCarousel: boolean, index: number) => {
        setViewCarousel(viewCarousel);
        setCarouselImageIndex(index);
    }

    useEffect(() => {
        prepareBodyToShowModal(viewCarousel ? "hidden" : "");
    }, [viewCarousel]);

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            {viewCarousel &&
                createPortal(
                    <Carousel images={cat?.pictures} imageIndex={carouselImageIndex} closeCarousel={() => setViewCarousel(false)} onIndexChange={setCarouselImageIndex} />,
                    document.body
                )}
            <Header />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="lg:flex lg:flex-row lg:gap-10 w-full lg:py-16 lg:px-7 border-b-0 lg:border-b-1 border-solid border-b-(--pink)">
                    <IconButton
                        icon={IconButtonImages.LeftArrow}
                        imgWidth={8}
                        imgHeight={6}
                        text="Retour aux chats"
                        url="/"
                        svgFill="#902677"
                        className="text-sm text-(--text) gap-5 bg-(--white) rounded-[10px] py-8 px-16 w-189" />
                </div>
                <div className="flex flex-col lg:flex-row gap-10 w-full lg:flex-wrap">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex w-full lg:w-303 h-357 overflow-hidden md:justify-center rounded-[10px] ">
                            {cat?.pictures[0] && <Image
                                data-testid="property-image-1"
                                src={cat?.pictures[0]}
                                alt="Image du chat n°1"
                                className="h-357 w-635 lg:w-535 max-w-1240 cursor-pointer rounded-[10px] "
                                width={1240}
                                height={827}
                                onClick={() => viewCarouselAndActiveImage(true, 0)} />}
                        </div>
                        <div className="flex h-109 lg:flex-col gap-10 justify-center lg:justify-normal">
                            <div className="flex gap-10">
                                <div className="rounded-[10px] w-65 lg:w-146 h-109 lg:h-174 overflow-hidden relative">
                                    {cat?.pictures[1] && <Image
                                        data-testid="property-image-2"
                                        src={cat?.pictures[1]}
                                        alt="Image du chat n°2"
                                        className="cursor-pointer"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 1)} />}
                                </div>
                                <div className="rounded-[10px] w-65 lg:w-146 lg:h-174 overflow-hidden relative">
                                    {cat?.pictures[2] && <Image
                                        data-testid="property-image-3"
                                        src={cat?.pictures[2]}
                                        alt="Image du chat n°3"
                                        className="cursor-pointer"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 2)} />}
                                </div>
                            </div>
                            <div className="flex gap-10">
                                <div className="rounded-[10px] w-65 lg:w-146 lg:h-174 overflow-hidden relative">
                                    {cat?.pictures[3] && <Image
                                        data-testid="property-image-4"
                                        src={cat?.pictures[3]}
                                        alt="Image du chat n°4"
                                        className="cursor-pointer"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 3)} />}
                                </div>
                                <div className="rounded-[10px] w-65 lg:w-146 lg:h-174 overflow-hidden relative">
                                    {cat?.pictures[4] && <Image
                                        data-testid="property-image-5"
                                        src={cat?.pictures[4]}
                                        alt="Image du chat n°5"
                                        className="cursor-pointer"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 4)} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="flex flex-col w-full lg:w-345 gap-8 lg:h-281 border border-solid border-(--pink) rounded-[10px] p-24 bg-(--white) order-1 lg:order-0">
                        <span className="text-base text-(--text)">L'adoptant</span>
                        <div className="flex gap-18 pt-16 pb-16 items-center">
                            <div className="rounded-[10px] w-81 h-82 overflow-hidden relative">
                                {/* {cat?.host.picture && <Image src={cat?.host.picture} alt="Image de l'hôte" fill style={{ objectFit: "cover" }} />} */}
                            </div>
                            <span className="text-base ext-(--text) font-normal">{cat?.hostFamily.name}</span>
                        </div>
                        <Button
                            url="/messenging"
                            text="Envoyer un message"
                            className="text-sm text-(--white) bg-(--primary) rounded-[10px] py-8 px-32" />
                    </div>
                    <div className="flex flex-col gap-40 lg:w-full bg-(--white) rounded-[10px] border boder-solid border-(--pink) p-24 order-0 lg:order-1">
                        <div className="flex flex-col gap-32">
                            <div className="flex flex-col gap-16">
                                <span className="text-2xl text-(--text)">{cat?.name}</span>
                            </div>
                            <p className="text-sm text-(--text) font-normal whitespace-break-spaces">{cat?.description}</p>
                        </div>
                        <CollapseElement title="Informations" content={[`${dateAge(cat?.birthday)} an(s)`, cat?.sex, cat?.dress, cat?.status]} />
                    </div>
                </div>
            </div>
            <Footer />
        </main >
    );
}
