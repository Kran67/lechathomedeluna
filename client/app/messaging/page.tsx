
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

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserRoles } from '@/app/core/enums/enums';
import { Messaging } from '@/app/core/interfaces/messaging';
import { User } from '@/app/core/interfaces/user';
import { hasRoles } from '@/app/core/lib/utils';
import { getAllUserThreads } from '@/app/core/services/server/messagingService';
import {
  getAll,
  getById,
} from '@/app/core/services/server/usersService';

import MessagingPage from './messaging';

/**
 * Affiche la page
 * 
 * @function Page
 */
export default async function Page() {
    const cookieStore = await cookies()
    const userId: string = cookieStore.get("userId")?.value as string;
    const token: string = cookieStore.get("token")?.value as string;
    const user = await getById(token, userId ?? '');
    let threads: Messaging[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]))) {
        redirect("/");
    }

    let res = await getAllUserThreads(token, user.id);
    if (res) {
        threads = res;
        if (threads.length > 0) {
            threads[0].is_readed = true;
        }
    }

    res = await getAll(token);
    const users = res ? res.map((u: User) => ({ value: u.id, label: u.lastName + " " + u.name })) : [];
    
    return (<MessagingPage threads={threads ?? []} userList={users} />);
}
