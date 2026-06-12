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
  const [showVetVoucherAlertes, setShowVetVoucherAlertes] = useState<boolean>(false);
  const [showIncompletesCatsInFAAlertes, setShowIncompletesCatsInFAAlertes] = useState<boolean>(false);
  const [showIncompletesAdoptedCatsAlertes, setShowIncompletesAdoptedCatsAlertes] = useState<boolean>(false);
  const [showReminderAlertes, setShowReminderAlertes] = useState<boolean>(false);
  let isHostFamily: boolean = false;

  useEffect(() => {
    if (token) {
      isHostFamily = (user && hasRoles(user.roles, [UserRoles.HostFamily])) as boolean;
      //(async () => {
      //    const res = await unreadMessageListByUserId(token, user?.id as string);
      //    setUnreadMessage(res);
      //})();
      if (user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily])) {
        (async () => {
            const res = await getFACatNotFullyCompletedList(token, isHostFamily ? user.id : null);
            setUnCompletedFACatList(res);
        })();
      }
      if (user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember])) {
        (async () => {
            const res = await getAdoptedCatNotFullyCompletedList(token);
            setUnCompletedAdoptedCatList(res);
        })();
      }
      if (user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent])) {
        (async () => {
            const res = await getVetVoucherslist(token);
            setVetVoucherList(res);
        })();
      }
      (async () => {
        const res = await getHasPreVisitWithoutDateList(token);
        setPreVisitList(res);
      })();
      if (user && hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.HostFamily])) {
        (async () => {
            const res = await getCatBoosterVaccinationNoLaterThanOneMonthList(token, isHostFamily ? user.id : null);
            setVaccineBoosterList(res);
        })();
      }
    }
  }, [user]);

  return (
    <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
      <Header activeMenu={HeaderMenuItems.Alerts} />
      <div className="flex flex-col gap-51 md:gap-20 px-16 md:p-10 w-full xl:w-1115">
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
          {user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.VetVoucherReferent]) && <div className='flex flex-col'>
            <div className='flex flex-row gap-10 items-center cursor-pointer'>
              <span className={'text-lg text-(--primary)' + (showVetVoucherAlertes ? " rotate-90" : "")}>&gt;</span>
              <span className='text-lg text-(--primary)' onClick={ () => setShowVetVoucherAlertes(!showVetVoucherAlertes)}>Bons vétérinaires :</span>
              {vetVoucherList.length > 0 && <span className="flex text-sm text-(--white) rounded-full bg-(--primary) w-20 h-20 items-center justify-center">{vetVoucherList.length}</span>}
            </div>
            {showVetVoucherAlertes && <>
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[800px] border-l border-r border-t border-solid border-(--pink)">
                    <thead className="w-full border-b border-solid border-(--pink) bg-(--pink) font-bold">
                      <tr>
                          <td className="text-(--white) w-100 px-5">Date de la demande</td>
                          <td className="text-(--white) border-l w-100 px-5">Date du rendez-vous</td>
                          <td className="text-(--white) border-l w-150 px-5">Demandeur</td>
                          <td className="text-(--white) border-l w-150 px-5">Pour</td>
                          <td className="text-(--white) border-l flex-1 px-5">Clinique</td>
                          <td className="text-(--white) border-l w-250 px-5">Objet</td>
                          <td className="text-(--white) border-l w-250 px-5">Commentaire</td>
                          <td className="text-(--white) border-l w-100 px-5">Traité le</td>
                      </tr>
                    </thead>
                    <tbody>
                    {vetVoucherList.length > 0 ? vetVoucherList.map((voucher: VetVoucher, idx: number) => (
                            <tr key={voucher.id} className={"w-full border-solid border-(--pink) border-b " + (idx % 2 === 0 ? " bg-(--light-pink)": "") + (voucher.processed_on ? " line-through" : "") }>
                                <td className={"w-100 px-5 text-(--text)"}>{formatDDMMY(new Date(voucher.date))}</td>
                                <td className="border-l px-5 text-(--text)">{formatDDMMY(new Date(voucher.appointmentDate))}</td>
                                <td className="border-l px-5 text-(--text)">{voucher.user_name}</td>
                                <td className="border-l px-5 text-(--text)">{user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.HostFamily]) && 
                                  <Link url={"/admin/cat/" + voucher.cat.slug} text={voucher.cat.numId+ " / " + voucher.cat.name} />}
                                  {user && !hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.HostFamily]) && <>{voucher.cat.numId} / {voucher.cat.name}</>}
                                </td>
                                <td className="border-l px-5 text-(--text)">{voucher.clinic}</td>
                                <td className="border-l px-5 text-(--text)">{voucher.object}</td>
                                <td className="border-l px-5 text-(--text)">{voucher.comment}</td>
                                <td className="border-l px-5 text-(--text)">{voucher.processed_on ? formatDDMMY(new Date(voucher.processed_on)): ""}</td>
                            </tr>
                    )) : <tr><td className='flex-1 text-center border-b border-solid border-(--pink) text-(--text)' colSpan={6}>Pas de bon vétérinaire en attente</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden flex flex-col gap-4">
                {vetVoucherList.length > 0 ? (
                    vetVoucherList.map((voucher: VetVoucher) => (
                        <div
                            key={voucher.id}
                            className={`overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md
                                ${
                                    voucher.processed_on
                                        ? "bg-white border-gray-200 border-l-4 border-l-green-500"
                                        : "bg-(--light-pink) border-(--pink) border-l-4 border-l-(--pink)"
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between px-4 py-3 bg-(--pink)">
                                <div>
                                    <div
                                        className={`font-bold text-lg text-(--white)
                                            ${
                                                voucher.processed_on
                                                    ? "line-through opacity-70"
                                                    : ""
                                            }`}
                                    >
                                        {user &&
                                        hasRoles(user.roles, [
                                            UserRoles.SuperAdmin,
                                            UserRoles.Admin,
                                            UserRoles.HostFamily,
                                        ]) ? (
                                            <Link
                                                url={`/admin/cat/${voucher.cat.slug}`}
                                                text={`${voucher.cat.numId} / ${voucher.cat.name}`}
                                            />
                                        ) : (
                                            <>
                                                {voucher.cat.numId} / {voucher.cat.name}
                                            </>
                                        )}
                                    </div>

                                    <div className="text-xs text-(--white)/80 mt-1">
                                        {voucher.user_name}
                                    </div>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap
                                        ${
                                            voucher.processed_on
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {voucher.processed_on ? "Traité" : "En attente"}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-4 text-(--text)">

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <div className="text-xs tracking-wide text-gray-500">
                                            Demande
                                        </div>
                                        <div className="font-medium">
                                            {formatDDMMY(new Date(voucher.date))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs tracking-wide text-gray-500">
                                            Rendez-vous
                                        </div>
                                        <div className="font-medium">
                                            {formatDDMMY(
                                                new Date(voucher.appointmentDate)
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <div className="border-t border-gray-200 pt-3">

                                    <div className="text-xs tracking-wide text-gray-500 mb-1">
                                        Clinique
                                    </div>

                                    <div className="font-medium">
                                        {voucher.clinic}
                                    </div>

                                </div>

                                <div className="border-t border-gray-200 pt-3">

                                    <div className="text-xs tracking-wide text-gray-500 mb-1">
                                        Objet
                                    </div>

                                    <div className="font-medium">
                                        {voucher.object}
                                    </div>

                                </div>

                                {voucher.comment && (
                                    <div className="border-t border-gray-200 pt-3">

                                        <div className="text-xs tracking-wide text-gray-500 mb-2">
                                            Commentaire
                                        </div>

                                        <div className="rounded-lg bg-white/70 p-3 text-sm leading-relaxed">
                                            {voucher.comment}
                                        </div>

                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">

                                    <span className="text-gray-500">
                                        Statut
                                    </span>

                                    {voucher.processed_on ? (
                                        <span className="font-medium text-green-700">
                                            Traité le{" "}
                                            {formatDDMMY(
                                                new Date(voucher.processed_on)
                                            )}
                                        </span>
                                    ) : (
                                        <span className="font-medium text-yellow-700">
                                            En attente de traitement
                                        </span>
                                    )}

                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-(--pink) bg-(--light-pink) p-8 text-center text-(--text)">
                        <div className="font-semibold">
                            Aucun bon vétérinaire en attente
                        </div>
                    </div>
                )}
              </div>
            </>}
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.AdoptionReferent, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <div className='flex flex-row gap-10 items-center cursor-pointer'>
              <span className={'text-lg text-(--primary)' + (showIncompletesCatsInFAAlertes ? " rotate-90" : "")}>&gt;</span>
              <span className='text-lg text-(--primary)' onClick={ () => setShowIncompletesCatsInFAAlertes(!showIncompletesCatsInFAAlertes)}>Fiches chats en FA incomplètes :</span>
              {unCompletedFACatList.length > 0 && <span className="flex text-sm text-(--white) rounded-full bg-(--primary) w-20 h-20 items-center justify-center">{unCompletedFACatList.length}</span>}
            </div>
            {showIncompletesCatsInFAAlertes && <>
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[500px] border-l border-r border-t border-solid border-(--pink)">
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
              </div>
              <div className="md:hidden flex flex-col gap-4">
                  {unCompletedFACatList.length > 0 ? (
                      unCompletedFACatList.map(
                          (
                              cat: {
                                  slug: string;
                                  name: string;
                                  numId: string;
                                  hostfamily_id: string;
                                  hostfamily_name: string;
                                  fields: string[];
                              }
                          ) => (
                              <div
                                  key={cat.slug}
                                  className="overflow-hidden rounded-xl border border-(--pink) border-l-4 border-l-(--pink) bg-(--light-pink) shadow-sm transition-all hover:shadow-md"
                              >
                                  {/* Header */}
                                  <div className="flex items-start justify-between px-4 py-3 bg-(--pink)">
                                      <div>
                                          <div className="font-bold text-lg text-(--white)">
                                              <Link
                                                  url={`/admin/cat/${cat.slug}`}
                                                  text={cat.name}
                                              />
                                          </div>

                                          <div className="text-xs text-(--white)/80 mt-1">
                                              N° {cat.numId}
                                          </div>
                                      </div>

                                      <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                                          {cat.fields.length} champ
                                          {cat.fields.length > 1 ? "s" : ""}
                                      </span>
                                  </div>

                                  {/* Body */}
                                  <div className="p-4 space-y-4 text-(--text)">

                                      {user.id !== cat.hostfamily_id && (
                                          <div>
                                              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                                  Famille d'accueil
                                              </div>

                                              <div className="font-medium">
                                                  {cat.hostfamily_name}
                                              </div>
                                          </div>
                                      )}

                                      <div className="border-t border-gray-200 pt-3">

                                          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                              Champs à compléter
                                          </div>

                                          <div className="flex flex-wrap gap-2">

                                              {cat.fields.map((field) => (
                                                  <span
                                                      key={field}
                                                      className="rounded-full bg-white border border-(--pink) px-3 py-1 text-xs font-medium text-(--text)"
                                                  >
                                                      {field}
                                                  </span>
                                              ))}

                                          </div>

                                      </div>

                                  </div>
                              </div>
                          )
                      )
                  ) : (
                      <div className="rounded-xl border border-(--pink) bg-(--light-pink) p-8 text-center text-(--text)">
                          <div className="font-semibold">
                              Aucune fiche de chat incomplète
                          </div>
                      </div>
                  )}
              </div>
            </>}
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember]) && <div className='flex flex-col'>
            <div className='flex flex-row gap-10 items-center cursor-pointer'>
              <span className={'text-lg text-(--primary)' + (showIncompletesAdoptedCatsAlertes ? " rotate-90" : "")}>&gt;</span>
              <span className='text-lg text-(--primary)' onClick={ () => setShowIncompletesAdoptedCatsAlertes(!showIncompletesAdoptedCatsAlertes)}>Fiches chats adoptés incomplètes :</span>
              {unCompletedAdoptedCatList.length > 0 && <span className="flex text-sm text-(--white) rounded-full bg-(--primary) w-20 h-20 items-center justify-center">{unCompletedAdoptedCatList.length}</span>}
            </div>
            {showIncompletesAdoptedCatsAlertes && <>
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[400px] border-l border-r border-t border-solid border-(--pink)">
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
              </div>
              <div className="md:hidden flex flex-col gap-4">
                  {unCompletedAdoptedCatList.length > 0 ? (
                      unCompletedAdoptedCatList.map(
                          (
                              cat: {
                                  slug: string;
                                  name: string;
                                  numId: string;
                                  fields: string[];
                              }
                          ) => (
                              <div
                                  key={cat.slug}
                                  className="overflow-hidden rounded-xl border border-(--pink) border-l-4 border-l-(--pink) bg-(--light-pink) shadow-sm transition-all hover:shadow-md"
                              >
                                  {/* Header */}
                                  <div className="flex items-start justify-between px-4 py-3 bg-(--pink)">
                                      <div>
                                          <div className="font-bold text-lg text-(--white)">
                                              <Link
                                                  url={`/admin/cat/${cat.slug}`}
                                                  text={cat.name}
                                              />
                                          </div>

                                          <div className="text-xs text-(--white)/80 mt-1">
                                              N° {cat.numId}
                                          </div>
                                      </div>

                                      <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                                          {cat.fields.length} champ
                                          {cat.fields.length > 1 ? "s" : ""}
                                      </span>
                                  </div>

                                  {/* Body */}
                                  <div className="p-4 space-y-4 text-(--text)">

                                      <div className="border-t border-gray-200 pt-3">

                                          <div className="text-xs tracking-wide text-gray-500 mb-2">
                                              Champs à compléter
                                          </div>

                                          <div className="flex flex-wrap gap-2">

                                              {cat.fields.map((field) => (
                                                  <span
                                                      key={field}
                                                      className="rounded-full bg-white border border-(--pink) px-3 py-1 text-xs font-medium text-(--text)"
                                                  >
                                                      {field}
                                                  </span>
                                              ))}

                                          </div>

                                      </div>

                                  </div>
                              </div>
                          )
                      )
                  ) : (
                      <div className="rounded-xl border border-(--pink) bg-(--light-pink) p-8 text-center text-(--text)">
                          <div className="font-semibold">
                              Aucune fiche de chat adoptés incomplète
                          </div>
                      </div>
                  )}
              </div>            
            </>}
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <div className='flex flex-row gap-10 items-center cursor-pointer'>
              <span className={'text-lg text-(--primary)' + (showReminderAlertes ? " rotate-90" : "")}>&gt;</span>
              <span className='text-lg text-(--primary)' onClick={ () => setShowReminderAlertes(!showReminderAlertes)}>Rappels :</span>
              {vaccineBoosterList.length > 0 && <span className="flex text-sm text-(--white) rounded-full bg-(--primary) w-20 h-20 items-center justify-center">{vaccineBoosterList.length}</span>}
            </div>
            {showReminderAlertes && <>
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[300px] border-l border-r border-t border-solid border-(--pink)">
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
              </div>
              <div className="md:hidden flex flex-col gap-4">
                  {vaccineBoosterList.length > 0 ? (
                      vaccineBoosterList.map((vaccineBooster: Cat) => (
                          <div
                              key={vaccineBooster.id}
                              className="overflow-hidden rounded-xl border border-(--pink) border-l-4 border-l-(--pink) bg-(--light-pink) shadow-sm transition-all hover:shadow-md"
                          >
                              {/* Header */}
                              <div className="flex items-start justify-between bg-(--pink) px-4 py-3">
                                  <div>
                                      <div className="font-bold text-lg text-(--white)">
                                          <Link
                                              url={`/admin/cat/${vaccineBooster.slug}`}
                                              text={vaccineBooster.name}
                                          />
                                      </div>

                                      <div className="text-xs text-(--white)/80 mt-1">
                                          Rappel médical
                                      </div>
                                  </div>

                                  <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                                      À traiter
                                  </span>
                              </div>

                              {/* Body */}
                              <div className="p-4 space-y-4 text-(--text)">

                                  <div className="border-t border-gray-200 pt-3">
                                      <div className="text-xs tracking-wide text-gray-500 mb-2">
                                          Objet
                                      </div>

                                      <div className="font-medium">
                                          Rappel vaccin / stérilisation
                                      </div>
                                  </div>

                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="rounded-xl border border-(--pink) bg-(--light-pink) p-8 text-center text-(--text)">
                          <div className="font-semibold">
                              Aucun rappel de vaccin à effectuer
                          </div>
                      </div>
                  )}
              </div>
            </>}
          </div>}
          {user && hasRoles(user?.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]) && <div className='flex flex-col'>
            <span className='text-lg text-(--primary)'>Pré visites sans date :</span>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full min-w-[400px] border-l border-r border-t border-solid border-(--pink)">
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
            </div>
          </div>}
        </div>
      </div>
      <Footer />
    </main>
  );
}
