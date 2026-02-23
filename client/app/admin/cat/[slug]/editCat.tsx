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
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
  UserRole,
} from '@/app/enums/enums';
import {
  Cat,
  CatDocument,
} from '@/app/interfaces/cat';
import { User } from '@/app/interfaces/user';
import {
  formatDDMMY,
  formatYMMDD,
  hasRoles,
  isTodayGreaterThanDatePlus6Months,
  redirectWithDelay,
} from '@/app/lib/utils';
import { update } from '@/app/services/server/catsService';
import { create } from '@/app/services/server/vetVouchersService';
import {
  CatSexes,
  CatStatus,
  Clinics,
  voucherObjects,
  YesNo,
} from '@/app/staticLists/staticLists';

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
    const [isAdoptable, setIsAdoptable] = useState<boolean | null>(cat?.isAdoptable ?? null);
    const [birthDate, setBirthDate] = useState<string | null>(cat?.birthDate ?? null);
    const [sterilizationDateError, setSterilizationDateError] = useState<boolean>(false);
    const [hostFamilyId, setHostFamilyId] = useState<string | null>(cat?.hostFamily?.id ?? null);
    const router = useRouter();
    const [pictures, setPictures] = useState<any>([...cat?.pictures ?? []]);
    const [picturesPreview, setPicturesPreview] = useState<string[]>([]);

    const [clinic, setClinic] = useState<string | null>();
    const [voucherObject, setVoucherObject] = useState<string | null>();

    const [catDocuments, setCatDocuments] = useState<CatDocument[]>([...cat?.documents ?? []]);
    const [vaccinesPreview, setVaccinesPreview] = useState<{ url:any, index: number}[]>([]);
    const [vaccineDate, setVaccineDate] = useState<string | undefined>(undefined);
    const [vaccinePicture, setVaccinePicture] = useState<any | null>(null);
    const inputVaccineFile = useRef(null);
    const inputVaccineDate = useRef(null);
    const [pestControlsPreview, setPestControlsPreview] = useState<{ url:any, index: number}[]>([]);
    const [pestControlDate, setPestControlDate] = useState<string | undefined>(undefined);
    const [pestControlPicture, setPestControlPicture] = useState<any | null>(null);
    const inputPestControlFile = useRef(null);
    const inputPestControlDate = useRef(null);
    const [examsPreview, setExamsPreview] = useState<{ url:any, index: number}[]>([]);
    const [examDate, setExamDate] = useState<string | undefined>(undefined);
    const [examPicture, setExamPicture] = useState<any | null>(null);
    const inputExamFile = useRef(null);
    const inputExamDate = useRef(null);

    const clinicInputRef = useRef(null);
    const voucherObjectInputRef = useRef(null);

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

        const newCatDocumentFiles: CatDocument[] = catDocuments.filter((document: CatDocument) => typeof document.picture !== "string");
        const strCatDocumentPictures: string[] = catDocuments.filter((document: CatDocument) => typeof document.picture === "string").map((document: CatDocument) => document.picture);
        const deletedCatDocumentFiles: string[] | null= cat?.documents.filter((document: CatDocument) => !strCatDocumentPictures.includes(document.picture)).map((document: CatDocument) => document.picture) ?? null;

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
            isAdoptable,
            adoptionDate,
            hostFamilyId,
            newPictureFiles,
            deletedPictureFiles,
            newCatDocumentFiles,
            deletedCatDocumentFiles
        );
        if (!res.error) {
            redirectWithDelay(`/admin/cat/${res.slug}`, 1000);
        } else {
            toast.error(res.error);
        }
    };

    const handleSubmitVoucher: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClinic(null);
        setVoucherObject(null);
        if (clinicInputRef.current) {
            console.log(clinicInputRef.current);
            (clinicInputRef.current as any).clearValue();
        }
        if (voucherObjectInputRef.current) {
            (voucherObjectInputRef.current as any).clearValue();
        }

        const date: string = formatYMMDD(new Date());
        const user_name: string = `${user?.name} ${user?.lastName}`;
        const res = await create(
            token,
            date,
            user_name,
            cat?.id ?? "-1",
            clinic ?? "",
            voucherObject ?? ""
        );
        if (!res.error) {
            toast.success("Bon vétérinaire créé avec succès");
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
        const newVaccineUrls: { url:any, index: number}[] = [];
        const newPestControlUrls: { url:any, index: number}[] = [];
        const newExamenUrls: { url:any, index: number}[] = [];
        catDocuments.map((document:CatDocument, index: number) => {
            let array = null;
            switch (document.type) {
                case "vaccin":
                    array = newVaccineUrls;
                    break;
                case 'antiparasitaire':
                    array = newPestControlUrls;
                    break;
                case 'examen':
                    array = newExamenUrls;
                    break;
            }
            array.push({ url: typeof document.picture === "string" ? document.picture : URL.createObjectURL(document.picture), index });
        });
        setVaccinesPreview(newVaccineUrls);
        setPestControlsPreview(newPestControlUrls);
        setExamsPreview(newExamenUrls);
    }, [catDocuments]);

    const documentPictureChange = (e: any, type: "vaccin" | "antiparasitaire" | "examen") => {
        switch (type)  {
            case "vaccin":
                setVaccinePicture(e.target.files[0]);
                break;
            case "antiparasitaire":
                setPestControlPicture(e.target.files[0]);
                break;
            case "examen":
                setExamPicture(e.target.files[0]);
                break;
        }
    }

    const addDocument = (type: "vaccin" | "antiparasitaire" | "examen") => {
        switch (type)  {
            case "vaccin":
                if (vaccineDate && vaccinePicture) {
                    setCatDocuments([...catDocuments, { id: '', cat_id: cat?.id ?? '', date: vaccineDate ?? '', picture: vaccinePicture, type }]);
                    setVaccinePicture(undefined);
                    setVaccineDate(undefined);
                }
                break;
            case "antiparasitaire":
                if (pestControlDate && pestControlPicture) {
                    setCatDocuments([...catDocuments, { id: '', cat_id: cat?.id ?? '', date: pestControlDate ?? '', picture: pestControlPicture, type }]);
                    setPestControlPicture(undefined);
                    setPestControlDate(undefined);
                }
                break;
            case "examen":
                if (examDate && examPicture) {
                    setCatDocuments([...catDocuments, { id: '', cat_id: cat?.id ?? '', date: examDate ?? '', picture: examPicture, type }]);
                    setExamPicture(undefined);
                    setExamDate(undefined);
                }
                break;
        }
        handleReset(type);
    }

    const removeDocument = (e: { preventDefault: () => void; }, idx: number) => {
        catDocuments.splice(idx, 1);
        e.preventDefault();
        setCatDocuments([...catDocuments]);
    }

    const handleReset = (type: "vaccin" | "antiparasitaire" | "examen") => {
        switch (type)  {
            case "vaccin":
                if (inputVaccineFile.current) {
                    (inputVaccineFile.current as HTMLInputElement).value = "";
                    (inputVaccineFile.current as HTMLInputElement).type = "text";
                    (inputVaccineFile.current as HTMLInputElement).type = "file";
                }
                if (inputVaccineDate.current) {
                    (inputVaccineDate.current as HTMLInputElement).value = "";
                }
                break;
            case "antiparasitaire":
                if (inputPestControlFile.current) {
                    (inputPestControlFile.current as HTMLInputElement).value = "";
                    (inputPestControlFile.current as HTMLInputElement).type = "text";
                    (inputPestControlFile.current as HTMLInputElement).type = "file";
                }
                if (inputPestControlDate.current) {
                    (inputPestControlDate.current as HTMLInputElement).value = "";
                }
                break;
            case "examen":
                if (inputExamFile.current) {
                    (inputExamFile.current as HTMLInputElement).value = "";
                    (inputExamFile.current as HTMLInputElement).type = "text";
                    (inputExamFile.current as HTMLInputElement).type = "file";
                }
                if (inputExamDate.current) {
                    (inputExamDate.current as HTMLInputElement).value = "";
                }
                break;
        }
    }

    useEffect(() => {
        console.log(birthDate);
        setSterilizationDateError(isTodayGreaterThanDatePlus6Months(birthDate));
    }, [birthDate]);

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
                            <h5 className="text-(--primary)">Modification fiche chat</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
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
                            <Input name="name" label="Nom" required={true} value={cat?.name} maxLength={20} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Description</label>
                                <textarea
                                    className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5'
                                    name="description"
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
                            <Input name="numIdentification" label="N° d'identification" value={cat?.numIdentification} maxLength={20} />
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
                            <Input name="dress" label="Robe" value={cat?.dress} maxLength={10} />
                            <Input name="race" label="Race" value={cat?.race} maxLength={10} />
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
                            <Input 
                                name="sterilizationDate"
                                label="Date de la stérilisation  / castration"
                                type={InputTypes.Date} value={cat?.sterilizationDate ? formatYMMDD(new Date(cat?.sterilizationDate)) : ''}
                                className={ sterilizationDateError ? "error" : "" }
                            />
                            <Input name="birthDate" label="Date de naissance" type={InputTypes.Date} value={birthDate ? formatYMMDD(new Date(birthDate)) : ''}
                                onChange={(e) => setBirthDate(e.currentTarget.value)} />
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
                            {/* <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
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
                            </div> */}
                            <Input name="adoptionDate" label="Date d'adoption" type={InputTypes.Date} value={cat?.adoptionDate ? formatYMMDD(new Date(cat?.adoptionDate)) : ''} />
                            <Input name="catPictures" label="Photos" type={InputTypes.File} multipleFile={true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => picturesChange(e)} />
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
                                        onChange={(e) => setVaccineDate(e.currentTarget.value)}
                                        ref={inputVaccineDate} />
                                    <Input
                                        name="vaccinePicture"
                                        label="Photos du vaccin"
                                        type={InputTypes.File}
                                        onChange={(e) => documentPictureChange(e, "vaccin")}
                                        showLabel={false}
                                        className='max-w-44'
                                        ref={inputVaccineFile} />
                                    <span className='text-sm text-(--primary)'>{vaccinePicture?.name}</span>
                                    <Button className="flex text-sm p-10 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer"
                                         onClick={(e:any) => { addDocument("vaccin"); e.preventDefault(); }}
                                         text="Ajouter le vaccin"
                                         disabled={!vaccineDate || !vaccinePicture}
                                         />
                                </div>
                                <div className='flex flex-wrap w-full gap-7 mt-24'>
                                    {vaccinesPreview.map((value: { url: string, index: number}, idx: number) => (
                                        <div key={idx} className="rounded-[10px] h-124 w-100 overflow-hidden relative border border-1 border-solid border-(--pink)">
                                            <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, idx)} />
                                            <figcaption className='flex flex-col p-5'>
                                                <img
                                                    data-testid={"vaccin-image-" + (idx + 1)}
                                                    src={(value.url.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + value.url}
                                                    alt={"Image du vaccin n°" + (idx + 1)}
                                                    style={{ objectFit: "contain" }}
                                                    className=' max-h-150'
                                                />
                                                <figcaption className='text-(--primary) text-sm p-3 text-center'>{ formatDDMMY(new Date(catDocuments[value.index]?.date)) }</figcaption>
                                            </figcaption>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="select flex flex-col flex-1 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="">Antiparasitaires</label>
                                <div className='flex gap-10 items-center'>
                                    <Input
                                        name="antiparasiticDate"
                                        label="Date de l'antiparasitaire"
                                        type={InputTypes.Date}
                                        showLabel={false}
                                        className='max-w-150'
                                        value={pestControlDate}
                                        onChange={(e) => setPestControlDate(e.target.value)}
                                        ref={inputPestControlDate} />
                                    <Input
                                        name="antiparasiticsPicture"
                                        label="Photos de l'antiparasitaire"
                                        type={InputTypes.File}
                                        onChange={(e) => documentPictureChange(e, "antiparasitaire")}
                                        showLabel={false}
                                        className='max-w-44'
                                        ref={inputPestControlFile} />
                                    <span className='text-sm text-(--primary)'>{pestControlPicture?.name}</span>
                                    <Button className="flex text-sm p-10 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer"
                                         onClick={(e:any) => { addDocument("antiparasitaire"); e.preventDefault(); }}
                                         text="Ajouter l'antiparasitaire"
                                         disabled={!pestControlDate || !pestControlPicture}
                                         />
                                </div>
                                <div className='flex flex-wrap w-full gap-7 mt-24'>
                                    {pestControlsPreview.map((value: { url: string, index: number}, idx: number) => (
                                        <div key={idx} className="rounded-[10px] h-124 w-100 overflow-hidden relative border border-1 border-solid border-(--pink)">
                                            <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, value.index)} />
                                            <figcaption className='flex flex-col p-5'>
                                                <img
                                                    data-testid={"antiparasitaire-image-" + (idx + 1)}
                                                    src={(value.url.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + value.url}
                                                    alt={"Image de l'antiparasitaire n°" + (idx + 1)}
                                                    style={{ objectFit: "contain" }}
                                                    className=' max-h-150'
                                                />
                                                <figcaption className='text-(--primary) text-sm p-3 text-center'>{ formatDDMMY(new Date(catDocuments[value.index]?.date)) }</figcaption>
                                            </figcaption>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="select flex flex-col flex-1 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="">CR interventions / résultats PS / Examens</label>
                                <div className='flex gap-10 items-center'>
                                    <Input
                                        name="examDate"
                                        label="Date"
                                        type={InputTypes.Date}
                                        showLabel={false}
                                        className='max-w-150'
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                        ref={inputExamDate} />
                                    <Input
                                        name="examPicture"
                                        label="Photos"
                                        type={InputTypes.File}
                                        onChange={(e) => documentPictureChange(e, "examen")}
                                        showLabel={false}
                                        className='max-w-44'
                                        ref={inputExamFile} />
                                    <span className='text-sm text-(--primary)'>{examPicture?.name}</span>
                                    <Button className="flex text-sm p-10 h-40 bg-(--primary) items-center justify-center rounded-[10px] text-lg text-(--white) cursor-pointer"
                                         onClick={(e:any) => { addDocument("examen"); e.preventDefault(); }}
                                         text="Ajouter le CR/ PS / Examens"
                                         disabled={!examDate || !examPicture}
                                         />
                                </div>
                                <div className='flex flex-wrap w-full gap-7 mt-24'>
                                    {examsPreview.map((value: { url: string, index: number}, idx: number) => (
                                        <div key={idx} className="rounded-[10px] h-124 w-100 overflow-hidden relative border border-1 border-solid border-(--pink)">
                                            <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, value.index)} />
                                            <figcaption className='flex flex-col p-5'>
                                                <img
                                                    data-testid={"examen-image-" + (idx + 1)}
                                                    src={(value.url.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + value.url}
                                                    alt={"Image de l'examen n°" + (idx + 1)}
                                                    style={{ objectFit: "contain" }}
                                                    className=' max-h-150'
                                                />
                                                <figcaption className='text-(--primary) text-sm p-3 text-center'>{ formatDDMMY(new Date(catDocuments[value.index]?.date)) }</figcaption>
                                            </figcaption>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Valider les modifications" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                            {user && hasRoles(user.roles, [UserRole.Admin, UserRole.Assistant]) && !isAdoptable && 
                            <Button 
                                text="Valider la fiche pour l'adoption"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-270'
                                onClick={(e) => { setIsAdoptable(true); toast.info("N'oubliez pas de cliquer sur le bouton 'Valider les modifications' pour que celle-ci soit réellement validée") }}/>}
                        </div>
                    </form>
                    <hr className='border-(--primary)' />
                    <div className="flex flex-col gap-10" role="form" aria-label="Demander un bon vétérinaire">
                         <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--primary)">Demander un bon vétérinaire</h5>
                        </div>
                        <div className="flex gap-12 md:gap-24">
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="clinical">Clinique</label>
                                <Select
                                    ref={clinicInputRef}
                                    options={Clinics}
                                    className="select"
                                    classNamePrefix="select"
                                    name="clinical"
                                    id="clinical"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={true}
                                    placeholder="Clinique"
                                    onChange={(e:any) => setClinic(e?.value ?? null)}
                                />
                                <span className="text-sm text-(--text)">* Clinique de l'association</span>
                            </div>
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-auto">
                                <label className="text-sm text-(--text) font-medium " htmlFor="voucherObjet">Objet du bon</label>
                                <Select
                                    ref={voucherObjectInputRef}
                                    options={voucherObjects}
                                    className="select"
                                    classNamePrefix="select"
                                    name="voucherObjet"
                                    id="voucherObjet"
                                    isMulti={true}
                                    isClearable={true}
                                    isSearchable={true}
                                    placeholder="Objet du bon"
                                    onChange={(e:any) => setVoucherObject(e?.value ?? null)}
                                />
                            </div>
                        </div>
                        <div className='flex justify-center'>
                            <Button
                                text="Demander le bon"
                                disabled={!voucherObject || !clinic}
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230'
                                onClick={(e) => handleSubmitVoucher(e) }/>
                        </div>
                    </div>
               </div>
            </div>
            <Footer />
        </main>
    );
}