'use client'

import { useState, useEffect, useRef } from 'react';
import arrowBottom from '@/app/assets/images/bottom_arrow.svg';
import Tag from '@/app/components/ui/Tag';
import Image from 'next/image';

/**
 * Interface pour les propriétés d'initialisation de l'élément collapse
 * 
 * @interface CollapseElementProps
 */
interface CollapseElementProps {
    title: string;
    content?: string[];
    opened?: boolean;
}

/**
 * Affiche d'un case à cocher
 * 
 * @function CollapseElement
 * @param { title, content } CollapseElementProps - Les proriétés de l'élément retractable
 * @param {string} CollapseElementProps.title - Titre de l'élément retractable
 * @param {string[]?} CollapseElementProps.content - Liste des éléments à cacher
 * @param {boolean?} CollapseElementProps.opened - Indique si le contenu est visible ou non
 */
export default function CollapseElement({ title, content, opened = false }: CollapseElementProps) {
    const [isOpen, setIsOpen] = useState(opened);
    const ref = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    // permet la gestion de l'affichage ou non des éléments
    useEffect(() => {
        if (isOpen && ref.current) {
            setContentHeight((ref.current as HTMLElement).clientHeight);
        } else {
            setContentHeight(0);
        }
    }, [isOpen, content]);

    return (
        <div className="flex flex-col gap-15">
            <div className="flex cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <span className="flex-1 text-sm text-(--text)">{title}</span>
                <Image src={arrowBottom} alt="Plier / déplier le contenu" className="transition-rotate duration-300 ease-out" style={{ rotate: isOpen ? "180deg" : "0deg" }} />
            </div>
            <div className="overflow-hidden transition-height duration-300 ease-out" style={{ height: isOpen ? contentHeight : 0 }}>
                <div ref={ref} className="grid gap-8 grid-cols-8" style={{ "gridTemplateRows": `repeat(${(content?.length ?? 3) / 3}, 1fr)` }}>
                    {content?.map((tag: string, index: number) => (
                        <Tag
                            key={index}
                            text={tag}
                            className="flex items-center justify-center md:whitespace-nowrap text-xs text-(--white) font-normal bg-(--primary-dark) rounded-[5px] py-8 px-8 text-center" />
                    ))}
                </div>
            </div>
        </div>
    );
}