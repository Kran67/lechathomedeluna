'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useCookies } from 'next-client-cookies';
import dynamic from 'next/dynamic';
import {
  redirect,
  useSearchParams,
} from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import {
  HeaderMenuItems,
  IconButtonImages,
  UserRoles,
} from '@/app/core/enums/enums';
import { VetVoucher } from '@/app/core/interfaces/vetVoucher';
import {
  formatDDMMY,
  formatYMMDD,
  hasRoles,
} from '@/app/core/lib/utils';
import { sendMessage } from '@/app/core/services/client/messagingService';
import {
  vetVouchersService,
} from '@/app/core/services/client/vetVouchersService';
import {
  remove,
  update,
} from '@/app/core/services/server/vetVouchersService';

import IconButton from '../components/ui/IconButton';
import { CONSTANTS } from '../core/consts/constants';
import { useUser } from '../core/contexts/userContext';
import {
  Clinics,
  VoucherObjects,
} from '../core/staticlists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//    title: "Le Chat'Home de Luna - Bons vétérinaires",
//    description: "Bons vétérinaires - Le Chat'Home de Luna"
//};

/**
 * Affiche la page Veterinary
 *
 * @function VetVouchers
 */
export default function VetVouchers() {
    const { user } = useUser();
    const cookieStore = useCookies();
    const token: string = cookieStore.get("token") as string;
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [clinic, setClinic] = useState<string>('-');
    const [voucherObject, setVoucherObject] = useState<string>('-');
    const searchParams = useSearchParams();
    const [vetVoucherId, setVetVoucherId] = useState<string | null>(searchParams.get("id"));
    const service = vetVouchersService(token, year, clinic, voucherObject, vetVoucherId);

    const Years: {
        value: number;
        label: number;
    }[] = [];
        for (let i = 2026; i <= new Date().getFullYear(); i++) {
        Years.push({ value: i, label: i});
    }

    if (!user || !hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent])) {
        redirect("/");
    }

    useEffect(() => {
        if (!clinic || clinic.trim() === '') {
            setClinic('-');
        }
        if (!voucherObject || voucherObject.trim() === '') {
            setVoucherObject('-');
        }
        service.refresh();
    }, [year, clinic, voucherObject]);

    const approved = async (e: React.MouseEvent<HTMLButtonElement>, voucher: VetVoucher) => {
        e.stopPropagation();
        const res = await update(token, voucher.id, formatYMMDD(new Date()));
        if (!res.error) {
            await sendMessage(token, CONSTANTS.THREAD_GROUPS.VET_VOUCHERS.toString(), user?.id as string, `✔️ Bon vétérinaire pour ${voucher.cat.name} ${voucher.cat.numId ? '('+voucher.cat.numId+')' : ''} traité.`, []);
            service.refresh();
            toast.success("Bon vétérinaire validé avec succès.");
        } else {
            toast.error(`Une erreur est survenue lors de la validation du bon vétérinaire.\n${res.error}`);
        }
    };

    const removed = async(e: React.MouseEvent<HTMLButtonElement>, voucher: VetVoucher) => {
        e.stopPropagation();
        if (confirm("Attention, vous allez supprimer un bon vétérinaire, souhaitez-vous continuer ?")) {
            await remove(token, voucher.id);
            await sendMessage(token, CONSTANTS.THREAD_GROUPS.VET_VOUCHERS.toString(), user?.id as string, `❌ Bon vétérinaire pour ${voucher.cat.name} ${voucher.cat.numId ? '('+voucher.cat.numId+')' : ''} a été supprimé.`, []);
            service.refresh();
            toast.success("Bon vétérinaire supprimé avec succès.");
        }
    }
  
    return (
        <main className="flex flex-col gap-20 w-full items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.VeterinaryVouchers} />
            <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
                <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
                    <span className="text-[32px] text-(--primary) w-full">Bons vétérinaires</span>
                    <div className="flex gap-5 w-full items-center justify-center">
                        <Select
                            options={Clinics}
                            className="select"
                            classNamePrefix="select"
                            name="clinical"
                            id="clinical"
                            isMulti={false}
                            isClearable={true}
                            isSearchable={true}
                            placeholder="Clinique"
                            onChange={(e:any) => { setVetVoucherId(null); setClinic(e?.value ?? null)}}
                            styles={{container: provided => ({
                                ...provided,
                                width: 370,
                                textAlign: "left"
                            })}}
                        />
                        <Select
                            options={VoucherObjects}
                            className="select"
                            classNamePrefix="select"
                            name="voucherObjet"
                            id="voucherObjet"
                            isMulti={false}
                            isClearable={true}
                            isSearchable={true}
                            placeholder="Objet du bon"
                            onChange={(e:any) => { setVetVoucherId(null); setVoucherObject(e?.value ?? null) }}
                            styles={{container: provided => ({
                                ...provided,
                                width: 200,
                                textAlign: "left"
                            })}}
                        />
                        <Select
                            options={Years}
                            className="select"
                            classNamePrefix="select"
                            name="role"
                            id="role"
                            isMulti={false}
                            isClearable={false}
                            isSearchable={false}
                            placeholder="Année d'adoption"
                            value={Years.find(c => c.value === year)}
                            onChange={(e:any) => setYear(e?.value ?? "")}
                            styles={{container: provided => ({
                                ...provided,
                                width: 170
                            })}}
                        />

                    </div>
                </div>
                <table className="w-full border-l border-r border-t border-solid border-(--pink)">
                    <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                        <tr>
                        <td className="text-(--white) w-100 px-5">Date de la demande</td>
                        <td className="text-(--white) border-l w-100 px-5">Date du rendez-vous</td>
                        <td className="text-(--white) border-l w-150 px-5">Demandeur</td>
                        <td className="text-(--white) border-l w-150 px-5">Pour</td>
                        <td className="text-(--white) border-l flex-1 px-5">Clinique</td>
                        <td className="text-(--white) border-l w-250 px-5">Objet</td>
                        <td className="text-(--white) border-l w-70 px-5">Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                    {service.vetVouchers && service.vetVouchers.length > 0 ? service.vetVouchers?.map((voucher, idx) => (
                        <tr key={voucher.id} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                            <td className="w-100 px-5 text-(--text)">{formatDDMMY(new Date(voucher.date))}</td>
                            <td className="border-l w-100 px-5 text-(--text)">{formatDDMMY(new Date(voucher.appointmentDate))}</td>
                            <td className="border-l w-150 px-5 text-(--text)">{voucher.user_name}</td>
                            <td className="border-l w-150 px-5 text-(--text)">{voucher.cat.numId} / {voucher.cat.name}</td>
                            <td className="border-l flex-1 px-5 text-(--text)">{voucher.clinic}</td>
                            <td className="border-l w-250 px-5 text-(--text)">{voucher.object}</td>
                            <td className="border-(--pink) border-l w-70 px-5">
                                <div className='flex gap-5 items-center justify-center'>
                                    <IconButton
                                        icon={IconButtonImages.Approved}
                                        svgStroke='#902677'
                                        onClick={ (e:React.MouseEvent<HTMLButtonElement>) => approved(e, voucher)}
                                        title='Traiter la demande' />
                                    <IconButton
                                        icon={IconButtonImages.Trash}
                                        imgWidth={24}
                                        imgHeight={24}
                                        svgFill='#902677'
                                        onClick={ (e:React.MouseEvent<HTMLButtonElement>) => removed(e, voucher)}
                                        title='Supprimer la demande' />
                                </div>
                            </td>
                        </tr>
                        ))
                    : <tr> 
                        <td colSpan={7} className='text-center border-b border-solid border-(--pink) text-(--text)'>Pas de bons vétérinaires</td>
                      </tr>
                    }
                    </tbody>
                </table>
            </div>
            <Footer />
        </main>
    );
}
