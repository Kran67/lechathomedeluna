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

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  UserRole,
} from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import {
  hasRole,
  redirectWithDelay,
} from '@/app/lib/utils';
import { update } from '@/app/services/userService';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation d'un Profile
 * 
 * @interface ProfileProps
 */
interface ProfileProps {
    profile: User | null;
    users?: User[];
}

export default function Profile({ profile, users }: ProfileProps) {
    const { user } = useUser();
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const [role, setRole] = useState<string>(profile?.role || "");
    const [blacklisted, setBlacklisted] = useState<boolean>(profile?.blacklisted === 1 ? true : false);
    const [referrer, setReferrer] = useState<string>(profile?.referrer_id || "");

    if (!user || !hasRole(user?.role, ["Admin"])) {
        redirect("/");
    }

    const roles: {
        value: string;
        label: string;
    }[] = [
            {
                value: UserRole.Assistant,
                label: UserRole.Assistant,
            },
            {
                value: UserRole.HostFamily,
                label: "Famille d'acceuil",
            },
            {
                value: UserRole.Volunteer,
                label: "Bénévole",
            },
        ];

    const blacklists: {
        value: boolean;
        label: string;
    }[] = [
            {
                value: false,
                label: "Non",
            },
            {
                value: true,
                label: "Oui",
            },
        ];

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
            formData.get("phone") as string,
            formData.get("address") as string,
            formData.get("city") as string,
            role,
            blacklisted,
            referrer ?? null
        );
        if (!res.error) {
            redirectWithDelay(`/profile/${profile?.id}`, 1000);
        } else {
            toast.error(res.error);
        }
    };

    const filteredUsers = users?.filter(u => u.id !== profile?.id && !profile?.blacklisted).map(u => ({
        value: u.id,
        label: u.name + ' ' + u.lastName,
    }));

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--grey-800)">Compte de {profile?.name + " " + profile?.lastName}</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="id" label="Identifiant" value={profile?.id} hidden={true} />
                            <Input name="email" label="Email" value={profile?.email} readOnly={true} />
                            <Input name="name" label="Prénom" value={profile?.name} />
                            <Input name="lastname" label="Nom" value={profile?.lastName} />
                            <Input name="phone" label="Téléphone" value={profile?.phone} />
                            <Input name="address" label="Adresse" value={profile?.address} />
                            <Input name="city" label="Ville" value={profile?.city} />
                            {user?.role === "Admin" && 
                                <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="role">Rôle</label>
                                    <Select
                                        options={roles}
                                        className="select"
                                        classNamePrefix="select"
                                        name="role"
                                        id="role"
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        placeholder="Rôle"
                                        value={roles.find(r => r.value === role)}
                                        onChange={(e:any) => setRole(e?.value as string ?? "")}
                                    />
                                </div>
                            }
                            {user?.role === "Admin" && 
                                <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="blacklisted">Sur liste noire</label>
                                    <Select
                                        options={blacklists}
                                        className="select"
                                        classNamePrefix="select"
                                        name="blacklisted"
                                        id="blacklisted"
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        placeholder="Sur liste noire"
                                        value={blacklists.find(r => r.value === blacklisted)}
                                        onChange={(e:any) => { console.log(e?.value); setBlacklisted(e?.value ?? false)}}
                                    />
                                </div>
                            }
                            {user?.role === "Admin" && 
                                <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="referrer_id">Référent</label>
                                    <Select
                                        options={filteredUsers}
                                        className="select"
                                        classNamePrefix="select"
                                        name="referrer_id"
                                        id="referrer_id"
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        placeholder="Référent"
                                        value={filteredUsers?.find(r => r.value === referrer)}
                                        onChange={(e:any) => setReferrer(e?.value ?? "")}
                                    />
                                </div>}
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Modifier les informations" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}