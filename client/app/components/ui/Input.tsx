'use client'

import Image from 'next/image';

import {
  InputImageTypes,
  InputTypes,
} from '@/app/enums/enums';

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
    imageType?: InputImageTypes;
    placeHolder?: string;
    required?: boolean;
    width?: number;
    onChange?: (e: any) => void
    hasError?: boolean;
    autoComplete?: string;
    maxLength?: number;
    className?: string;
    showLabel?: boolean;
    readOnly?: boolean;
    hidden?: boolean;
    multipleFile?: boolean;
    ref?: any
}

/**
 * Affiche d'un bouton avec une icône
 * 
 * @function Input
 * @param { name, label, type, value, imageType, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className } InputProps - Les proriétés du champ de saisie
 * @param {string} IconButtonProps.name - Nom du champ de saisie
 * @param {string?} IconButtonProps.label - Label du champ de saisie
 * @param {InputTypes?} IconButtonProps.type - Type du champ de saisie
 * @param {string?} IconButtonProps.value - Valeur du champ de saisie
 * @param {InputImageTypes?} IconButtonProps.imageType - Type d'image à afficher dans le champ de saisie
 * @param {string?} IconButtonProps.placeHolder - Espace réservé du champ de saisie
 * @param {boolean?} IconButtonProps.required - Indique si le champ de saisie doit être obligatoire ou non
 * @param {number?} IconButtonProps.width - Taille du champ de saisie
 * @param {function?} IconButtonProps.onChange - Function à éxecuter lors du changement du texte du champ de saisie
 * @param {boolean?} IconButtonProps.hasError - Indique si le champ de saisie et en erreur ou non
 * @param {string?} IconButtonProps.autoComplete - Indique si le champ de saisie doit gérer l'auto complétion
 * @param {number?} IconButtonProps.maxLength - Longeur maximale du texte du champ de saisie
 * @param {string?} IconButtonProps.className - Classes css du champ de saisie
 * @param {boolean?} IconButtonProps.showLabel - Indique si le label du champ est visible ou non
 * @param {boolean?} IconButtonProps.readOnly - Indique si le champ est en lecteur seule ou non
 * @param {boolean?} IconButtonProps.hidden - Indique si le champ est visible ou non
 * @param {boolean?} IconButtonProps.multipleFile - Indique si on peut sélectionner plusieurs fichiers ou non
 * @param {any?} IconButtonProps.ref - 
 */
export default function Input({ name, label, type, value, imageType, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className, 
    showLabel = true, readOnly = false, hidden = false, multipleFile = false, ref = undefined }: InputProps) {
    const classNames: string = [
        "input",
        "flex",
        "flex-col",
        "flex-1",
        showLabel && type !== InputTypes.File ? "gap-7" : "",
        "justify-start",
        showLabel ? "h-77" : "",
        className ?? ""
    ].join(" ");

    const imgHeight: 14 | 16 = imageType === InputImageTypes.Search
        ? 14
        : 16;

    const isHidden: boolean = hidden ?? false;
        
    return (
        isHidden ? (
            <input
                className="text-sm text-(--text) w-full outline-0"
                id={name}
                name={name}
                type="hidden"
                defaultValue={value}
                placeholder={placeHolder}
                required={required}
                autoComplete={autoComplete}
                onInput={onChange}
                maxLength={maxLength}
                aria-required={required}
                readOnly={readOnly}
                ref={ref}
            />
        ) : (
            <div className={classNames} style={{ "minWidth": width, "maxWidth": width }}>
                {showLabel && <label className="text-sm text-(--text) font-medium " htmlFor={name}>{label}{required ? " *" : ""}</label>}
                {type === InputTypes.File && 
                    <label htmlFor={name} className="flex w-40 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer">+</label>}
                <div className={"flex justify-between items-center bg-(--white) border " +
                    (!hasError ? "border-(--pink)" : "border-(--primary-dark)") + " border-solid rounded-[4px]" + (showLabel ? "py-16" : "") + " px-10 gap-10 " +
                    (type === InputTypes.File ? " opacity-0 h-0" : " h-40")}>
                    <input
                        className={"text-sm text-(--text) w-full outline-0" + (type === InputTypes.File ? " h-0" : "")}
                        id={name}
                        name={name}
                        type={type}
                        defaultValue={value}
                        placeholder={placeHolder}
                        required={required}
                        autoComplete={autoComplete}
                        onInput={onChange}
                        maxLength={maxLength}
                        aria-required={required}
                        readOnly={readOnly}
                        multiple={multipleFile}
                        ref={ref}
                    />
                    {imageType &&
                        <Image src={"/images/" + imageType + ".svg"} width={15} height={imgHeight} alt={" Image " + imageType} />
                    }
                </div>
            </div>
        )
    );
}