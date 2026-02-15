
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

import { UserRole } from '../enums/enums';
import { Messaging } from '../interfaces/messaging';
import { hasRoles } from '../lib/utils';
import { getAllUserThreads } from '../services/server/messagingService';
import { getById } from '../services/server/usersService';
import MessagingPage from './messaging';

/**
 * Affiche la page
 * 
 * @function Page
 */
export default async function Page() {
    const cookieStore = await cookies()
    const userId: string | undefined = cookieStore.get("userId")?.value;
    const token: string | undefined = cookieStore.get("token")?.value;
    const user = await getById(token, userId ?? '');
    let threads: Messaging[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin, UserRole.HostFamily]))) {
        redirect("/");
    }

    const res = await getAllUserThreads(token, user.id);
    if (!res.error) {
        threads = res;
        if (threads.length > 0) {
            threads[0].is_readed = true;
        }
    } else {
        throw new Error(res.error);
    }

    return (<MessagingPage threads={threads} />);
}
