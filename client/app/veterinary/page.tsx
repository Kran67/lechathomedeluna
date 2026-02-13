'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useCookies } from 'next-client-cookies';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import {
  HeaderMenuItems,
  UserRole,
} from '@/app/enums/enums';

import { useUser } from '../contexts/userContext';
import {
  formatDDMMY,
  hasRoles,
} from '../lib/utils';
import { vetVouchersService } from '../services/client/vetVouchersService';
import {
  Clinics,
  voucherObjects,
} from '../staticLists/staticLists';

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
    const token: string | undefined = cookieStore.get("token");
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [clinic, setClinic] = useState<string>('-');
    const [voucherObject, setVoucherObject] = useState<string>('-');
    const service = vetVouchersService(token, year, clinic, voucherObject);

    const Years: {
        value: number;
        label: number;
    }[] = [];
        for (let i = 2026; i <= new Date().getFullYear(); i++) {
        Years.push({ value: i, label: i});
    }

    if (!user || !hasRoles(user?.roles, [UserRole.Admin, UserRole.Assistant])) {
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
                                onChange={(e:any) => setClinic(e?.value ?? null)}
                                styles={{container: provided => ({
                                    ...provided,
                                    width: 370,
                                    textAlign: "left"
                                })}}
                            />
                            <Select
                                options={voucherObjects}
                                className="select"
                                classNamePrefix="select"
                                name="voucherObjet"
                                id="voucherObjet"
                                isMulti={false}
                                isClearable={true}
                                isSearchable={true}
                                placeholder="Objet du bon"
                                onChange={(e:any) => setVoucherObject(e?.value ?? null)}
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
                <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                    <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                        <span className="text-(--white) w-100 px-5">Date</span>
                        <span className="text-(--white) border-l w-150 px-5">Demandeur</span>
                        <span className="text-(--white) border-l w-100 px-5">Pour</span>
                        <span className="text-(--white) border-l flex-1 px-5">Clinique</span>
                        <span className="text-(--white) border-l w-250 px-5">Objet</span>
                        <span className="text-(--white) border-l w-70 px-5">Actions</span>
                    </div>
                    {service.vetVouchers?.map((voucher, idx) => (
                        <div key={voucher.id} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                            <span className="w-100 px-5 text-(--text)">{formatDDMMY(new Date(voucher.date))}</span>
                            <span className="border-l w-150 px-5 text-(--text)">{voucher.user_name}</span>
                            <span className="border-l w-100 px-5 text-(--text)">{voucher.cat.name}</span>
                            <span className="border-l flex-1 px-5 text-(--text)">{voucher.clinic}</span>
                            <span className="border-l w-250 px-5 text-(--text)">{voucher.object}</span>
                            <span className="flex justify-center gap-5 border-(--pink) border-l w-70 px-5">
                            </span>
                        </div>
                    ))}
                </div>
                </div>
            <Footer />
        </main>
    );
}
