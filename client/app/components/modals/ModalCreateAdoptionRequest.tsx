"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Select from 'react-select';

import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import {
  IconButtonImages,
  InputTypes,
} from '@/app/core/enums/enums';
import { createAdoptionRequest } from '@/app/core/services/client/catsService';
import {
  DailyTimes,
  LifePlaces,
  YesNo,
} from '@/app/core/staticlists/staticLists';

import Link from '../ui/Link';
import ModalConditionsOfUse from './modalConditionsOfUse';

export default function ModalCreateAdoptionRequest({
    catName,
    catSlug,
    catId,
    closeModal,
    onSuccess,
}: {
    catName: string,
    catSlug: string,
    catId: string,
    closeModal: () => void;
    onSuccess: () => void;
}) {
    const [lifePlace, setLifePlace] = useState<string>("");
    const [isOutsideAccess, setIsOutsideAccess] = useState<boolean>(false);
    const [dailyTimeOff, setDailyTimeOff] = useState<string>("");
    const [holidaysChildcareSolution, setHolidaysChildcareSolution] = useState<string>("");
    const [readedConditionsOfUse, setReadedConditionsOfUse] = useState(false);
    const [showModalConditionsOfUse, setShowModalConditionsOfUse] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [approuvedConditions, setApprouvedConditions] = useState(false);

    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);

        await createAdoptionRequest(
            catId,
            formData.get("lastname") as string,
            formData.get("firstname") as string,
            formData.get("email") as string,
            formData.get("facebook") as string,
            lifePlace,
            formData.get("area") as string,
            isOutsideAccess,
            formData.get("householdPeopleNumber") as string,
            formData.get("alreadyPresenAnimalsNumber") as string,
            dailyTimeOff,
            holidaysChildcareSolution,
            catName,
            catSlug
        );
        onSuccess();
    };

    useEffect(() => {
        const closeOnEsc = (e: KeyboardEvent): void => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", closeOnEsc);
        return () => document.removeEventListener("keydown", closeOnEsc);
    }, []);

    return (
        <aside className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-1 w-400 md:w-full" onClick={closeModal}>
            {showModalConditionsOfUse && createPortal(
                <ModalConditionsOfUse
                    firstName={firstName}
                    lastName={lastName}
                    closeModal={() => setShowModalConditionsOfUse(false)}
                    onSuccess={() => {
                        setShowModalConditionsOfUse(false);
                        setReadedConditionsOfUse(true);
                    }}
                />,
                document.body
            )}
            <div
                className="bg-(--white) relative px-8 py-10 md:px-36 md:py-39 rounded-[10px] flex flex-col gap-20 w-full md:w-600 border border-(--primary) border-1"
                onClick={(e) => e.stopPropagation()}
             >
                <h4 className="text-(--primary)">Créer une demande d'adoption pour {catName}</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-10" role="form" aria-label="Information de la demande d'adoption">
                    <div className='flex gap-20'>
                        <Input name="lastname" label="Nom" type={InputTypes.Text} required={true} maxLength={30} onChange={(e) => setFirstName(e.currentTarget.value)} />
                        <Input name="firstname" label="Prénom" type={InputTypes.Text} required={true} maxLength={30} onChange={(e) => setLastName(e.currentTarget.value)} />
                    </div>
                    <div className='flex gap-20'>
                        <Input name="email" label="Email" type={InputTypes.Text} required={true} maxLength={100} />
                        <Input name="facebook" label="Facebook" type={InputTypes.Text} maxLength={100} />
                    </div>
                    <div className='flex gap-20'>
                        <div className="flex flex-col gap-8">
                            <label htmlFor="lifePlace" className='text-sm text-(--primary) font-medium'>Lieu de vie *</label>
                            <Select
                                options={LifePlaces}
                                className="select text-(--primary)"
                                classNamePrefix="select"
                                name="lifePlace"
                                id="lifePlace"
                                isMulti={false}
                                isClearable={false}
                                isSearchable={true}
                                required={true}
                                placeholder="Lieu de vie"
                                styles={{container: provided => ({
                                    ...provided,
                                    width: 300
                                })}}
                                onChange={(e:any) => setLifePlace(e?.value)}
                            />
                        </div>
                        <Input name="area" label="Superficie (m²)" type={InputTypes.Number} required={true} min={10} max={500} />
                    </div>
                    <div className="flex flex-col gap-8">
                        <label htmlFor="isOutsideAccess" className='text-sm text-(--primary) font-medium'>Accès à l’extérieur ? *</label>
                        <Select
                            options={YesNo}
                            className="select text-(--primary)"
                            classNamePrefix="select"
                            name="isOutsideAccess"
                            id="isOutsideAccess"
                            isMulti={false}
                            isClearable={false}
                            isSearchable={false}
                            required={true}
                            placeholder="Accès à l’extérieur ?"
                            onChange={(e:any) => setIsOutsideAccess(e?.value as boolean ?? false)}
                        />
                    </div>
                    <div className='flex gap-20'>
                        <Input name="householdPeopleNumber" label="Nombre de personnes dans le foyer" type={InputTypes.Number} required={true} min={1} max={5} />
                        <Input name="alreadyPresenAnimalsNumber" label="Nombre d’animaux déjà présent" type={InputTypes.Number} required={true} min={0} max={10} /> 
                    </div>
                    <div className='flex gap-20'>
                        <div className="flex flex-col gap-8">
                            <label htmlFor="dailyTimeOff" className='text-sm text-(--primary) font-medium'>Temps d’absence quotidien *</label>
                            <Select
                                options={DailyTimes}
                                className="select text-(--primary)"
                                classNamePrefix="select"
                                name="dailyTimeOff"
                                id="dailyTimeOff"
                                isMulti={false}
                                isClearable={false}
                                isSearchable={true}
                                required={true}
                                placeholder="Temps d’absence quotidien"
                                styles={{container: provided => ({
                                    ...provided,
                                    width: 253
                                })}}
                                onChange={(e:any) => setDailyTimeOff(e?.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-8">
                            <label htmlFor="holidaysChildcareSolution" className='text-sm text-(--primary) font-medium'>Solution de garde pendant les congés ? *</label>
                            <Select
                                options={YesNo}
                                className="select text-(--primary)"
                                classNamePrefix="select"
                                name="holidaysChildcareSolution"
                                id="holidaysChildcareSolution"
                                isMulti={false}
                                isClearable={false}
                                isSearchable={true}
                                required={true}
                                placeholder="Solution de garde pendant..."
                                styles={{container: provided => ({
                                    ...provided,
                                    width: 253
                                })}}
                                onChange={(e:any) => setHolidaysChildcareSolution(e?.value)}
                            />
                        </div>
                    </div>
                    <div className={"flex flex-col gap-8" + (firstName !== "" && lastName !== "" ? "" : " hidden")}>
                        <Link className="text-sm" text="Lire les conditions d'utilisation" onClick={(e) => {
                            setShowModalConditionsOfUse(true);
                        }} />
                        <div className="flex gap-5 items-center">
                            <input className="min-w-[1.15em] min-h-[1.15em]" type="checkbox" name="approuved-conditions" disabled={!readedConditionsOfUse} onChange={(e) => setApprouvedConditions(e.currentTarget.checked) }/>
                            <label className="text-xs" htmlFor='approuved-conditions' >J'ai lu et j'accepte les conditions d'utilisation de mes données personnelles par le ’Chat'Home de Luna’</label>
                        </div>
                    </div>
                    <Button text="Créer la demande" className='flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) w-200 self-center' disabled={!approuvedConditions} />
                </form>
                <IconButton icon={IconButtonImages.Cross} onClick={closeModal} imgWidth={20} imgHeight={20} className='absolute top-15 right-15 cursor-pointer' svgFill='#902677' />
            </div>
        </aside>
    );
}