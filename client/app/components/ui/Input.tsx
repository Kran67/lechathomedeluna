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
    pattern?: string;
}

/**
 * Affiche d'un bouton avec une icône
 * 
 * @function Input
 * @param { name, label, type, value, imageType, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className } InputProps - Les proriétés du champ de saisie
 * @param {string} InputProps.name - Nom du champ de saisie
 * @param {string?} InputProps.label - Label du champ de saisie
 * @param {InputTypes?} InputProps.type - Type du champ de saisie
 * @param {string?} InputProps.value - Valeur du champ de saisie
 * @param {InputImageTypes?} InputProps.imageType - Type d'image à afficher dans le champ de saisie
 * @param {string?} InputProps.placeHolder - Espace réservé du champ de saisie
 * @param {boolean?} InputProps.required - Indique si le champ de saisie doit être obligatoire ou non
 * @param {number?} InputProps.width - Taille du champ de saisie
 * @param {function?} InputProps.onChange - Function à éxecuter lors du changement du texte du champ de saisie
 * @param {boolean?} InputProps.hasError - Indique si le champ de saisie et en erreur ou non
 * @param {string?} InputProps.autoComplete - Indique si le champ de saisie doit gérer l'auto complétion
 * @param {number?} InputProps.maxLength - Longeur maximale du texte du champ de saisie
 * @param {string?} InputProps.className - Classes css du champ de saisie
 * @param {boolean?} InputProps.showLabel - Indique si le label du champ est visible ou non
 * @param {boolean?} InputProps.readOnly - Indique si le champ est en lecteur seule ou non
 * @param {boolean?} InputProps.hidden - Indique si le champ est visible ou non
 * @param {boolean?} InputProps.multipleFile - Indique si on peut sélectionner plusieurs fichiers ou non
 * @param {any?} InputProps.ref - 
 * @param {string?} InputProps.pattern - 
 */
export default function Input({ name, label, type, value, imageType, placeHolder, required, width, onChange, hasError, autoComplete = "on", maxLength, className, 
    showLabel = true, readOnly = false, hidden = false, multipleFile = false, ref = undefined, pattern = undefined }: InputProps) {
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
                {type === InputTypes.File && 
                    <label
                        htmlFor={name}
                        className={"flex w-40 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer"+ (type === InputTypes.File ? " order-2" : "")}>+</label>}
                <div className={"flex justify-between items-center bg-(--white) border order-1 " +
                    (!hasError ? "border-(--pink)" : "border-(--primary-dark)") + " border-solid rounded-[4px] " + (showLabel && type !== InputTypes.File ? "py-16" : "") + " px-10 gap-10 " +
                    (type === InputTypes.File ? " opacity-0 h-0" : " h-40") + (readOnly ? " bg-[#eee]" : "")}>
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
                        pattern={pattern}
                    />
                    {imageType &&
                        <Image src={"/images/" + imageType + ".svg"} width={15} height={imgHeight} alt={" Image " + imageType} />
                    }
                </div>
                {showLabel && <label className="text-sm text-(--text) font-medium order-0" htmlFor={name}>{label}</label>}
            </div>
        )
    );
}