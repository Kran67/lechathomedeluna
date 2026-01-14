'use client'

/**
 * Interface pour les propriétés d'initialisation d'un flag
 * 
 * @interface TagProps
 */
interface TagProps {
    text: string;
    className?: string;
}

/**
 * Affiche d'un flag
 * 
 * @function Tag
 * @param { text, className } TagProps - Les proriétés d'un flag
 * @param {string} MenuItemProps.text - Text du flag
 * @param {string?} MenuItemProps.className - Classes css du flag
 */
export default function Tag({ text, className }: TagProps) {
    return (
        <span className={className}>{text}</span>
    );
}