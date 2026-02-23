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
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Link from '@/app/components/ui/Link';
import { useUser } from '@/app/contexts/userContext';
import { HeaderMenuItems } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import {
  hasRoles,
  redirectWithDelay,
  sendResetPasswordEmail,
} from '@/app/lib/utils';
import {
  getById,
  resetPassword,
  update,
} from '@/app/services/server/usersService';
import { Cities } from '@/app/staticLists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Profile() {
    const { user, clear } = useUser();
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const [profile, setProfile] = useState<User | null>(null);
    const [city, setCity] = useState<string>(user?.city || "");

    if (!user) {
        redirect("/");
    }

    useEffect(() => {
        getById(token, user!.id).then((res) => {
            if (!res.error) {
                setProfile(res);
            } else {
                throw new Error(res.error);
            }
        });
    }, [token, user]);

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);

        const res = await update(
            token,
            profile!.id,
            formData.get("name") as string,
            formData.get("lastname") as string,
            formData.get("social_number") as string,
            formData.get("phone") as string,
            formData.get("address") as string,
            formData.get("city") as string,
            profile!.roles,
            profile!.blacklisted,
            profile!.referrer_id ?? null
        );
        if (!res.error) {
            redirectWithDelay("/admin/profile", 1000);
        } else {
            toast.error(res.error);
        }
    };

    const handleLogout = () => {
        cookies.remove("token");
        cookies.remove("userId");
        clear();
    }

    const resetMyPassword = async (e: React.FormEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const result = await resetPassword(profile!.email);
        if (result.error) {
            toast.error(`Une erreur est survenue lors de l'envoi de l'email pour la réinitialisation du mot de passe : ${result.error.message}`);
        } else {
            sendResetPasswordEmail(profile!.email, result.token);
        }
    }
    
    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--primary)">Mon compte ({profile?.name + " " + profile?.lastName})</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="id" label="Identifiant" value={profile?.id} hidden={true} />
                            <Input name="email" label="Email" value={profile?.email} readOnly={true}maxLength={100} />
                            <Input name="name" label="Prénom" value={profile?.name} maxLength={50} />
                            <Input name="lastname" label="Nom" value={profile?.lastName} maxLength={50} />
                            <Input name="social_number" label="N° sécurité sociale" value={profile?.social_number} required={true} maxLength={13} />
                            <Input name="phone" label="Téléphone" value={profile?.phone} maxLength={10} />
                            <Input name="address" label="Adresse" value={profile?.address} maxLength={255} />
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="city">Ville</label>
                                <Select
                                    options={Cities}
                                    className="select"
                                    classNamePrefix="select"
                                    name="city"
                                    id="city"
                                    isMulti={false}
                                    isClearable={true}
                                    isSearchable={true}
                                    placeholder="Ville"
                                    value={Cities.find(c => c.value === city)}
                                    onChange={(e:any) => setCity(e?.value as string ?? "")}
                                />
                            </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Modifier les informations" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                            <Link
                                text="Réinitialiser mon mot de passe"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
                                onClick={(e: React.FormEvent<HTMLAnchorElement>) => resetMyPassword(e) }/>
                        </div>
                        {hasRoles(user?.roles, ["Admin"]) && <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Link
                                text="Administrer les utilisateurs"
                                url="/admin/users"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-250' />
                        </div>}
                    </form>
                    <Link 
                        text="Se déconnecter"
                        url="/"
                        onClick={() => handleLogout()}
                        className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230 self-center' />
                </div>
            </div>
            <Footer />
        </main>
    );
}