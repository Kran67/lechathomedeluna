'use client'

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

import PostalCodeSelect from '@/app/components/data/PostalCodeSelect';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import ModalMessage from '@/app/components/modals/modalMessage';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import Link from '@/app/components/ui/Link';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
  UserRoles,
} from '@/app/core/enums/enums';
import { City } from '@/app/core/interfaces/postalCode';
import { User } from '@/app/core/interfaces/user';
import {
  formatYMMDD,
  hasRoles,
  redirectWithDelay,
  sendResetPasswordEmail,
} from '@/app/core/lib/utils';
import {
  getAll,
  getById,
  resetPassword,
  update,
} from '@/app/core/services/server/usersService';
import {
  Capacities,
  ColourOption,
} from '@/app/core/staticlists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function Profile() {
    const { user, clear } = useUser();
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const [profile, setProfile] = useState<User | null>(null);
    const [postalCode, setPostalCode] = useState<string>(user?.postalCode || "");
    const [cityId, setCityId] = useState<string>(user?.cityId || "");
    const [capacity, setCapacity] = useState<string>(user?.capacity || "Empty");
    const [birthDate, setBirthDate] = useState<string | null>(user?.birthDate ?? null);
    const [referrer, setReferrer] = useState<User | null>(null);
    const [showModalMessage, setShowModalMessage] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    if (!user) {
        redirect("/");
    }

    useEffect(() => {
        (async () => {
            const res = await getById(token, user!.id);
            if (!res.error) {
                setProfile(res);
            } else {
                throw new Error(res.error);
            }
        })();
        (async () => {
            const res = await getAll(token);
            if (!res.error) {
                setReferrer(res.find((u: User) => u.id === user?.referrer_id));
            } else {
                throw new Error(res.error);
            }
        })();
    }, [token, user]);

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const birthDate: string | null = formData.get("birthDate") as string !== '' ? formData.get("birthDate") as string : null;

        const res = await update(
            token,
            profile!.id,
            formData.get("email") as string,
            formData.get("name") as string,
            formData.get("lastname") as string,
            formData.get("placeOfBirth") as string,
            formData.get("phone") as string,
            formData.get("address") as string,
            cityId,
            profile!.roles,
            profile!.blacklisted,
            profile!.referrer_id ?? null,
            capacity,
            birthDate
        );
        if (!res.error) {
            redirectWithDelay("/admin/profile", 1000);
        } else {
            setIsSubmitted(false);
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
        setIsSubmitted(true);
        const result = await resetPassword(profile!.email);
        if (result.error) {
            setIsSubmitted(false);
            toast.error(`Une erreur est survenue lors de l'envoi de l'email pour la réinitialisation du mot de passe : ${result.error.message}`);
        } else {
            setIsSubmitted(false);
            await sendResetPasswordEmail(profile!.email, result.token);
        }
    }

    const dumpDb = async (e: React.FormEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
            const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dump`, {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
            });

            return await res.json();
        } catch (err) {
            console.error("Erreur lors de la récupération des données' :", err);
            return null;
        }
    }

    const send = async (e: React.FormEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
            const res: Response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sql`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({ query: query })
            });

            return await res.json();
        } catch (err) {
            console.error("Erreur lors de l''execution de la requête' :", err);
            return null;
        }
    }
    
    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
            {showModalMessage && createPortal(
                <ModalMessage
                    userIds={[profile!.referrer_id as string]}
                    closeModal={() => setShowModalMessage(false)}
                    onSuccess={() => {
                        setShowModalMessage(false);
                    }}
                />,
                document.body
            )}
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Information du compte">
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--primary)">Mon compte ({profile?.lastName + " " + profile?.name})</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="id" label="Identifiant" value={profile?.id} hidden={true} />
                            <Input name="email" label="Email" value={profile?.email} readOnly={!hasRoles(profile?.roles as string, [UserRoles.SuperAdmin])} maxLength={100} />
                            <Input name="name" label="Prénom" value={profile?.name} maxLength={50} />
                            <Input name="lastname" label="Nom" value={profile?.lastName} maxLength={50} />
                            <Input name="birthDate" label="Date de naissance" type={InputTypes.Date} value={birthDate ? formatYMMDD(new Date(birthDate)) : undefined}
                                onChange={(e) => setBirthDate(e.currentTarget.value)} />
                            <Input name="placeOfBirth" label="Lieu de naissance" value={profile?.placeOfBirth} required={true} maxLength={13} />
                            <Input name="phone" label="Téléphone" value={profile?.phone} maxLength={10} />
                            <Input name="address" label="Adresse" value={profile?.address} maxLength={255} />
                            <PostalCodeSelect
                                defaultCode={postalCode}
                                defaultCityId={cityId}
                                onSelect={(code: string, city: City) => {
                                    setCityId(city.id);
                                    setPostalCode(code);
                                }}
                            />                                
                            {profile && hasRoles(profile.roles, [UserRoles.HostFamily]) && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="capacity">Capacité</label>
                                <Select
                                    options={Capacities}
                                    className="select"
                                    classNamePrefix="select"
                                    name="capacity"
                                    id="capacity"
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Capacité"
                                    styles={{
                                        option: (base, { data }) => ({ ...base, color: (data as ColourOption).color, backgroundColor: (data as ColourOption).color }),
                                        control: (base, state) => {
                                            const selectedOption = state.getValue()[0] as ColourOption | undefined;
                                            return {
                                                ...base,
                                                backgroundColor: selectedOption ? selectedOption.color : base.backgroundColor,
                                                color: `${selectedOption ? selectedOption.color : base.color} !important`,
                                            };
                                        },
                                        singleValue: (base, state) => {
                                            const selectedOption = state.getValue()[0] as ColourOption | undefined;
                                            return {
                                                ...base,
                                                color: `${selectedOption ? selectedOption.color : base.color} !important`,
                                            };
                                        },
                                    }}
                                    value={Capacities?.find(c => c.value === capacity)}
                                    onChange={(e:any) => setCapacity(e?.value ?? "")}
                                />
                            </div>}
                            {profile?.referrer_id && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="referrer_id">Référent</label>
                                <div className='flex text-sm text-(--text) '>
                                    {referrer?.name} {referrer?.lastName} (<IconButton
                                        icon={IconButtonImages.Message}
                                        onClick={(e:React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault();
                                            setShowModalMessage(true)
                                        }}
                                        text='Lui envoyer un message'
                                        svgFill='#902677'
                                    />)
                                </div>
                            </div>}
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button
                                text="Modifier les informations"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
                                disabled={isSubmitted}
                            />
                            <Button
                                text="Réinitialiser mon mot de passe"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
                                onClick={(e: React.FormEvent<HTMLAnchorElement>) => resetMyPassword(e) }
                                disabled={isSubmitted}
                            />
                        </div>
                        {hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin]) && <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Link
                                text="Administrer les utilisateurs"
                                url="/admin/users"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)' />
                        </div>}
                        {hasRoles(user?.roles, [UserRoles.SuperAdmin]) && <div className="flex justify-between items-center bg-(--white) border order-1 border-(--primary-dark) border-solid rounded-[4px] px-10 gap-10">
                                <textarea className='text-sm text-(--text) w-full outline-0 h-100' onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => setQuery(e.currentTarget.value) } />
                                <Button
                                    text="Send"
                                    className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
                                    onClick={(e: React.FormEvent<HTMLAnchorElement>) => send(e) }
                            />
                        </div>}
                        {hasRoles(user?.roles, [UserRoles.SuperAdmin]) && <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button
                                text="Dump Db"
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
                                onClick={(e: React.FormEvent<HTMLAnchorElement>) => dumpDb(e) }
                            />
                        </div>}
                    </form>
                    <Link 
                        text="Se déconnecter"
                        url="/"
                        onClick={() => handleLogout()}
                        className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) self-center' />
                </div>
            </div>
            <Footer />
        </main>
    );
}