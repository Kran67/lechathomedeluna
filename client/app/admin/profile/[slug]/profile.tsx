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
import {
  redirect,
  useRouter,
} from 'next/navigation';
import { toast } from 'react-toastify';

import PostalCodeSelect from '@/app/components/data/PostalCodeSelect';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
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
  create,
  resetPassword,
  update,
} from '@/app/core/services/server/usersService';
import {
  Capacities,
  ColourOption,
  Roles,
  YesNo,
} from '@/app/core/staticlists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation d'un Profile
 * 
 * @interface ProfileProps
 */
interface ProfileProps {
    isNew: boolean;
    profile: User | null;
    users?: User[];
}

export default function Profile({ profile, users, isNew }: ProfileProps) {
    const { user } = useUser();
    const cookies: Cookies = useCookies();
    const token: string = cookies.get("token") as string;
    const [postalCode, setPostalCode] = useState<string>(profile?.postalCode || "");
    const [cityId, setCityId] = useState<string>(profile?.cityId || "");
    const [roles, setRoles] = useState<string>(profile?.roles || "");
    const [blacklisted, setBlacklisted] = useState<boolean>(profile?.blacklisted ?? false);
    const [referrer, setReferrer] = useState<string>(profile?.referrer_id || "");
    const [capacity, setCapacity] = useState<string>(profile?.capacity || "Empty");
    const router = useRouter();
    const [birthDate, setBirthDate] = useState<string | null>(profile?.birthDate ?? null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    if (!user || !hasRoles(user?.roles, [UserRoles.Admin])) {
        redirect("/");
    }

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const email: string = formData.get("email") as string;
        const birthDate: string | null = formData.get("birthDate") as string !== '' ? formData.get("birthDate") as string : null;
        let res;

        if (isNew) {
            res = await create(
                token,
                email,
                formData.get("name") as string,
                formData.get("lastname") as string,
                formData.get("social_number") as string,
                formData.get("phone") as string,
                formData.get("address") as string,
                cityId,
                roles,
                blacklisted,
                referrer !== "" ? referrer : null,
                capacity,
                birthDate
            );
        } else {
            res = await update(
                token,
                profile!.id,
                formData.get("name") as string,
                formData.get("lastname") as string,
                formData.get("social_number") as string,
                formData.get("phone") as string,
                formData.get("address") as string,
                cityId,
                roles,
                blacklisted,
                referrer !== "" ? referrer : null,
                capacity,
                birthDate
            );
        }
        if (!res.error) {
            redirectWithDelay(`${hasRoles(user.roles, ["Admin"]) ? "/admin" : ""}/profile/${res.id}`, 1000);
            if (isNew) {
                const result = await resetPassword(email);
                if (result.error) {
                    toast.error(`Une erreur est survenue lors de l'envoi de l'email pour la réinitialisation du mot de passe : ${result.error.message}`);
                } else {
                    await sendResetPasswordEmail(email, result.token);
                }
            }
        } else {
            setIsSubmitted(false);
            toast.error(res.error);
        }
    };

    const filteredUsers = users?.filter(u => u.id !== profile?.id || !profile?.blacklisted).map(u => ({
        value: u.id,
        label: u.lastName + ' ' + u.name,
    }));

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
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
                            <h5 className="text-(--primary)">{ isNew ? "Création d'un utilisateur" : "Compte de " +  profile?.lastName + " " + profile?.name}</h5>
                        </div>
                        <div className="flex flex-col gap-12 md:gap-24">
                            <Input name="id" label="Identifiant" value={profile?.id} hidden={true} />
                            <Input name="email" label="Email" value={profile?.email} readOnly={!isNew} required={isNew} maxLength={100} />
                            <Input name="name" label="Prénom" value={profile?.name} required={isNew} maxLength={50} />
                            <Input name="lastname" label="Nom" value={profile?.lastName} required={isNew} maxLength={50} />
                            <Input name="birthDate" label="Date de naissance" type={InputTypes.Date} value={birthDate ? formatYMMDD(new Date(birthDate)) : undefined}
                                onChange={(e) => setBirthDate(e.currentTarget.value)} />
                            <Input name="social_number" label="N° sécurité sociale" value={profile?.social_number} required={true} maxLength={13} pattern={"[0-9]{13}"} />
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
                            <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                <label className="text-sm text-(--text) font-medium " htmlFor="roles">Rôles {isNew ? "*": ""}</label>
                                <Select
                                    options={Roles}
                                    className="select"
                                    classNamePrefix="select"
                                    name="roles"
                                    id="roles"
                                    isMulti={true}
                                    isClearable={false}
                                    isSearchable={false}
                                    placeholder="Rôles"
                                    value={roles.split("|").map(r => { return Roles.find(rs => rs.value === r) })}
                                    onChange={(e:any) => setRoles(e?.map((e: { value: any; }) => e.value).join("|") ?? "")}
                                    required={isNew}
                                />
                            </div>
                            {!isNew && 
                                <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="blacklisted">Sur liste noire</label>
                                    <Select
                                        options={YesNo}
                                        className="select"
                                        classNamePrefix="select"
                                        name="blacklisted"
                                        id="blacklisted"
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        placeholder="Sur liste noire"
                                        value={YesNo.find(r => r.value === blacklisted)}
                                        onChange={(e:any) => { setBlacklisted(e?.value ?? false)}}
                                    />
                                </div>
                            }
                            
                            {profile && hasRoles(profile.roles, [UserRoles.HostFamily]) && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
                                    <label className="text-sm text-(--text) font-medium " htmlFor="capacity">Capacité</label>
                                    {user.id === profile?.id ? <Select
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
                                    /> : <div
                                        className={'select flex flex-col flex-1 gap-7 justify-start min-h-40' + 
                                        (capacity === "Empty" ? " bg-[#008000]" : capacity === "PartiallyFull" ? " bg-[#FFFF00]" : " bg-[#FF0000]")}>
                                    </div>}
                                </div>}
                                {profile && hasRoles(profile.roles, [UserRoles.HostFamily]) && <div className="select flex flex-col flex-1 gap-7 justify-start h-77">
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
                            <Button 
                                text={ isNew ? "Créer l'utilisateur" : "Modifier les informations"}
                                className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white)'
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