'use client';

import { useState } from 'react';

import { useCookies } from 'next-client-cookies';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Input from '@/app/components/ui/Input';
import { useUser } from '@/app/contexts/userContext';
import {
  HeaderMenuItems,
  InputImageTypes,
  InputTypes,
} from '@/app/enums/enums';
import {
  formatDDMMY,
  formatHHMMSS,
  getInitials,
} from '@/app/lib/utils';
import { messengingService } from '@/app/services/client/messengingService';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//    title: "Le Chat'Home de Luna - Messagerie",
//    description: "Messagerie - Le Chat'Home de Luna"
//};

/**
 * Affiche la page Messaging
 * 
 * @function MessagingPage
 */
export default function MessagingPage() {
    const { user } = useUser();
    const cookieStore = useCookies();
    const token: string | undefined = cookieStore.get("token");
    const [search, setSearch] = useState<string>("");
    const service = messengingService(token, user?.id ?? "");

  return (
        <main className="flex flex-col gap-20 w-full h-884 items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.Messaging} />
            <div className="flex gap-20 md:gap-30 p-30 md:p-0 w-full xl:w-1115 flex-1">
                <div className="flex flex-col border border-1 border-(--primary) rounded-[10px] w-321 p-16 gap-10">
                    <Input
                        name="search"
                        placeHolder="Rechercher un utilisateur"
                        type={InputTypes.Text}
                        imageType={InputImageTypes.Search}
                        className="w-full max-h-40"
                        value={search}
                        showLabel={false}
                        onChange={(e) => setSearch(e.target.value)} />
                    <hr className='border-(--primary)' />
                    <div className='flex flex-col flex-1 gap-2 overflow-y-auto'>
                        {service.messenging.map((thread) => (
                            <div key={thread.id} className='flex h-64 items-center cursor-pointer'>
                                <div className='flex flex-1 gap-8'>
                                    <div className="flex justify-center items-center rounded-[50%] w-48 h-48 bg-(--text) text-(--white)">{getInitials(thread.nickname)}</div>
                                    <div className="flex flex-col">
                                        <div className="text-(--primary)">{thread.nickname}</div>
                                        <div className={"text-sm text-(--pink)" + (!thread.is_readed ? " font-bold" : "")}>{thread.content.content}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <span className='text-sm text-(--primary)'>{formatDDMMY(new Date(thread.sent_at))}</span>
                                    <span className='text-xs text-(--primary)'>{formatHHMMSS(new Date(thread.sent_at))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col flex-1 border border-1 border-(--primary) rounded-[10px] gap-6 bg-[url(/images/discussion.png)] bg-no-repeat bg-center bg-blend-lighten bg-[#ffffffcc]">
                    <div className="flex h-75 p-16">
                        <div className="flex gap-8">
                            <div className="flex justify-center items-center rounded-[50%] w-48 h-48 bg-(--text) text-(--white)">SB</div>
                            <div className="text-(--primary)">Paul Rudd</div>
                        </div>
                    </div>
                    <hr className="border-(--primary)" />
                    <div className="flex">

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
