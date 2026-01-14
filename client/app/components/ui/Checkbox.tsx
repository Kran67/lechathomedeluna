'use client'

import { useState } from "react";

/**
 * Interface pour les propriétés d'initialisation de la Checkbox
 * 
 * @interface CheckboxProps
 */
interface CheckboxProps {
    id: string;
    text?: string;
    disabled?: boolean;
    className?: string;
    url?: string
    checked?: boolean;
    required?: boolean;
}

/**
 * Affiche d'un case à cocher
 * 
 * @function Checkbox
 * @param { id, text, disabled, className, checked = false, required = false } CheckboxProps - Les proriétés de la Checkbox
 * @param {string} CheckboxProps.id - Identifiant de la checkbox
 * @param {string?} CheckboxProps.text - Texte à afficher
 * @param {boolean?} CheckboxProps.disabled - Statut du bouton actif ou non actif
 * @param {string?} CheckboxProps.className - Classes css du bouton
 * @param {checked?} CheckboxProps.checked - Détermine si la checkbox doit être cochée ou non
 * @param {required?} CheckboxProps.required - Indique si la checkbox est obligatoire ou non
 */
export default function Checkbox({ id, text, disabled, className, checked = false, required = false }: CheckboxProps) {
    const [isChecked, setIsChecked] = useState(checked);

    const handleClick = (e: any) => {
        const checkbox = (e.target as HTMLElement).querySelector("input") as HTMLInputElement;
        if (!disabled) {
            setIsChecked(!checkbox.checked);
        }
    }

    return (
        <div
            className={"checkbox-container flex text-sm select-none items-center " + (disabled ? "opacity-[50%] cursor-not-allowed " : "cursor-pointer ")}
            onClick={(e) => handleClick(e)}>
            <input
                id={id}
                type="checkbox"
                className="mr-5 opacity-0 w-0 h-0"
                required={required}
                disabled={disabled}
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)} />
            <span className="checkmark w-12 h-12 border border-1 border-solid border-(--dark-grey) mr-10 rounded-[2px] pointer-events-none"></span>
            <label htmlFor={id} className={"pointer-events-none " + className}>{text}{required ? " *" : ""}</label>
        </div>
    );
}