'use client'

import { InputTypes } from "@/app/enums/enums";

/**
 * Interface pour les propriétés d'initialisation d'un champ de saisie
 * 
 * @interface InputProps
 */
interface InputProps {
    name: string;
    label?: string;
    type?: InputTypes;
    value?: string;
    placeHolder?: string;
    required?: boolean;
    width?: number;
    onChange?: (e: any) => void
    hasError?: boolean;
    autoComplete?: string;
    maxLength?: number;
    className?: string;
    showLabel?: boolean;
}

/**
 * Affiche d'un bouton avec une icône
 * 
 * @function Input
 * @param { name, label, type, value, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className } InputProps - Les proriétés du champ de saisie
 * @param {string} IconButtonProps.name - Nom du champ de saisie
 * @param {string?} IconButtonProps.label - Label du champ de saisie
 * @param {InputTypes?} IconButtonProps.type - Type du champ de saisie
 * @param {string?} IconButtonProps.value - Valeur du champ de saisie
 * @param {string?} IconButtonProps.placeHolder - Espace réservé du champ de saisie
 * @param {boolean?} IconButtonProps.required - Indique si le champ de saisie doit être obligatoire ou non
 * @param {number?} IconButtonProps.width - Taille du champ de saisie
 * @param {function?} IconButtonProps.onChange - Function à éxecuter lors du changement du texte du champ de saisie
 * @param {boolean?} IconButtonProps.hasError - Indique si le champ de saisie et en erreur ou non
 * @param {string?} IconButtonProps.autoComplete - Indique si le champ de saisie doit gérer l'auto complétion
 * @param {number?} IconButtonProps.maxLength - Longeur maximale du texte du champ de saisie
 * @param {string?} IconButtonProps.className - Classes css du champ de saisie
 * @param {boolean?} IconButtonProps.showLabel - Indique si le label du champ est visible ou non
 */
export default function Input({ name, label, type, value, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className, showLabel = true }: InputProps) {
    const classNames: string = [
        "input",
        "flex",
        "flex-col",
        "flex-1",
        showLabel ? "gap-7" : "",
        "justify-start",
        showLabel ? "h-77" : "h-63",
        className ?? ""
    ].join(" ");

    return (
        <div className={classNames} style={{ "minWidth": width, "maxWidth": width }}>
            <label className={"text-sm text-(--text) font-medium " + (!showLabel ? "hidden" : "")} htmlFor={name}>{label}{required ? " *" : ""}</label>
            <div className={"flex justify-between items-center bg-(--white) border " +
                (!hasError ? "border-(--pink)" : "border-(--primary-dark)") + " border-solid rounded-[4px]" + (showLabel ? "py-16" : "") + " px-10 gap-10 h-40"}>
                <input
                    className="text-sm text-(--text) w-full outline-0"
                    id={name}
                    name={name}
                    type={type}
                    defaultValue={value}
                    placeholder={placeHolder}
                    required={required}
                    autoComplete={autoComplete}
                    onChange={onChange}
                    maxLength={maxLength}
                    aria-required={required}
                />
            </div>
        </div>
    );
}