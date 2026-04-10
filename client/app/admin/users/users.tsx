'use client'

import {
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import ModalMessage from '@/app/components/modals/modalMessage';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputImageTypes,
  UserRoles,
} from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import {
  getRoleLabel,
  hasRoles,
  sendResetPasswordEmail,
} from '@/app/core/lib/utils';
import { resetPassword } from '@/app/core/services/server/usersService';
import {
  Roles,
  YesNo,
} from '@/app/core/staticlists/staticLists';

const Select = dynamic(() => import("react-select"), { ssr: false });

/**
 * Interface pour les propriétés d'initialisation de la liste des utilisateurs
 * 
 * @interface UsersListProps
 */
interface UsersListProps {
    users?: User[];
}

export default function UsersList({ users }: UsersListProps) {
    const { user } = useUser();
    const [search, setSearch] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<User[] | undefined>(users);
    const [roles, setRoles] = useState<string>("");
    const [blacklisted, setBlacklisted] = useState<boolean>(false);
    const [checkedUser, setCheckedUser] = useState<string[]>([]);
    const [showModalMessage, setShowModalMessage] = useState<boolean>(false);

    if (!user || !hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin])) {
        redirect("/");
    }

    useEffect(() => {
        let filteredUsersList: User[] | undefined = users;
        if (search !== "") {
            filteredUsersList = users?.filter((u) => u.lastName.toLowerCase().indexOf(search.toLowerCase()) > -1 || u.name.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }
        if (roles !== "") {
            filteredUsersList = filteredUsersList?.filter((u) => u.roles.split("|").some(r => roles.split("|").includes(r)));
        }
            filteredUsersList = filteredUsersList?.filter((u) => u.blacklisted === blacklisted);
        setFilteredUsers(filteredUsersList);
    }, [search, roles, blacklisted]);

    const addOrRemoveUserToMessage = (checked: boolean, value: string) => {
        if (checked) {
            setCheckedUser([...checkedUser, value]);
        } else {
            setCheckedUser(checkedUser.filter((v) => v !== value));
        }
    }

    const resetUserPassword = async (e:React.MouseEvent<HTMLButtonElement>, email: string) => {
        e.preventDefault();
        const result = await resetPassword(email);
        if (result.error) {
            toast.error(`Une erreur est survenue lors de l'envoi de l'email pour la réinitialisation du mot de passe : ${result.error.message}`);
        } else {
            await sendResetPasswordEmail(email, result.token);
        }
    }


    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 xl:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
            {showModalMessage && createPortal(
                <ModalMessage
                    userIds={checkedUser}
                    closeModal={() => setShowModalMessage(false)}
                    onSuccess={() => {
                        setShowModalMessage(false);
                    }}
                />,
                document.body
            )}
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-1200 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="lg:flex lg:flex-row lg:gap-10 w-full lg:py-16 lg:px-7 border-b-0 lg:border-b-1 border-solid border-b-(--pink)">
                    <IconButton
                        icon={IconButtonImages.LeftArrow}
                        imgWidth={8}
                        imgHeight={6}
                        text="Retour"
                        url="/admin/profile"
                        svgFill="#902677"
                        className="text-sm text-(--text) gap-5 bg-(--white) rounded-[10px] py-8 px-16 w-189" />
                </div>
                <span className="text-lg text-(--primary) w-full">Liste des utilisateurs</span>
                <div className="flex flex w-full gap-10">
                    <Button text='Ajouter un utilisateur' url='/admin/profile/new' className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white)' />
                    <Input
                        name="search"
                        placeHolder="Rechercher un utilisateur"
                        imageType={InputImageTypes.Search}
                        className="lg:max-w-250 w-full"
                        value={search}
                        showLabel={false}
                        onChange={(e) => setSearch(e.target.value)} />
                        <Select
                            options={Roles}
                            className="select"
                            classNamePrefix="select"
                            name="roles"
                            id="roles"
                            isMulti={true}
                            isClearable={true}
                            isSearchable={false}
                            placeholder="Rôles"
                            onChange={(e:any) => setRoles(e?.map((e: { value: any; }) => e.value).join("|") ?? "")}
                            styles={{container: provided => ({
                                ...provided,
                                width: 460
                            })}}
                        />
                        <Select
                            options={YesNo}
                            className="select"
                            classNamePrefix="select"
                            name="blacklisted"
                            id="blacklisted"
                            isMulti={false}
                            isClearable={true}
                            isSearchable={false}
                            placeholder="Sur liste noire"
                            onChange={(e:any) => { setBlacklisted(e?.value ?? false)}}
                            styles={{container: provided => ({
                                ...provided,
                                width: 150
                            })}}
                        />
                        <Button
                            text='Envoyer un message'
                            className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-16 text-(--white)'
                            disabled={checkedUser.length === 0}
                            onClick={() => setShowModalMessage(true) }
                            />
                </div>
                <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                    <table className="w-full border-b border-solid border-(--pink)">
                        <thead>
                            <tr className='font-bold  bg-(--pink)'>
                                <td className="text-(--white) w-20 px-5"></td>
                                <td className="text-(--white) w-150 px-5">Nom Prénom</td>
                                <td className="text-(--white) border-l w-115 px-5">N° sécu</td>
                                <td className="text-(--white) border-l w-150 px-5">Email</td>
                                <td className="text-(--white) border-l w-100 px-5 text-center">Téléphone</td>
                                <td className="text-(--white) border-l flex-1 px-5">Adresse</td>
                                <td className="text-(--white) border-l w-50 px-5">CP</td>
                                <td className="text-(--white) border-l w-170 px-5">Ville</td>
                                <td className="text-(--white) border-l w-180 px-5">Roles</td>
                                <td className="text-(--white) border-l w-70 px-5">Capacité</td>
                                <td className="text-(--white) border-l w-70 px-5">Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredUsers?.map((u, idx) => (
                            <tr key={u.id} className={"w-full border-solid border-(--pink) border-b " + (u.blacklisted ? " italic" : "") + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                                <td className="px-5 w-20">
                                    <div className='flex justify-center items-center'>
                                        {user.id !== u.id && <input type="checkbox" name={"check-" + u.id} value={u.id} onChange={(e) => { addOrRemoveUserToMessage(e.currentTarget.checked, e.currentTarget.value)}} />}
                                        {u.blacklisted ? <IconButton url="#" icon={IconButtonImages.BlackListed} svgFill="#CE25A6" imgWidth={20} title="Sur la liste noire" /> : null}
                                    </div>
                                </td>
                                <td className={"w-150 px-5" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.lastName} {u.name}</td>
                                <td className={"border-l w-115 px-5" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.placeOfBirth}</td>
                                <td className={"border-l w-150 px-5 break-all" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.email}</td>
                                <td className={"border-l w-100 px-5 text-center" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.phone}</td>
                                <td className={"border-l flex-1 px-5" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.address}</td>
                                <td className={"border-l w-50 px-5" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.postalCode}</td>
                                <td className={"border-l w-170 px-5 break-all" + (u.blacklisted ? " text-black" : " text-(--text)")}>{u.city}</td>
                                <td className={"border-l w-180 px-5" + (u.blacklisted ? " text-black" : " text-(--text)")}>
                                    {u.roles.split("|").map((r:string, idx: number) => (<div key={u.id + idx}>{getRoleLabel(r as UserRoles.SuperAdmin |
                                            UserRoles.Admin |
                                            UserRoles.CommitteeMember |
                                            UserRoles.AdoptionReferent |
                                            UserRoles.HealthRegisterReferent |
                                            UserRoles.VetVoucherReferent |
                                            UserRoles.ICADReferent |
                                            UserRoles.HostFamily |
                                            UserRoles.Volunteer)}</div>))}
                                </td>
                                <td className={"border-l w-70 px-5 border-(--pink)" + (u.capacity === "Empty" ? " bg-[#00ff00]": " bg-[#ff0000]")}>&nbsp;</td>
                                <td className="border-(--pink) border-l w-70 px-5">
                                    {u &&
                                        <div className='flex justify-center gap-5 '>
                                            <IconButton url={`/admin/profile/${u.id}`} icon={IconButtonImages.Pen} svgFill="#CE25A6" imgWidth={20} title="Editer le profile" />
                                            <IconButton onClick={(e:React.MouseEvent<HTMLButtonElement>) => resetUserPassword(e, u.email) } icon={IconButtonImages.ChangePassword} svgFill="#CE25A6" imgWidth={20} title="Changer le mot de passe" />
                                        </div>
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </main>
    );
}
