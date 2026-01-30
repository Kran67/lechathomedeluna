'use client'

import {
  FormEvent,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

//import { toast } from 'react-toastify';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  CatSexes,
  CatStatus,
  HeaderMenuItems,
  InputTypes,
  YesNo,
} from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import {
  hasRole,
  redirectWithDelay,
} from '@/app/lib/utils';
import { create } from '@/app/services/catsService';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation d'un Profile
 * 
 * @interface ProfileProps
 */
interface NewCatProps {
    hostFamilies?: User[];
}

export default function NewCat({ hostFamilies} : NewCatProps) {
    const { user } = useUser();
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const [status, setStatus] = useState<string | null>("Non testé");
    const [sex, setSex] = useState<string | null>(null);
    const [isSterilized, setIsSterilized] = useState<boolean | null>(null);
    const [isDuringVisit, setIsDuringVisit] = useState<boolean | null>(null);
    const [isAdopted, setIsAdopted] = useState<boolean | null>(null);
    const [hostFamilyId, setHostFamilyId] = useState<string | null>(null);

    if (!user || (user && !hasRole(user.role, ["Admin", "HostFamily"]))) {
        redirect("/");
    }

    const filteredHostFamilies = hostFamilies?.map(u => ({
        value: u.id,
        label: `${u.name} ${u.lastName}`,
    }));


    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);

        const res = await create(
            token,
            formData.get("name") as string,
            formData.get("description") as string,
            status,
            formData.get("numIdentification") as string,
            sex,
            formData.get("dress") as string,
            formData.get("race") as string,
            isSterilized,
            formData.get("sterilizationDate") as string,
            formData.get("birthDate") as string,
            isDuringVisit,
            isAdopted,
            formData.get("adoptionDate") as string,
            hostFamilyId
        );
        if (!res.error) {
            redirectWithDelay(`/admin/cat/${res.id}`, 1000);
        } else {
            toast.error(res.error);
        }
    };

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Home} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--grey-800)">Nouvelle fiche chat</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="name" label="Nom" required={true} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Description *</label>
                                <textarea className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5' name="description" required={true} rows={5} />
                            </div>
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Statut (FIV & FELV)</label>
                                <Select
                                    options={CatStatus}
                                    className="select"
                                    classNamePrefix="select"
                                    name="status"
                                    id="status"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Statut"
                                    value={CatStatus.find(c => c.value === status)}
                                    onChange={(e:any) => setStatus(e?.value as string ?? "")}
                                />
                            </div>
                            <Input name="numIdentification" label="N° d'identification" />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="sex">Sexe *</label>
                                <Select
                                    options={CatSexes}
                                    className="select"
                                    classNamePrefix="select"
                                    name="sex"
                                    id="sex"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Sexe"
                                    onChange={(e:any) => setSex(e?.value as string ?? "")}
                                    required={true}
                                />
                            </div>
                            <Input name="dress" label="Robe"  />
                            <Input name="race" label="Race" value='Européen' />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="isSterilized">Est stérilisé</label>
                                <Select
                                    options={YesNo}
                                    className="select"
                                    classNamePrefix="select"
                                    name="isSterilized"
                                    id="isSterilized"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Stérilisé ?"
                                    onChange={(e:any) => setIsSterilized(e?.value as boolean ?? false)}
                                />
                            </div>
                            <Input name="sterilizationDate" label="Date de la stérilisation" type={InputTypes.Date}  />
                            <Input name="birthDate" label="Date anniversaire" type={InputTypes.Date}  />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="isDuringVisit">En cours de visite</label>
                                <Select
                                    options={YesNo}
                                    className="select"
                                    classNamePrefix="select"
                                    name="isDuringVisit"
                                    id="isDuringVisit"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="En cours de visite ?"
                                    onChange={(e:any) => setIsDuringVisit(e?.value as boolean ?? "")}
                                />
                            </div>
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="isAdopted">Est adopté</label>
                                <Select
                                    options={YesNo}
                                    className="select"
                                    classNamePrefix="select"
                                    name="isAdopted"
                                    id="isAdopted"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Est adopté ?"
                                    onChange={(e:any) => setIsAdopted(e?.value as boolean ?? "")}
                                />
                            </div>
                            <Input name="adoptionDate" label="Date d'adoption" type={InputTypes.Date}  />
                                <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="hostFamilyId">Famille d'accueil</label>
                                    <Select
                                        options={filteredHostFamilies}
                                        className="select"
                                        classNamePrefix="select"
                                        name="hostFamilyId"
                                        id="hostFamilyId"
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        placeholder="Famille d'accueil"
                                        onChange={(e:any) => setHostFamilyId(e?.value ?? null)}
                                    />
                                </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Créer la fiche" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}