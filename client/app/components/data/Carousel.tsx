'use client'

import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

/**
 * Interface pour les propriétés d'initialisation du carousel
 * 
 * @interface CarouselProps
 */
interface CarouselProps {
    images: string[];
    imageIndex?: number;
    closeCarousel: () => void;
    onIndexChange: Dispatch<SetStateAction<number>>;
}

/**
 * Affiche le carousel d'image
 * 
 * @async
 * @function Carousel
 * @param { images, imageIndex = 0, closeCarousel } CarouselProps - Les proriétés du carousel
 * @param {string[]} CarouselProps.images - Les images à afficher
 * @param {number?} CarouselProps.imageIndex - Index de l'image à afficher au démarrage
 * @param {function} CarouselProps.closeCarousel - La fonction à éxecuter lors du clique en dehors des boutons
 */
export default function Carousel({ images, imageIndex = 0, closeCarousel }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(imageIndex);

    if (!images || images.length === 0) {
        return <span>Aucune donnée</span>;
    }

    const total: number = images.length;

    // image suivante
    const nextSlide = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        // pour empêcher le clique de se propager
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % total);
    };

    // image précédente
    const prevSlide = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        // pour empêcher le clique de se propager
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex - 1 + total) % total);
    };

    // gestion de la touche esc pour fermer le carousel
    useEffect(() => {
        const closeOnEsc = (e: KeyboardEvent): void => {
            if (e.key === "Escape") closeCarousel();
        };
        document.addEventListener("keydown", closeOnEsc);
        return () => document.removeEventListener("keydown", closeOnEsc);
    }, []);

    // gestion des touches flèche gauche / droite pour faire défiler les images
    const changeChild = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                // Si l'index précédent supposé est inférieur à 0, on le définit comme le dernier.
                setCurrentIndex((a) => (a - 1 < 0 ? images.length - 1 : a - 1));
            } else if (e.key === "ArrowRight") {
                // Si l'index suivant supposé est supérieure à -1, on le définit comme le premier.
                setCurrentIndex((a) => (a + 1 > images.length - 1 ? 0 : a + 1));
            }
        },
        [images]
    );

    // gestion des touches
    useEffect(() => {
        document.addEventListener("keydown", changeChild);

        return function cleanup() {
            document.removeEventListener("keydown", changeChild);
        };
    });

    return (
        <aside id="carousel" className="fixed inset-0 z-1 md:px-140 md:py-40 w-full h-screen bg-(--white) overflow-hidden" onClick={closeCarousel}>
            {total > 1 && (
                <>
                    <button
                        className="prev absolute z-1 top-[50%] text-(--main-red) cursor-pointer rounded-[5px] text-[25px] bg-(--light-grey) left-20 w-50 h-50 -translate-y-[50%]"
                        onClick={(e) => prevSlide(e)}>
                        &#10096;
                    </button>
                    <button
                        className="next absolute z-1 top-[50%] text-(--main-red) cursor-pointer rounded-[5px] text-[25px] bg-(--light-grey) right-20 w-50 h-50 -translate-y-[50%]"
                        onClick={(e) => nextSlide(e)}>
                        &#10097;
                    </button>
                </>
            )}
            <div className="h-full w-full overflow-hidden">
                <ul
                    className="flex transition-transform duration-500 ease h-full w-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <li key={index} className="relative flex justify-center" style={{ flex: "0 0 100%" }}>
                            <img src={(image.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + image} alt={`Image ${index + 1} de ${total}`} style={{ objectFit: "fill" }} />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="absolute bottom-10 left-[50%] text-sm font-normal text-(--dark-grey) py-4 px-8 rounded-[5px] select-none">
                {currentIndex + 1} / {total}
            </div>
        </aside>
    );
}