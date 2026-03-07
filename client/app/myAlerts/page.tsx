'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';

import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import {
  HeaderMenuItems,
  UserRole,
} from '@/app/enums/enums';

import Link from '../components/ui/Link';
import { useUser } from '../contexts/userContext';
import { Message } from '../interfaces/messaging';
import { VetVoucher } from '../interfaces/vetVoucher';
import {
  formatDDMMY,
  formatHHMMSS,
  hasRoles,
  truncate,
} from '../lib/utils';
import {
  getCatNotFullyCompletedList,
  getHasPreVisitWithoutDateList,
} from '../services/client/catsService';
import { unreadMessageListByUserId } from '../services/client/messagingService';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//  title: "Le Chat'Home de Luna - MyAlerts",
//  description: "Affichage de la page de mes alertes"
//};

/**
 * Affiche la page mes mes alertes
 * 
 * @function MyAlerts
 */
export default function MyAlerts() {
  const { user } = useUser();
  const cookies: Cookies = useCookies();
  const token: string = cookies.get("token") as string;
  const [unreadMessages, setUnreadMessage] = useState<Message[]>([]);
  const [vetVoucherList, setVetVoucherList] = useState<VetVoucher[]>([]);
  const [unCompletedCatList, setUnCompletedCatList] = useState<{ slug: string, name: string, numId: string, fields: string[]}[]>([]);
  const [vaccineBoosterList, setVaccineBoosterList] = useState<[]>([]);
  const [preVisitList, setPreVisitList] = useState<[]>([]);

  useEffect(() => {
    (async () => {
        const res = await unreadMessageListByUserId(token, user?.id as string);
        setUnreadMessage(res);
    })();
    (async () => {
        const res = await getCatNotFullyCompletedList(token);
        setUnCompletedCatList(res);
    })();
    (async () => {
      const res = await getHasPreVisitWithoutDateList(token);
      setPreVisitList(res);
    })();
  }, [user]);

  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.Alerts} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) w-full">Mes alertes</span>
        </div>
        <div className='flex flex-col gap-10'>
          <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Nouveaux messages :</span>
            <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                    <span className="text-(--white) w-160 px-5">Date</span>
                    <span className="text-(--white) border-l w-150 px-5">Émetteur</span>
                    <span className="text-(--white) border-l w-200 px-5">Groupe</span>
                    <span className="text-(--white) border-l flex-1 px-5">Message</span>
                </div>
                {unreadMessages.length > 0 ? unreadMessages.map((message: Message, idx: number) => (
                  <div key={message.id} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <span className="w-160 px-5 text-(--text)">{formatDDMMY(new Date(message.sent_at))} {formatHHMMSS(new Date(message.sent_at))}</span>
                        <span className="border-l w-150 px-5 text-(--text)">{message.nickname}</span>
                        <span className="border-l w-200 px-5 text-(--text)">{message.groupName}</span>
                        <span className="border-l flex-1 px-5 text-(--text)">{truncate(message.content, 50)}</span>
                    </div>
                )) : <div className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)'>Vous n'avez pas de messages</div>}
              </div>
            </div>
          {user && hasRoles(user?.roles, [UserRole.Admin, UserRole.Assistant]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Bons vétérinaires :</span>
            <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                    <span className="text-(--white) w-100 px-5">Date</span>
                    <span className="text-(--white) border-l w-150 px-5">Demandeur</span>
                    <span className="text-(--white) border-l w-100 px-5">Pour</span>
                    <span className="text-(--white) border-l flex-1 px-5">Clinique</span>
                    <span className="text-(--white) border-l w-250 px-5">Objet</span>
                </div>
                {vetVoucherList.length > 0 ? vetVoucherList.map((voucher: VetVoucher, idx: number) => (
                  <div key={voucher.id} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <span className="w-100 px-5 text-(--text)">{formatDDMMY(new Date(voucher.date))}</span>
                        <span className="border-l w-150 px-5 text-(--text)">{voucher.user_name}</span>
                        <span className="border-l w-100 px-5 text-(--text)">{voucher.cat.numId ?? voucher.cat.name}</span>
                        <span className="border-l flex-1 px-5 text-(--text)">{voucher.clinic}</span>
                        <span className="border-l w-250 px-5 text-(--text)">{voucher.object}</span>
                    </div>
                )) : <div className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)'>Pas de bon vétérinaire en attente</div>}
              </div>
          </div>}
          {user && hasRoles(user?.roles, [UserRole.Admin, UserRole.Assistant]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Fiches chats en FA incomplètes :</span>
            <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                    <span className="text-(--white) w-100 px-5">Nom</span>
                    <span className="text-(--white) border-l w-150 px-5">N° identification</span>
                    <span className="text-(--white) border-l flex-1 px-5">Champs manquants</span>
                </div>
                {unCompletedCatList.length > 0 ? unCompletedCatList.map((cat: { slug: string, name: string, numId: string, fields: string[]}, idx: number) => (
                  <div key={cat.slug} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <Link url={"/admin/cat/" + cat.slug} className="w-100 px-5 text-(--text)" text={cat.name} />
                        <span className="border-l w-150 px-5 text-(--text)">{cat.numId}</span>
                        <span className="border-l flex-1 px-5 text-(--text)">{cat.fields.join(', ')}</span>
                    </div>
                )) : <div className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)'>Pas de fiche de chat en FA incompléte</div>}
              </div>
          </div>}
          {user && hasRoles(user?.roles, [UserRole.Admin, UserRole.HostFamily]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Rappels :</span>
            <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                    <span className="text-(--white) w-100 px-5">Concerne</span>
                    <span className="text-(--white) border-l flex-1 px-5">Objet (Rappel vaccin / stérilisation)</span>
                    <span className="text-(--white) border-l w-250 px-5"></span>
                </div>
                {vaccineBoosterList.length > 0 ? vaccineBoosterList.map((vaccineBooster: any, idx: number) => (
                  <div key={vaccineBooster.id} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <span className="w-100 px-5 text-(--text)">le chat</span>
                        {/* <span className="border-l w-100 px-5 text-(--text)">{voucher.cat.numId} / {voucher.cat.name}</span>
                        <span className="border-l flex-1 px-5 text-(--text)">{voucher.clinic}</span>
                        <span className="border-l w-250 px-5 text-(--text)">{voucher.object}</span> */}
                    </div>
                )) : <div className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)'>Pas de rappel de vaccin à effectuer / en retard</div>}
              </div>
          </div>}
          {user && hasRoles(user?.roles, [UserRole.Admin, UserRole.Assistant]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Pré visites sans date :</span>
            <div className="flex flex-col w-full border-l border-r border-t border-solid border-(--pink)">
                <div className="flex w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                    <span className="text-(--white) w-100 px-5">Nom</span>
                </div>
                {preVisitList.length > 0 ? preVisitList.map((preVisit: any, idx: number) => (
                  <div key={preVisit.id} className={"flex w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <Link url={"/admin/cat/" + preVisit.slug} className="w-100 px-5 text-(--text)" text={preVisit.name} />
                    </div>
                )) : <div className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)'>Pas de date de pré visite</div>}
              </div>
          </div>}
        </div>
      </div>
      <Footer />
    </main>
  );
}
