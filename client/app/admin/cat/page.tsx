import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NewCat from '@/app/admin/cat/newCat';
import { useUser } from '@/app/contexts/userContext';
import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import { getAll } from '@/app/services/server/usersService';

export default async function Page() {
    const { user } = useUser();
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
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