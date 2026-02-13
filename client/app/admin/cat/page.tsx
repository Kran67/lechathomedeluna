import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NewCat from '@/app/admin/cat/newCat';
import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import {
  getAll,
  getById,
} from '@/app/services/server/usersService';

export default async function Page() {
    const cookieStore = await cookies()
    const userId: string | undefined = cookieStore.get("userId")?.value;
    const token: string | undefined = cookieStore.get("token")?.value;
    const user = await getById(token, userId ?? '');
    let hostFamilies: User[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin, UserRole.HostFamily]))) {
        redirect("/");
    }

    const res = await getAll(token); // TODO : faire une methode juste pour renvoyer les utilisateurs actifs
    if (!res.error) {
        hostFamilies = res;
        hostFamilies = hostFamilies.filter(u => !u?.blacklisted);
    } else {
        throw new Error(res.error);
    }

    return (
        <NewCat  hostFamilies={hostFamilies} />
    );
}