'use client'

import {
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import Carousel from '@/app/components/data/Carousel';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import ModalCreateAdoptionRequest
  from '@/app/components/modals/ModalCreateAdoptionRequest';
import CollapseElement from '@/app/components/ui/CollapseElement';
import IconButton from '@/app/components/ui/IconButton';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImagePositions,
  IconButtonImages,
  UserRoles,
} from '@/app/core/enums/enums';
import { Cat } from '@/app/core/interfaces/cat';
import { DateUtils } from '@/app/core/lib/dateUtils';
import {
  dateAge,
  hasRoles,
  prepareBodyToShowModal,
} from '@/app/core/lib/utils';
import { updateFavorite } from '@/app/core/services/server/catsService';

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
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const [viewCarousel, setViewCarousel] = useState(false);
    const [carouselImageIndex, setCarouselImageIndex] = useState(0);
    const router = useRouter();
    const { user } = useUser();
    const [favoriteCount, setFavoriteCount] = useState<number>(cat?.favoriteCount ?? 0);
    const [showModalAdoptionRequest, setShowModalAdoptionRequest] = useState<boolean>(false);

    const viewCarouselAndActiveImage = (viewCarousel: boolean, index: number) => {
        setViewCarousel(viewCarousel);
        setCarouselImageIndex(index);
    }

    const collapseElementContent: { name:string, url?:string }[] = [];
    if (cat?.birthDate) {
        collapseElementContent.push({ name: `${dateAge(cat?.birthDate)} an(s)` });
    }
    if (cat?.sex) {
        collapseElementContent.push({ name: cat?.sex});
    }
    if (cat?.dress) {
        collapseElementContent.push({ name: cat?.dress});
    }
    if (cat?.status) {
        collapseElementContent.push({ name: cat?.status});
    }
    if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember]) && cat?.entryDate) {
        collapseElementContent.push({ name: `Entrée ${DateUtils.differenceDate(new Date(cat?.entryDate)).text}`});
    }
    if (cat?.provenance) {
        collapseElementContent.push({ name: cat?.provenance });
    }

    //const collapseElementDocuments: { name:string, url:string }[] = [
    //    {
    //        name: "",
    //        url: ""
    //    },
    //    {
    //        name: "",
    //        url: ""
    //    }
    //];

    useEffect(() => {
        prepareBodyToShowModal(viewCarousel ? "hidden" : "");
    }, [viewCarousel]);

    const animateHearts = async (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
        const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        const colors: string[] = ["text-(--primary)", "text-(--primary-dark)", "text-(--pink)", "text-(--light-pink)"];
        await updateFavorite(cat?.slug ?? "");
        setFavoriteCount(favoriteCount + 1);
        for (let i = 0; i < 40; i++) {
            const paw = document.createElement('i');
            const colorIdx = getRandom(0, 3);
            paw.className = `cat-paw ${colors[colorIdx]} fa fa-paw`;
            const target = (e.target as HTMLButtonElement);
            // Position de départ au centre du bouton
            const rect = target.getBoundingClientRect();
            paw.style.left = (rect.left + rect.width / 2) + 'px';
            paw.style.top = (target.offsetTop - rect.height / 2) + 'px';
            const max = getRandom(50, 256);
            paw.style.fontSize = `${max}px`;
            paw.style.setProperty('--tx', `${getRandom(-480, 200)}px`);
            paw.style.setProperty('--ty', `${getRandom(-920, 0)}px`);
            paw.style.setProperty('--rotation', `${getRandom(-360, 360)}deg`);
            
            document.getElementById("pawsContainer")?.appendChild(paw);
            
            // Déclencher l'animation après un court délai
            setTimeout(() => {
                paw.classList.add('active');
            }, 10);
            
            setTimeout(() => {
                paw.remove();
                setShowModalAdoptionRequest(true);
            }, 2100);
        }
    }

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            {viewCarousel &&
                createPortal(
                    <Carousel images={cat?.pictures ?? []} imageIndex={carouselImageIndex} closeCarousel={() => setViewCarousel(false)} onIndexChange={setCarouselImageIndex} />,
                    document.body
                )}
            {showModalAdoptionRequest && cat && createPortal(
                <ModalCreateAdoptionRequest
                    catName={cat.name}
                    catSlug={cat.slug}
                    catId={cat.id}
                    closeModal={() => setShowModalAdoptionRequest(false)}
                    onSuccess={async () => {
                        setShowModalAdoptionRequest(false);
                        toast.success(`La demande d'adoption pour ${cat.name} a bien été créée.`);
                    }}
                />,
                document.body
            )}
            <Header activeMenu={cat?.isAdoptable && cat?.adoptionDate ? HeaderMenuItems.AdoptedCats : HeaderMenuItems.Home} />
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
                        <div className="flex h-302 overflow-hidden md:justify-center ">
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
                                <div key={idx} className="w-65 h-65 lg:w-146 lg:h-146 overflow-hidden relative rounded-[10px]">
                                    <img
                                        data-testid={"chat-image-" + idx}
                                        src={(pic.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + pic}
                                        alt={"Image du chat n°" + idx}
                                        className="cursor-pointer rounded-[10px] "
                                        style={{ objectFit: "contain" }}
                                        onClick={() => viewCarouselAndActiveImage(true, 1)} />
                                    </div>)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-40 lg:w-full bg-(--white) rounded-[10px] border boder-solid border-(--pink) p-24 order-0 lg:order-1">
                        <div className="flex flex-col gap-32">
                            <div className="flex gap-8 items-center">
                                <span className="text-2xl text-(--text)">{cat?.name}</span>
                                {favoriteCount > 0 && <span className='heart flex items-center justify-center text-sm text-(--primary)'>{favoriteCount}</span>}
                            </div>
                            <p className="text-sm text-(--text) font-normal whitespace-break-spaces">{cat?.description}</p>
                        </div>
                        <CollapseElement title="Informations" content={collapseElementContent} />
                        {/* <CollapseElement title="Documents" content={collapseElementDocuments} /> */}
                        { !user && !cat?.adoptionDate &&
                            <>
                                <IconButton
                                    icon={IconButtonImages.Heart}
                                    text="J'ai un coup de "
                                    svgFill='#fff'
                                    svgBgFill='#fff'
                                    svgStroke='#fff'
                                    imgWidth={32}
                                    imgHeight={32}
                                    className="text-lg text-(--white) bg-(--primary) rounded-[10px] py-8 px-8 justify-center"
                                    position={IconButtonImagePositions.Right}
                                    onClick={ (e:React.MouseEvent<HTMLButtonElement>) => animateHearts(e, "/send") }
                                />
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-1" id="pawsContainer"></div>
                            </>
                        }
                    </div>
                </div>
            </div>
            <Footer />
        </main >
    );
}
