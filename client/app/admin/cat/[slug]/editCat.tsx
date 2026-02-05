'use client'

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import dynamic from 'next/dynamic';
import {
  redirect,
  useRouter,
} from 'next/navigation';
import { toast } from 'react-toastify';

//import { toast } from 'react-toastify';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  CatSexes,
  CatStatus,
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
  YesNo,
} from '@/app/enums/enums';
import {
  Cat,
  Vaccine,
} from '@/app/interfaces/cat';
import { User } from '@/app/interfaces/user';
import {
  formatDDMMY,
  formatYMMDD,
  hasRole,
  redirectWithDelay,
} from '@/app/lib/utils';
import { update } from '@/app/services/catsService';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation d'un Profile
 * 
 * @interface ProfileProps
 */
interface EditCatProps {
    hostFamilies?: User[];
    cat: Cat | undefined;
    slug: string;
}

export default function EditCat({ hostFamilies, cat, slug } : EditCatProps) {
    const { user } = useUser();
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const [status, setStatus] = useState<string | null>(cat?.status ?? null);
    const [sex, setSex] = useState<string | null>(cat?.sex ?? null);
    const [isSterilized, setIsSterilized] = useState<boolean | null>(cat?.isSterilized ?? null);
    const [isDuringVisit, setIsDuringVisit] = useState<boolean | null>(cat?.isDuringVisit ?? null);
    const [isAdopted, setIsAdopted] = useState<boolean | null>(cat?.isAdopted ?? null);
    const [hostFamilyId, setHostFamilyId] = useState<string | null>(cat?.hostFamily?.id ?? null);
    const router = useRouter();
    const [pictures, setPictures] = useState<any>([...cat?.pictures ?? []]);
    const [picturesPreview, setPicturesPreview] = useState<string[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([...cat?.vaccines ?? []]);
    const [vaccinesPreview, setVaccinesPreview] = useState<string[]>([]);
    const [vaccineDate, setVaccineDate] = useState<string | undefined>(undefined);
    const [vaccinePicture, setVaccinePicture] = useState<any | null>(null);
    const inputVaccineFile = useRef(null);
    const inputVaccineDate = useRef(null);
    console.log(cat);

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
        const sterilizationDate: string | null = formData.get("sterilizationDate") as string !== '' ? formData.get("sterilizationDate") as string : null;
        const birthDate: string | null = formData.get("birthDate") as string !== '' ? formData.get("birthDate") as string : null;
        const adoptionDate: string | null = formData.get("adoptionDate") as string !== '' ? formData.get("adoptionDate") as string : null;
        let hasNewFiles: boolean = false;
        pictures.map((picture: any) => {
            if (typeof picture !== "string") {
                hasNewFiles = true;
            }
        });
        const newPictureFiles: any[] = pictures.filter((picture: any) => typeof picture !== "string");
        const strPictures: string[] = pictures.filter((picture: any) => typeof picture === "string");
        const deletedPictureFiles: string[] | null= cat?.pictures.filter((item: string) => !strPictures.includes(item)) ?? null;

        const newVaccineFiles: Vaccine[] = vaccines.filter((vaccine: Vaccine) => typeof vaccine.picture !== "string");
        const strVaccinePictures: string[] = vaccines.filter((vaccine: Vaccine) => typeof vaccine.picture === "string").map((vaccine: Vaccine) => vaccine.picture);
        const deletedVaccineFiles: string[] | null= cat?.vaccines.filter((vaccine: Vaccine) => !strVaccinePictures.includes(vaccine.picture)).map((vaccine: Vaccine) => vaccine.picture) ?? null;

        const res = await update(
            token,
            slug,
            formData.get("name") as string,
            formData.get("description") as string,
            status,
            formData.get("numIdentification") as string,
            sex,
            formData.get("dress") as string,
            formData.get("race") as string,
            isSterilized,
            sterilizationDate,
            birthDate,
            isDuringVisit,
            isAdopted,
            adoptionDate,
            hostFamilyId,
            newPictureFiles,
            deletedPictureFiles,
            newVaccineFiles,
            deletedVaccineFiles
        );
        if (!res.error) {
            redirectWithDelay(`/admin/cat/${res.slug}`, 1000);
        } else {
            toast.error(res.error);
        }
    };

    useEffect(() => {
        const newImageUrls: any = [];
        pictures.forEach((image:any) => newImageUrls.push(typeof image === "string" ? image : URL.createObjectURL(image)));
        setPicturesPreview(newImageUrls);
    }, [pictures]);

    const picturesChange = (e: { target: { files: any; }; }) => {
        let pics = [...pictures];
        if (pictures.includes('/images/chat.png')) {
            pics = pics.filter((picture:string) => picture !== '/images/chat.png');
        }
        setPictures([...pics, ...e.target.files]);
    }

    const removePicture = (e: { preventDefault: () => void; }, idx: number) => {
        pictures.splice(idx, 1);
        e.preventDefault();
        setPictures([...pictures]);
    }

    useEffect(() => {
        const newImageUrls: any = [];
        vaccines.forEach((vaccine:any) => newImageUrls.push(typeof vaccine.picture === "string" ? vaccine.picture : URL.createObjectURL(vaccine.picture)));
        setVaccinesPreview(newImageUrls);
    }, [vaccines]);

    const vaccinePictureChange = (e: any) => {
        setVaccinePicture(e.target.files[0]);
    }
    const addVaccine = () => {
        if (vaccineDate && vaccinePicture) {
            setVaccines([...vaccines, { id: '', cat_id: cat?.id ?? '', date: vaccineDate ?? '', picture: vaccinePicture }]);
            setVaccinePicture(undefined);
            setVaccineDate(undefined);
            handleReset();
        }
    }
    const removeVaccine = (e: { preventDefault: () => void; }, idx: number ) => {
        vaccines.splice(idx, 1);
        e.preventDefault();
        setVaccines([...vaccines]);
    }

    const handleReset = () => {
        if (inputVaccineFile.current) {
            (inputVaccineFile.current as HTMLInputElement).value = "";
            (inputVaccineFile.current as HTMLInputElement).type = "text";
            (inputVaccineFile.current as HTMLInputElement).type = "file";
        }
        if (inputVaccineDate.current) {
            (inputVaccineDate.current as HTMLInputElement).value = "";
        }
    }

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Home} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="lg:flex lg:flex-row lg:gap-10 w-full lg:py-16 lg:px-7 border-b-0 lg:border-b-1 border-solid border-b-(--pink)">
                    <IconButton
                        icon={IconButtonImages.LeftArrow}
                        imgWidth={8}
                        imgHeight={6}
                        text="Retour"
                        url="#"
                        onClick={() => router.back()}
                        svgFill="#902677"
                        className="text-sm text-(--text) gap-5 bg-(--white) rounded-[10px] py-8 px-16 w-189" />
                </div>
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--grey-800)">Modification fiche chat</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="name" label="Nom" required={true} value={cat?.name} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Description *</label>
                                <textarea
                                    className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5'
                                    name="description"
                                    required={true}
                                    rows={5}
                                    defaultValue={cat?.description}
                                />
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
                            <Input name="numIdentification" label="N° d'identification" value={cat?.numIdentification} />
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
                                    value={CatSexes.find(c => c.value === sex)}
                                    onChange={(e:any) => setSex(e?.value as string ?? "")}
                                    required={true}
                                />
                            </div>
                            <Input name="dress" label="Robe" value={cat?.dress} />
                            <Input name="race" label="Race" value={cat?.race} />
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
                                    value={YesNo.find(c => c.value === isSterilized)}
                                    onChange={(e:any) => setIsSterilized(e?.value as boolean ?? false)}
                                />
                            </div>
                            <Input name="sterilizationDate" label="Date de la stérilisation" type={InputTypes.Date} value={cat?.sterilizationDate ? formatYMMDD(new Date(cat?.sterilizationDate)) : ''} />
                            <Input name="birthDate" label="Date anniversaire" type={InputTypes.Date} value={cat?.birthDate ? formatYMMDD(new Date(cat?.birthDate)) : ''} />
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
                                    value={YesNo.find(c => c.value === isDuringVisit)}
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
                                    value={YesNo.find(c => c.value === isAdopted)}
                                    onChange={(e:any) => setIsAdopted(e?.value as boolean ?? "")}
                                />
                            </div>
                            <Input name="adoptionDate" label="Date d'adoption" type={InputTypes.Date} value={cat?.adoptionDate ? formatYMMDD(new Date(cat?.adoptionDate)) : ''} />
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
                                    value={filteredHostFamilies?.find(c => c.value === hostFamilyId)}
                                    onChange={(e:any) => setHostFamilyId(e?.value ?? null)}
                                />
                            </div>
                            <Input name="catPictures" label="Photos" type={InputTypes.File} multipleFile={true} onChange={picturesChange} />
                            <div className='flex flex-wrap w-full gap-7'>
                                {picturesPreview.map((picture: string, idx: number) => (
                                    <div key={idx} className="rounded-[10px] h-100 w-100 overflow-hidden relative">
                                        <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                            icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removePicture(e, idx)} />
                                        <img
                                            data-testid={"chat-image-" + (idx + 1)}
                                            src={(picture.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + picture}
                                            alt={"Image du chat n°" + (idx + 1)}
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="select flex flex-col flex-1 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="">Vaccins</label>
                                <div className='flex gap-10 items-center'>
                                    <Input
                                        name="vaccineDate"
                                        label="Date du vaccin"
                                        type={InputTypes.Date}
                                        showLabel={false}
                                        className='max-w-150'
                                        value={vaccineDate}
                                        onChange={(e) => setVaccineDate(e.target.value)}
                                        ref={inputVaccineDate} />
                                    <Input
                                        name="vaccinePicture"
                                        label="Photos du vaccin"
                                        type={InputTypes.File}
                                        onChange={vaccinePictureChange}
                                        showLabel={false}
                                        className='max-w-44'
                                        ref={inputVaccineFile} />
                                    <span className='text-sm text-(--primary)'>{vaccinePicture?.name}</span>
                                    <Button className="flex text-sm p-10 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer"
                                         onClick={(e:any) => { addVaccine(); e.preventDefault(); }}
                                         text="Ajouter le vaccin"
                                         disabled={!vaccineDate || !vaccinePicture}
                                         />
                                </div>
                                <div className='flex flex-wrap w-full gap-7 mt-24'>
                                    {vaccinesPreview.map((picture: string, idx: number) => (
                                        <div key={idx} className="rounded-[10px] h-124 w-100 overflow-hidden relative border border-1 border-solid border-(--pink)">
                                            <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeVaccine(e, idx)} />
                                            <figcaption className='flex flex-col p-5'>
                                                <img
                                                    data-testid={"chat-image-" + (idx + 1)}
                                                    src={(picture.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + picture}
                                                    alt={"Image du chat n°" + (idx + 1)}
                                                    style={{ objectFit: "contain" }}
                                                    className=' max-h-150'
                                                />
                                                <figcaption className='text-(--primary) text-sm p-3 text-center'>{ formatDDMMY(new Date(vaccines[idx]?.date)) }</figcaption>
                                            </figcaption>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Modifier la fiche" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}