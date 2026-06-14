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
import Link from '../components/ui/Link';
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
    const [onlyWaitingVouchers, setOnlyWaitingVouchers] = useState<boolean>(true);

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
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.VeterinaryVouchers} />
            <div className="flex flex-col gap-10 px-16 md:p-10 w-full xl:w-1115">
                <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
                    <span className="text-[32px] text-(--primary) w-full">Bons vétérinaires</span>
                    <div className="flex flex-wrap gap-5 w-full items-center justify-center">
                        <Select
                            options={Clinics}
                            className="select w-full sm:w-auto"
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
                                minWidth: 200,
                                maxWidth: 370,
                                flex: "1 1 200px",
                                textAlign: "left"
                            })}}
                        />
                        <Select
                            options={VoucherObjects}
                            className="select w-full sm:w-auto"
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
                                minWidth: 160,
                                maxWidth: 200,
                                flex: "1 1 160px",
                                textAlign: "left"
                            })}}
                        />
                        <Select
                            options={Years}
                            className="select w-full sm:w-auto"
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
                                minWidth: 120,
                                maxWidth: 170,
                                flex: "1 1 120px"
                            })}}
                        />
                        <Select
                            options={Years}
                            className="select w-full sm:w-auto"
                            classNamePrefix="select"
                            name="role"
                            id="role"
                            isMulti={false}
                            isClearable={false}
                            isSearchable={false}
                            placeholder="État"
                            value={Years.find(c => c.value === year)}
                            onChange={(e:any) => setYear(e?.value ?? "")}
                            styles={{container: provided => ({
                                ...provided,
                                minWidth: 120,
                                maxWidth: 170,
                                flex: "1 1 120px"
                            })}}
                        />
                        <label htmlFor="check-status" className="text-(--text) text-sm">Afficher uniqument les bons en attente</label>
                        <input type="checkbox" id="check-status" name="check-status"
                        onChange={(e) => {
                            setOnlyWaitingVouchers(!onlyWaitingVouchers)
                        }}
                        checked={onlyWaitingVouchers} />
                    </div>
                </div>
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full min-w-[900px] border-l border-r border-t border-solid border-(--pink)">
                        <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                        <tr>
                            <td className="text-(--white) w-100 px-5">Date de la demande</td>
                            <td className="text-(--white) border-l w-100 px-5">Date du rendez-vous</td>
                            <td className="text-(--white) border-l w-150 px-5">Demandeur</td>
                            <td className="text-(--white) border-l w-150 px-5">Pour</td>
                            <td className="text-(--white) border-l flex-1 px-5">Clinique</td>
                            <td className="text-(--white) border-l w-250 px-5">Objet</td>
                            <td className="text-(--white) border-l w-250 px-5">Commentaire</td>
                            <td className="text-(--white) border-l w-100 px-5">Traité le</td>
                            <td className="text-(--white) border-l w-70 px-5">Actions</td>
                        </tr>
                        </thead>
                        <tbody>
                        {service.vetVouchers && service.vetVouchers.length > 0 ? service.vetVouchers?.map((voucher, idx) => (
                            <tr key={voucher.id} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                                <td className={"w-100 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{formatDDMMY(new Date(voucher.date))}</td>
                                <td className={"border-l w-100 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{formatDDMMY(new Date(voucher.appointmentDate))}</td>
                                <td className={"border-l w-150 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{voucher.user_name}</td>
                                <td className={"border-l w-150 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{voucher.cat.numId} / {voucher.cat.name}</td>
                                <td className={"border-l flex-1 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{voucher.clinic}</td>
                                <td className={"border-l w-250 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{voucher.object}</td>
                                <td className={"border-l w-250 px-5 text-(--text)" + (voucher.processed_on ? " line-through" : "")}>{voucher.comment}</td>
                                <td className="border-l w-100 px-5 text-(--text)">{voucher.processed_on ? formatDDMMY(new Date(voucher.processed_on)): ""}</td>
                                <td className={"border-(--pink) border-l w-70 px-5"}>
                                    {!voucher.processed_on &&
                                    <div className='flex gap-5 items-center justify-center'>
                                        <IconButton
                                            icon={IconButtonImages.Approved}
                                            svgStroke='#902677'
                                            onClick={ (e:React.MouseEvent<HTMLButtonElement>) => approved(e, voucher)}
                                            title='Demande traitée' />
                                        <IconButton
                                            icon={IconButtonImages.Trash}
                                            imgWidth={24}
                                            imgHeight={24}
                                            svgFill='#902677'
                                            onClick={ (e:React.MouseEvent<HTMLButtonElement>) => removed(e, voucher)}
                                            title='Supprimer la demande' />
                                    </div>
                                    }
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
                <div className="md:hidden flex flex-col gap-4">
                    {service.vetVouchers && service.vetVouchers.length > 0 ? (
                        service.vetVouchers.filter((voucher: VetVoucher) => onlyWaitingVouchers ? !voucher.processed_on : voucher).map((voucher: VetVoucher) => (
                            <div
                                key={voucher.id}
                                className={`overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md
                                    ${
                                        voucher.processed_on
                                            ? "bg-white border-gray-200 border-l-4 border-l-green-500"
                                            : "bg-(--light-pink) border-(--pink) border-l-4 border-l-(--pink)"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between px-4 py-3 bg-(--pink)">
                                    <div>
                                        <div
                                            className={`font-bold text-lg text-(--white)
                                                ${
                                                    voucher.processed_on
                                                        ? "line-through opacity-70"
                                                        : ""
                                                }`}
                                        >
                                            {user &&
                                            hasRoles(user.roles, [
                                                UserRoles.SuperAdmin,
                                                UserRoles.Admin,
                                                UserRoles.HostFamily,
                                            ]) ? (
                                                <Link
                                                    url={`/admin/cat/${voucher.cat.slug}`}
                                                    text={`${voucher.cat.numId} / ${voucher.cat.name}`}
                                                />
                                            ) : (
                                                <>
                                                    {voucher.cat.numId} / {voucher.cat.name}
                                                </>
                                            )}
                                        </div>

                                        <div className="text-xs text-(--white)/80 mt-1">
                                            {voucher.user_name}
                                        </div>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap
                                            ${
                                                voucher.processed_on
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {voucher.processed_on ? "Traité" : "En attente"}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-4 text-(--text)">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <div className="text-xs tracking-wide text-gray-500">
                                                Demande
                                            </div>
                                            <div className="font-medium">
                                                {formatDDMMY(new Date(voucher.date))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs tracking-wide text-gray-500">
                                                Rendez-vous
                                            </div>
                                            <div className="font-medium">
                                                {formatDDMMY(
                                                    new Date(voucher.appointmentDate)
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="border-t border-gray-200 pt-3">

                                        <div className="text-xs tracking-wide text-gray-500 mb-1">
                                            Clinique
                                        </div>

                                        <div className="font-medium">
                                            {voucher.clinic}
                                        </div>

                                    </div>

                                    <div className="border-t border-gray-200 pt-3">

                                        <div className="text-xs tracking-wide text-gray-500 mb-1">
                                            Objet
                                        </div>

                                        <div className="font-medium">
                                            {voucher.object}
                                        </div>

                                    </div>

                                    {voucher.comment && (
                                        <div className="border-t border-gray-200 pt-3">

                                            <div className="text-xs tracking-wide text-gray-500 mb-2">
                                                Commentaire
                                            </div>

                                            <div className="rounded-lg bg-white/70 p-3 text-sm leading-relaxed">
                                                {voucher.comment}
                                            </div>

                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">

                                        <span className="text-gray-500">
                                            Statut
                                        </span>

                                        {voucher.processed_on ? (
                                            <span className="font-medium text-green-700">
                                                Traité le{" "}
                                                {formatDDMMY(
                                                    new Date(voucher.processed_on)
                                                )}
                                            </span>
                                        ) : (
                                            <span className="font-medium text-yellow-700">
                                                En attente de traitement
                                            </span>
                                        )}

                                    </div>

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-(--pink) bg-(--light-pink) p-8 text-center text-(--text)">
                            <div className="font-semibold">
                                Aucun bon vétérinaire en attente
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
