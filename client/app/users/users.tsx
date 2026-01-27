'use client'

import {
  useEffect,
  useState,
} from 'react';

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Input from '../components/ui/Input';
import { useUser } from '../contexts/userContext';
import {
  Blacklists,
  HeaderMenuItems,
  IconButtonImages,
  InputImageTypes,
  Roles,
} from '../enums/enums';
import { User } from '../interfaces/user';
import { hasRole } from '../lib/utils';

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
    const [role, setRole] = useState<string>("");
    const [blacklisted, setBlacklisted] = useState<boolean>(false);

    if (!user || !hasRole(user?.role, ["Admin"])) {
        redirect("/");
    }

    useEffect(() => {
        let filteredUsersList: User[] | undefined = users;
        if (search !== "") {
            filteredUsersList = users?.filter((u) => u.lastName.toLowerCase().indexOf(search.toLowerCase()) > -1 || u.name.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }
        if (role !== "") {
            filteredUsersList = filteredUsersList?.filter((u) => u.role === role);
        }
        if (blacklisted) {
            filteredUsersList = filteredUsersList?.filter((u) => u.blacklisted === (blacklisted ? 1 : 0));
        }
        setFilteredUsers(filteredUsersList);
    }, [search, role, blacklisted]);

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 xl:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Profile} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-1200 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="lg:flex lg:flex-row lg:gap-10 w-full lg:py-16 lg:px-7 border-b-0 lg:border-b-1 border-solid border-b-(--pink)">
                    <IconButton
                        icon={IconButtonImages.LeftArrow}
                        imgWidth={8}
                        imgHeight={6}
                        text="Retour"
                        url="/profile"
                        svgFill="#902677"
                        className="text-sm text-(--text) gap-5 bg-(--white) rounded-[10px] py-8 px-16 w-189" />
                </div>
                <span className="text-lg text-(--primary) w-full">Liste des utilisateurs</span>
                <div className="flex flex w-full gap-10">
                    <Button text='Ajouter un utilisateur' url='/profile/new' className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
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
                            name="role"
                            id="role"
                            isMulti={false}
                            isClearable={true}
                            isSearchable={false}
                            placeholder="Rôle"
                            onChange={(e:any) => setRole(e?.value as string ?? "")}
                            styles={{container: provided => ({
                                ...provided,
                                width: 160
                            })}}
                        />
                        <Select
                            options={Blacklists}
                            className="select"
                            classNamePrefix="select"
                            name="blacklisted"
                            id="blacklisted"
                            isMulti={false}
                            isClearable={true}
                            isSearchable={false}
                            placeholder="Sur liste noire"
                            onChange={(e:any) => { console.log(e?.value); setBlacklisted(e?.value ?? false)}}
                            styles={{container: provided => ({
                                ...provided,
                                width: 150
                            })}}
                        />
                </div>
                <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                    <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                        <span className="text-(--white) w-20 px-5"></span>
                        <span className="text-(--white) w-150 px-5">Prénom Nom</span>
                        <span className="text-(--white) border-l w-200 px-5">Email</span>
                        <span className="text-(--white) border-l w-100 px-5 text-center">Téléphone</span>
                        <span className="text-(--white) border-l flex-1  px-5">Adresse</span>
                        <span className="text-(--white) border-l w-150 px-5">Ville</span>
                        <span className="text-(--white) border-l w-90 px-5">Role</span>
                        <span className="text-(--white) border-l w-70 px-5">Actions</span>
                    </div>
                    {filteredUsers?.map((user, idx) => (
                        <div key={user.id} className={"flex w-full border-solid border-(--pink) border-b " + (user.blacklisted ? " italic" : "") + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                            <span className="flex justify-center items-center px-5 w-20">
                                {user.blacklisted ? <IconButton url="#" icon={IconButtonImages.BlackListed} svgFill="#CE25A6" imgWidth={20} title="Sur la liste noire" /> : null}
                            </span>
                            <span className="text-(--text) w-150 px-5">{user.name} {user.lastName}</span>
                            <span className="text-(--text) border-l w-200 px-5">{user.email}</span>
                            <span className="text-(--text) border-l w-100 px-5 text-center">{user.phone}</span>
                            <span className="text-(--text) border-l flex-1 px-5">{user.address}</span>
                            <span className="text-(--text) border-l w-150 px-5">{user.city}</span>
                            <span className="text-(--text) border-l w-90 px-5">{user.role}</span>
                            <span className="flex justify-center gap-5 border-(--pink) border-l w-70 px-5">
                                <IconButton url={`/profile/${user.id}`} icon={IconButtonImages.Pen} svgFill="#CE25A6" imgWidth={20} title="Editer le profile" />
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
