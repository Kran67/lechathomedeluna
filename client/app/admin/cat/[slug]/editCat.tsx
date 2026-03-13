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
import { CONSTANTS } from '@/app/core/consts/constants';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
  UserRoles,
} from '@/app/core/enums/enums';
import {
  Cat,
  CatDocument,
} from '@/app/core/interfaces/cat';
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
import {
  getBySlug,
  update,
} from '@/app/core/services/server/catsService';
import { create } from '@/app/core/services/server/vetVouchersService';
import {
  CatSexes,
  CatStatus,
  Clinics,
  VoucherObjects,
  YesNo,
} from '@/app/core/staticlists/staticLists';

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
    const token: string = cookies.get("token") as string;
    const [status, setStatus] = useState<string | null>(cat?.status ?? null);
    const [sex, setSex] = useState<string | null>(cat?.sex ?? null);
    const [isSterilized, setIsSterilized] = useState<boolean>(cat?.isSterilized ?? false);
    const [isDuringVisit, setIsDuringVisit] = useState<boolean>(cat?.isDuringVisit ?? false);
    let isAdoptable = cat?.isAdoptable ?? false;
    const [birthDate, setBirthDate] = useState<string | null>(cat?.birthDate ?? null);
    const [entryDate, setEntryDate] = useState<string | null>(cat?.entryDate ?? null);
    const [sterilizationDateError, setSterilizationDateError] = useState<boolean>(false);
    const [hostFamilyId, setHostFamilyId] = useState<string | null>(cat?.hostFamily?.id ?? null);
    const router = useRouter();
    const [pictures, setPictures] = useState<any>([...cat?.pictures ?? []]);
    const [picturesPreview, setPicturesPreview] = useState<string[]>([]);
    const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
    const appointmentDateRef = useRef(null);

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
    const primaryButton = useRef(null);

    const clinicInputRef = useRef(null);
    const voucherObjectInputRef = useRef(null);

    const filteredHostFamilies = hostFamilies?.map(u => ({
        value: u.id,
        label: `${u.lastName} ${u.name}`,
    }));

    const isReadonly: boolean = !hasRoles(user?.roles as string, [UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily]);

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const sterilizationDate: string | null = formData.get("sterilizationDate") as string !== '' ? formData.get("sterilizationDate") as string : null;
        const birthDate: string | null = formData.get("birthDate") as string !== '' ? formData.get("birthDate") as string : null;
        const adoptionDate: string | null = formData.get("adoptionDate") as string !== '' ? formData.get("adoptionDate") as string : null;
        const preVisitDate: string | null = formData.get("preVisitDate") as string !== '' ? formData.get("preVisitDate") as string : null;
        const entryDate: string | null = formData.get("entryDate") as string !== '' ? formData.get("entryDate") as string : null;
        const catName: string = formData.get("name") as string;
        const provenance: string = formData.get("provenance") as string;
        const dress: string = formData.get("dress") as string;
        const numId: string = formData.get("numIdentification") as string;
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
            isAdoptable,
            adoptionDate,
            preVisitDate,
            hostFamilyId,
            newPictureFiles,
            deletedPictureFiles,
            newCatDocumentFiles,
            deletedCatDocumentFiles,
            user?.id as string,
            entryDate,
            provenance,
            baseUrl
        );
        if (!res.error) {
            setTimeout(() => {
                getBySlug(slug).then((updatedCat) => {
                    newCatDocumentFiles.map(async (doc: CatDocument) => {
                        const document: CatDocument = updatedCat.documents.find((d: CatDocument) => 
                            d.fileName === doc.fileName && formatDDMMY(new Date(d.date)) === formatDDMMY(new Date(doc.date)) && doc.type === d.type
                        );
                        debugger;
                        await sendMessage(
                            token,
                            CONSTANTS.THREAD_GROUPS.HEALTH_REGISTER.toString(),
                            user?.id as string,
                            `Un nouveau ${doc.type} a été ajouté pour le 🐈 ${baseUrl}/admin/cat/${res.slug}[${catName}].`, [{
                                id: "",
                                mime_type: doc.mimeType as string,
                                filename: "-",
                                original_name: doc.fileName as string,
                                size: doc.size as number,
                                url: document?.picture
                            }]);
                    });
                });
            }, 1000);
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
            (clinicInputRef.current as any).clearValue();
        }
        if (voucherObjectInputRef.current) {
            (voucherObjectInputRef.current as any).clearValue();
        }
        if (appointmentDateRef.current) {
            (appointmentDateRef.current as HTMLInputElement).value = "";
        }

        const date: string = formatYMMDD(new Date());
        const res = await create(
            token,
            date,
            appointmentDate as string,
            user?.id as string,
            cat?.id ?? "-1",
            clinic ?? "",
            voucherObject ?? "",
            user?.id as string
        );
        if (!res.error) {
            toast.success("Bon vétérinaire créé avec succès");
            await sendMessage(
                token,
                CONSTANTS.THREAD_GROUPS.VET_VOUCHERS.toString(),
                user?.id as string,
                `📋 Demande de bon vétérinaire pour ${cat?.name} ${cat?.numIdentification ? '('+cat.numIdentification+')' : ''}\n
                    Clinique: ${baseUrl}/veterinary/?id=${res.id}[${clinic}]\nObjet: ${voucherObject}`, []);
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
                    console.log(vaccinePicture);
                    setCatDocuments([...catDocuments, {
                        id: '',
                        cat_id: cat?.id ?? '',
                        date: vaccineDate ?? '',
                        picture: vaccinePicture,
                        type,
                        fileName: vaccinePicture.name,
                        size: vaccinePicture.size,
                        mimeType: vaccinePicture.type
                    }]);
                    setVaccinePicture(undefined);
                    setVaccineDate(undefined);
                }
                break;
            case "antiparasitaire":
                if (pestControlDate && pestControlPicture) {
                    setCatDocuments([...catDocuments, {
                        id: '',
                        cat_id: cat?.id ?? '',
                        date: pestControlDate ?? '',
                        picture: pestControlPicture,
                        type,
                        fileName: pestControlPicture.name,
                        size: pestControlPicture.size,
                        mimeType: pestControlPicture.type
                    }]);
                    setPestControlPicture(undefined);
                    setPestControlDate(undefined);
                }
                break;
            case "examen":
                if (examDate && examPicture) {
                    setCatDocuments([...catDocuments, {
                        id: '',
                        cat_id: cat?.id ?? '',
                        date: examDate ?? '',
                        picture: examPicture,
                        type,
                        fileName: examPicture.name,
                        size: examPicture.size,
                        mimeType: examPicture.type
                    }]);
                    setExamPicture(undefined);
                    setExamDate(undefined);
                }
                break;
        }
        handleReset(type);
    }

    const removeDocument = (e: { preventDefault: () => void; }, idx: number, type: "vaccin" | "antiparasitaire" | "examen") => {
        e.preventDefault();
        catDocuments.splice(idx, 1);
        setCatDocuments([...catDocuments]);
        switch (type)  {
            case "vaccin":
                vaccinesPreview.splice(idx, 1);
                setVaccinesPreview([...vaccinesPreview]);
                break;
            case "antiparasitaire":
                pestControlsPreview.splice(idx, 1);
                setPestControlsPreview([...pestControlsPreview]);
                break;
            case "examen":
                examsPreview.splice(idx, 1);
                setExamsPreview([...examsPreview]);
                break;
        }
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
        setSterilizationDateError(isTodayGreaterThanDatePlus6Months(birthDate));
    }, [birthDate]);

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Adoption} />
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
                            {user && !hasRoles(user.roles, [UserRoles.HostFamily]) && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="hostFamilyId">Famille d'accueil</label>
                                {!isReadonly ? <Select
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
                                /> : <div className='flex text-sm text-(--text) border border-1 border-(--pink) h-40 rounded-[4px] items-center px-10 py-16 bg-[#eee]'>{filteredHostFamilies?.find(c => c.value === hostFamilyId)?.label}</div>}
                            </div>}
                            <Input
                                name="name"
                                label="Nom"
                                required={true}
                                value={cat?.name}
                                maxLength={20}
                                readOnly={isReadonly}
                            />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Description</label>
                                <textarea
                                    className={'text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5' + (isReadonly ? " bg-[#eee]" : "")}
                                    name="description"
                                    rows={5}
                                    defaultValue={cat?.description}
                                    readOnly={isReadonly}
                                />
                            </div>
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="status">Statut (FIV & FELV)</label>
                                {!isReadonly ? <Select
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
                                /> : <div className='flex text-sm text-(--text) border border-1 border-(--pink) h-40 rounded-[4px] items-center px-10 py-16 bg-[#eee]'>{CatStatus?.find(c => c.value === status)?.label}</div>}
                            </div>
                            <Input name="numIdentification" label="N° d'identification" value={cat?.numIdentification} maxLength={20} readOnly={isReadonly} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="sex">Sexe *</label>
                                {!isReadonly ? <Select
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
                                /> : <div className='flex text-sm text-(--text) border border-1 border-(--pink) h-40 rounded-[4px] items-center px-10 py-16 bg-[#eee]'>{CatSexes?.find(c => c.value === sex)?.label}</div>}
                            </div>
                            <Input name="dress" label="Robe" value={cat?.dress} maxLength={10} readOnly={isReadonly} required={true} />
                            <Input name="race" label="Race" value={cat?.race} maxLength={10} readOnly={isReadonly} />
                            <Input name="entryDate"
                                label="Date d'entrée"
                                type={InputTypes.Date}
                                value={cat?.entryDate ? formatYMMDD(new Date(cat?.entryDate)) : undefined}
                                onChange={(e) => setEntryDate(e.currentTarget.value)}
                                readOnly={isReadonly} />
                            <Input name="provenance" label="Provenance"  value={cat?.provenance} maxLength={50} readOnly={isReadonly} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="isSterilized">Est stérilisé</label>
                                {!isReadonly ? <Select
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
                                /> : <div className='flex text-sm text-(--text) border border-1 border-(--pink) h-40 rounded-[4px] items-center px-10 py-16 bg-[#eee]'>{YesNo?.find(c => c.value === isSterilized)?.label}</div>}
                            </div>
                            <Input
                                name="birthDate"
                                label="Date de naissance"
                                type={InputTypes.Date}
                                value={birthDate ? formatYMMDD(new Date(birthDate)) : undefined}
                                onChange={(e) => setBirthDate(e.currentTarget.value)}
                                readOnly={isReadonly} />
                            <Input 
                                name="sterilizationDate"
                                label="Date de la stérilisation  / castration"
                                type={InputTypes.Date} value={cat?.sterilizationDate ? formatYMMDD(new Date(cat?.sterilizationDate)) : undefined}
                                className={ sterilizationDateError ? "error" : "" }
                                readOnly={isReadonly}
                            />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="isDuringVisit">En cours de visite</label>
                                {!isReadonly ? <Select
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
                                /> : <div className='flex text-sm text-(--text) border border-1 border-(--pink) h-40 rounded-[4px] items-center px-10 py-16 bg-[#eee]'>{YesNo?.find(c => c.value === isDuringVisit)?.label}</div>}
                            </div>
                            <Input
                                name="preVisitDate"
                                label="Date de la pré visite"
                                type={InputTypes.Date}
                                value={cat?.preVisitDate ? formatYMMDD(new Date(cat?.preVisitDate)) : undefined}
                                readOnly={isReadonly} />
                            <Input
                                name="adoptionDate"
                                label="Date d'adoption"
                                type={InputTypes.Date}
                                value={cat?.adoptionDate ? formatYMMDD(new Date(cat?.adoptionDate)) : undefined}
                                readOnly={isReadonly} />
                            {!isReadonly ? <Input
                                name="catPictures"
                                label="Photos"
                                type={InputTypes.File}
                                multipleFile={true}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => picturesChange(e)}
                                /> : <div className="text-sm text-(--text) font-medium ">Photos</div>}
                            <div className='flex flex-wrap w-full gap-7'>
                                {picturesPreview.map((picture: string, idx: number) => (
                                    <div key={idx} className="rounded-[10px] h-100 w-100 overflow-hidden relative">
                                        {!isReadonly && <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                            icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removePicture(e, idx)} />}
                                        <img
                                            data-testid={"chat-image-" + (idx + 1)}
                                            src={(picture.includes('/uploads/') ? process.env.NEXT_PUBLIC_API_BASE_URL : "") + picture}
                                            alt={"Image du chat n°" + (idx + 1)}
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.HealthRegisterReferent]) && <><div className="select flex flex-col flex-1 justify-start h-77">
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
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, value.index, "vaccin")} />
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
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, value.index, "antiparasitaire")} />
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
                                                icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removeDocument(e, value.index, "examen")} />
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
                            </div></>}
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            {user && !hasRoles(user.roles, [UserRoles.VetVoucherReferent]) && <Button ref={primaryButton} text="Valider les modifications" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />}
                            {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.AdoptionReferent]) && !isAdoptable && 
                            <Button 
                                text="Valider la fiche pour l'adoption"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-270'
                                onClick={async (e) => {
                                    isAdoptable = true;
                                    if (hostFamilyId) {
                                        await sendMessage(token, CONSTANTS.THREAD_GROUPS.ADOPTION.toString(), user?.id as string, `Le 🐈 ${baseUrl}/admin/cat/${cat?.slug}[${cat?.name}] ${cat?.numIdentification ? '('+cat.numIdentification+')' : ''} vient de passer à l'adoption 🔥.`, []);
                                    }
                                } }/>}
                        </div>
                    </form>
                    {user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.HostFamily]) && 
                        <>
                            <hr className='border-(--primary)' />
                            <form onSubmit={handleSubmitVoucher} className="flex flex-col gap-10" role="form" aria-label="Demander un bon vétérinaire">
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
                                            required={true}
                                            placeholder="Clinique"
                                            onChange={(e:any) => setClinic(e?.value ?? null)}
                                        />
                                        <span className="text-sm text-(--text)">* Clinique de l'association</span>
                                    </div>
                                    <div className="select flex flex-col flex-1 gap-7 justify-start h-auto">
                                        <label className="text-sm text-(--text) font-medium " htmlFor="voucherObjet">Objet du bon</label>
                                        <Select
                                            ref={voucherObjectInputRef}
                                            options={VoucherObjects}
                                            className="select"
                                            classNamePrefix="select"
                                            name="voucherObjet"
                                            id="voucherObjet"
                                            isMulti={true}
                                            isClearable={true}
                                            isSearchable={true}
                                            required={true}
                                            placeholder="Objet du bon"
                                            onChange={(e:any) => { setVoucherObject(e.map((e: any) => e.value).join(", ") ?? null) }}
                                        />
                                    </div>
                                    <Input
                                        name="appointmentDate"
                                        label="Date du rendez-vous"
                                        type={InputTypes.Date}
                                        className='max-w-150'
                                        required={true}
                                        value={undefined}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        ref={appointmentDateRef}
                                    />
                                </div>
                                <div className='flex justify-center'>
                                    <Button
                                        text="Demander le bon"
                                        disabled={!clinic || voucherObject?.length === 0 || !appointmentDate}
                                        className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230'
                                    />
                                </div>
                            </form>
                        </>}
               </div>
            </div>
            <Footer />
        </main>
    );
}