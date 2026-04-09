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
import Link from '@/app/components/ui/Link';
import { useUser } from '@/app/core/contexts/userContext';
import {
  HeaderMenuItems,
  UserRoles,
} from '@/app/core/enums/enums';
import { Cat } from '@/app/core/interfaces/cat';
import {
  formatDDMMY,
  hasRoles,
} from '@/app/core/lib/utils';
import {
  getAdoptedCatNotFullyCompletedList,
  getCatBoosterVaccinationNoLaterThanOneMonthList,
  getFACatNotFullyCompletedList,
  getHasPreVisitWithoutDateList,
} from '@/app/core/services/client/catsService';

import { VetVoucher } from '../core/interfaces/vetVoucher';
import { getVetVoucherslist } from '../core/services/client/vetVouchersService';

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
  //const [unreadMessages, setUnreadMessage] = useState<Message[]>([]);
  const [vetVoucherList, setVetVoucherList] = useState<VetVoucher[]>([]);
  const [unCompletedFACatList, setUnCompletedFACatList] = useState<{ slug: string, name: string, numId: string, hostfamily_id: string, hostfamily_name: string, fields: string[]}[]>([]);
  const [unCompletedAdoptedCatList, setUnCompletedAdoptedCatList] = useState<{ slug: string, name: string, numId: string, fields: string[]}[]>([]);
  const [vaccineBoosterList, setVaccineBoosterList] = useState<Cat[]>([]);
  const [preVisitList, setPreVisitList] = useState<[]>([]);
  let isHostFamily: boolean = false;

  useEffect(() => {
    if (token) {
      isHostFamily = (user && hasRoles(user.roles, [UserRoles.HostFamily])) as boolean;
      //(async () => {
      //    const res = await unreadMessageListByUserId(token, user?.id as string);
      //    setUnreadMessage(res);
      //})();
      if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily])) {
        (async () => {
            const res = await getFACatNotFullyCompletedList(token, isHostFamily ? user.id : null);
            setUnCompletedFACatList(res);
        })();
      }
      if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.CommitteeMember])) {
        (async () => {
            const res = await getAdoptedCatNotFullyCompletedList(token);
            setUnCompletedAdoptedCatList(res);
        })();
      }
      if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.VetVoucherReferent])) {
        (async () => {
            const res = await getVetVoucherslist(token);
            setVetVoucherList(res);
        })();
      }
      (async () => {
        const res = await getHasPreVisitWithoutDateList(token);
        setPreVisitList(res);
      })();
      if (user && hasRoles(user.roles, [UserRoles.Admin, UserRoles.HostFamily])) {
        (async () => {
            const res = await getCatBoosterVaccinationNoLaterThanOneMonthList(token, isHostFamily ? user.id : null);
            setVaccineBoosterList(res);
        })();
      }
    }
  }, [user]);

  return (
    <main className="flex flex-col gap-51 md:gap-20 w-full items-center md:pt-20 md:px-140">
      <Header activeMenu={HeaderMenuItems.Alerts} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-0 w-full xl:w-1115">
        <div className="flex flex-col gap-8 w-full xl:w-1115 lg:w-800 items-center text-center">
          <span className="text-[32px] text-(--primary) w-full">Mes alertes</span>
        </div>
        <div className='flex flex-col gap-10'>
          {/* <div className='flex flex-col'>
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
            </div> */}
            {user && hasRoles(user?.roles, [UserRoles.Admin, UserRoles.VetVoucherReferent]) && <div className='flex flex-col'>
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
          {user && hasRoles(user?.roles, [UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Fiches chats en FA incomplètes :</span>
            <table className="w-full border-l border-r border-t border-solid border-(--pink)">
                <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                  <tr>
                    <th className="text-(--white) w-100 px-5">Nom</th>
                    <th className="text-(--white) border-l w-170 px-5">N° identification</th>
                    <th className="text-(--white) border-l w-150 px-5">Famille d'accueil</th>
                    <th className="text-(--white) border-l px-5">Champs manquants</th>
                  </tr>
                </thead>
                <tbody>
                  {unCompletedFACatList.length > 0 ? unCompletedFACatList.map((cat: { slug: string, name: string, numId: string, hostfamily_id: string, hostfamily_name: string, fields: string[]}, idx: number) => (
                    <tr key={cat.slug} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                      <td className="w-100 px-5 text-(--text)" key={cat.slug}><Link url={"/admin/cat/" + cat.slug} text={cat.name} /></td>
                      <td className="border-l w-170 px-5 text-(--text)">{cat.numId}</td>
                      <td className="border-l w-150 px-5 text-(--text)">{user.id !== cat.hostfamily_id ? cat.hostfamily_name : ""}</td>
                      <td className="border-l px-5 text-(--text)">{cat.fields.join(', ')}</td>
                    </tr>
                  )) : <tr><td className='text-center border-b border-solid border-(--pink) text-(--text)' colSpan={4}>Pas de fiche de chats en FA incompléte</td></tr>}
                </tbody>
              </table>
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.Admin, UserRoles.CommitteeMember]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Fiches chats adoptés incomplètes :</span>
            <table className="w-full border-l border-r border-t border-solid border-(--pink)">
                <thead className="border-b border-solid border-(--pink) bg-(--pink) font-bold">
                  <tr>
                    <td className="text-(--white) w-100 px-5">Nom</td>
                    <td className="text-(--white) border-l w-170 px-5">N° identification</td>
                    <td className="text-(--white) border-l px-5">Champs manquants</td>
                  </tr>
                </thead>
                <tbody>
                  {unCompletedAdoptedCatList.length > 0 ? unCompletedAdoptedCatList.map((cat: { slug: string, name: string, numId: string, fields: string[]}, idx: number) => (
                    <tr key={cat.slug} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                      <td className="w-100 px-5 text-(--text)"><Link url={"/admin/cat/" + cat.slug} text={cat.name} /></td>
                      <td className="border-l w-170 px-5 text-(--text)">{cat.numId}</td>
                      <td className="border-l px-5 text-(--text)">{cat.fields.join(', ')}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className='text-center border-b border-solid border-(--pink) text-(--text)'>Pas de fiche de chats adoptés incompléte</td></tr>}
                </tbody>
              </table>
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.Admin, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Rappels :</span>
            <table className="w-full border-l border-r border-t border-solid border-(--pink)">
                <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                  <tr>
                    <td className="text-(--white) w-100 px-5">Concerne</td>
                    <td className="text-(--white) border-l flex-1 px-5">Objet (Rappel vaccin / stérilisation)</td>
                  </tr>
                </thead>
                <tbody>
                  {vaccineBoosterList.length > 0 ? vaccineBoosterList.map((vaccineBooster: Cat, idx: number) => (
                    <tr key={vaccineBooster.id} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                      <td className="w-100 px-5 text-(--text)"><Link url={"/admin/cat/" + vaccineBooster.slug}  text={vaccineBooster.name} /></td>
                      <td></td>
                      {/* <span className="border-l w-100 px-5 text-(--text)">{voucher.cat.numId} / {voucher.cat.name}</span>
                      <span className="border-l flex-1 px-5 text-(--text)">{voucher.clinic}</span>
                      <span className="border-l w-250 px-5 text-(--text)">{voucher.object}</span> */}
                    </tr>
                  )) : <tr>
                      <td colSpan={2} className='text-center border-b border-solid border-(--pink) text-(--text)'>Pas de rappel de vaccin à effectuer / en retard</td>
                    </tr>}
                </tbody>
              </table>
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Pré visites sans date :</span>
            <table className="w-full border-l border-r border-t border-solid border-(--pink)">
                <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                  <tr>
                    <td className="text-(--white) w-100 px-5">Nom</td>
                    <td className="text-(--white) border-l px-5">N° identification</td>
                    <td className="text-(--white) border-l px-5">Nom prénom</td>
                    <td className="text-(--white) border-l px-5">Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {/* {preVisitList.length > 0 ? preVisitList.map((preVisit: any, idx: number) => (
                    <tr key={preVisit.id} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") }>
                        <td className="w-100 px-5 text-(--text)"><Link url={"/admin/cat/" + preVisit.slug} text={preVisit.name} /></td>
                        <td className="border-l px-5 text-(--text)">{preVisit.numId}</td>
                        <td className="border-l px-5 text-(--text)">{preVisit.applicant}</td>
                        <td className="flex border-l px-5 text-(--text) gap-5">
                          <IconButton
                              icon={IconButtonImages.Approved}
                              svgStroke='#902677'
                              // onClick={ (e:React.MouseEvent<HTMLButtonElement>) => approved(e, voucher)}
                              title='Valider la visite' />
                          <IconButton
                              icon={IconButtonImages.Trash}
                              imgWidth={24}
                              imgHeight={24}
                              svgFill='#902677'
                              // onClick={ (e:React.MouseEvent<HTMLButtonElement>) => removed(e, voucher)}
                              title='Supprimer la demande' />
                        </td>
                      </tr>
                  )) :*/}
                   <tr> 
                      <td colSpan={4} className='text-center border-b border-solid border-(--pink) text-(--text)'>À venir</td>
                    </tr>
              </tbody>
              </table>
          </div>}
        </div>
      </div>
      <Footer />
    </main>
  );
}
