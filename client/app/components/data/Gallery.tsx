'use client'

import { useEffect } from 'react';

import CatCard from '@/app/components/data/CatCard';
import { Cat } from '@/app/interfaces/cat';
import { prepareBodyToShowModal } from '@/app/lib/utils';

/**
 * Ajout les métadata à la page
 * 
 * @function generateMetadata
 * @param { Cat[] } cats - Une liste de chats
 * @returns { Promise<Metadata> } Les méta data à ajouter 
 * 
*/
export function generateMetadata(cats: Cat[]): any {
    const metaData = cats?.map((cat: Cat) => {
        return {
            '@type': `http://www.lechathomedeluna.org/cat/${cat.id}`,
            title: cat.name,
            description: cat.description,
            openGraph: {
                '@type': cat.pictures[0],
                images: [cat.pictures[0]],
            },
        }
    });
    return metaData;
}

/**
 * Interface pour les propriétés d'initialisation de la Gallery
 * 
 * @interface GalleryProps
 */
interface GalleryProps {
    cats: Cat[];
}

/**
 * Affiche la Gallery d'image
 * 
 * @async
 * @function Gallery
 * @param { onlyToAdopt } GalleryProps - Les proriétés de la gallery
 * @param {boolean?} CarouselProps.onlyToAdopt - Indique si on affiche uniqument les chat à adopter
 */
export default function Gallery({ cats }: GalleryProps) {
    useEffect(() => {
        prepareBodyToShowModal("");
    }, [cats]);

    return (
        <section>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateMetadata(cats ?? [])).replace(/</g, '\\u003c'),
                }}
            />
            <div className="flex flex-wrap gap-24 w-full xl:w-1113 md:w-768 px-16 md:p-0 justify-center">
                {cats?.map((cat: Cat, index: number) => (
                    <CatCard key={index} cat={cat} />
                ))}
            </div>
        </section>
    )
}
