'use client'

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'react-toastify';

//import { toast } from 'react-toastify';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import { CONSTANTS } from '@/app/core/consts/constants';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
  UserRoles,
} from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import {
  baseUrl,
  formatDDMMY,
  formatYMMDD,
  hasRoles,
  isTodayGreaterThanDatePlus6Months,
  redirectWithDelay,
} from '@/app/core/lib/utils';
import { sendMessage } from '@/app/core/services/client/messagingService';
import { create } from '@/app/core/services/server/catsService';
import {
  CatSexes,
  CatStatus,
  YesNo,
} from '@/app/core/staticlists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation d'un chat
 * 
 * @interface NewCatProps
 */
interface NewCatProps {
    hostFamilies?: User[];
}

export default function NewCat({ hostFamilies} : NewCatProps) {
    const { user } = useUser();
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const [status, setStatus] = useState<string | null>("Non testé");
    const [sex, setSex] = useState<string | null>(null);
    const [isSterilized, setIsSterilized] = useState<boolean | null>(null);
    const [isDuringVisit, setIsDuringVisit] = useState<boolean | null>(null);
    const [hostFamilyId, setHostFamilyId] = useState<string | null>(null);
    const [pictures, setPictures] = useState<any>([]);
    const [picturesPreview, setPicturesPreview] = useState<string[]>([]);
    const [birthDate, setBirthDate] = useState<string | null>(null);
    const [sterilizationDateError, setSterilizationDateError] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const filteredHostFamilies = hostFamilies?.map(u => ({
        value: u.id,
        label: `${u.lastName} ${u.name}`,
    }));

    useEffect(() => {
        if (user && hasRoles(user.roles, [UserRoles.HostFamily])) {
            setHostFamilyId(user.id);
        }
    }, [user]);

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const sterilizationDate: string | null = formData.get("sterilizationDate") as string !== '' ? formData.get("sterilizationDate") as string : null;
        const birthDate: string | null = formData.get("birthDate") as string !== '' ? formData.get("birthDate") as string : null;
        const adoptionDate: string | null = formData.get("adoptionDate") as string !== '' ? formData.get("adoptionDate") as string : null;
        const entryDate: string | null = formData.get("entryDate") as string !== '' ? formData.get("entryDate") as string : null;
        const catName: string = formData.get("name") as string;
        const provenance: string = formData.get("provenance") as string;
        const dress: string = formData.get("dress") as string;
        const numId: string = formData.get("numIdentification") as string;

        const res = await create(
            token,
            catName,
            formData.get("description") as string,
            status,
            numId,
            sex,
            dress,
            formData.get("race") as string,
            isSterilized,
            sterilizationDate,
            birthDate,
            isDuringVisit,
            adoptionDate,
            hostFamilyId,
            pictures,
            user?.id as string,
            entryDate,
            provenance
        );
        if (!res.error) {
            await sendMessage(token, CONSTANTS.THREAD_GROUPS.ADOPTION.toString(), user?.id as string, `La fiche pour le 🐈 ${baseUrl}/admin/cat/${res.slug}[${catName}] vient d'être créée.\n`, []);
            await sendMessage(
                token,
                CONSTANTS.THREAD_GROUPS.ICAD.toString(),
                user?.id as string,
                `La fiche pour le 🐈 ${baseUrl}/admin/cat/${res.slug}[${catName}] vient d'être créée.\n
                    Date d'entrée : ${entryDate ? formatDDMMY(new Date(entryDate)) : "-"}\n
                    Provenance : ${provenance ?? "-"}\n
                    Robe : ${dress ?? "-"}\n
                    Date de naissance : ${birthDate ? formatDDMMY(new Date(birthDate)) : "-"}\n
                    N° identification: ${numId ?? "-"}`, []);
            redirectWithDelay(`/admin/cat/${res.slug}`, 1000);
        } else {
            setIsSubmitted(false);
            toast.error(res.error);
        }
    };

    useEffect(() => {
        const newImageUrls: any = [];
        pictures.map((image:any) => newImageUrls.push(URL.createObjectURL(image)));
        setPicturesPreview(newImageUrls);
    }, [pictures]);

    const picturesChange = (e: { target: { files: any; }; }) => {
        setPictures([...pictures, ...e.target.files]);
    }

    const removePicture = (e: { preventDefault: () => void; }, idx: number) => {
        pictures.splice(idx, 1);
        e.preventDefault();
        setPictures([...pictures]);
    }

    useEffect(() => {
        setSterilizationDateError(isTodayGreaterThanDatePlus6Months(birthDate));
    }, [birthDate]);

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Adoption} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte" encType='multipart/form-data'>
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--primary)">Nouvelle fiche chat</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            {!hostFamilyId && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
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
                            </div>}
                            <Input name="name" label="Nom" required={true} maxLength={20} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Description</label>
                                <textarea className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5' name="description" rows={5} />
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
                            <Input name="numIdentification" label="N° d'identification" maxLength={20} />
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
                            <Input name="dress" label="Robe" maxLength={10} required={true} />
                            <Input name="race" label="Race" value='Européen' maxLength={10} />
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
                            <Input name="entryDate" label="Date d'entrée" type={InputTypes.Date} value={undefined} />
                            <Input name="provenance" label="Provenance" type={InputTypes.Text} maxLength={50}  />
                            <Input
                                name="birthDate"
                                label="Date de naissance"
                                type={InputTypes.Date}
                                value={birthDate ? formatYMMDD(new Date(birthDate)) : undefined}
                                onChange={(e) => setBirthDate(e.currentTarget.value)}
                                />
                            <Input
                                name="sterilizationDate"
                                label="Date de la stérilisation / castration"
                                type={InputTypes.Date}
                                className={ sterilizationDateError ? "error" : "" }
                                value={undefined} />
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
                            { user && hasRoles(user.roles, [UserRoles.Admin]) &&
                                <Input name="adoptionDate" label="Date d'adoption" type={InputTypes.Date} value={undefined} />
                            }
                            <Input name="catPictures" label="Photos" type={InputTypes.File} multipleFile={true} onChange={picturesChange} />
                            <div className='flex flex-wrap w-full gap-7' data-p={picturesPreview.length}>
                                {picturesPreview.map((picture: string, idx: number) => (
                                    <div key={idx} className="rounded-[10px] h-100 w-100 overflow-hidden relative">
                                        <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                            icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removePicture(e, idx)} />
                                        <Image
                                            data-testid={"chat-image-" + (idx + 1)}
                                            src={picture}
                                            alt={"Image du chat n°" + (idx + 1)}
                                            fill
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button
                                text="Créer la fiche"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230'
                                disabled={isSubmitted}
                            />
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}