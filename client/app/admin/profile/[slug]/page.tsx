import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserRoles } from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import { hasRoles } from '@/app/core/lib/utils';
import {
  getAll,
  getById,
} from '@/app/core/services/server/usersService';

import Profile from './profile';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    // on récupère le paramétre slug (identifiant de la propriété)
    const slug: string = (await params).slug;
    const cookieStore = await cookies()
    const userId: string = cookieStore.get("userId")?.value as string;
    const token: string = cookieStore.get("token")?.value as string;
    const user = await getById(token, userId ?? '');
    let profile: User | null = null;
    let users: User[] = [];
    let res;

    if (!user || (user && !hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin]))) {
        redirect("/");
    }

    if (slug !== "new") {
        let res = await getById(token, slug);
        if (!res.error) {
            profile = res;
        } else {
            throw new Error(res.error);
        }
    }
    res = await getAll(token);
    if (!res.error) {
        users = res.filter((u: User) => u.id !== profile?.id);
    } else {
        throw new Error(res.error);
    }
    //console.log(profile);

    return (
        <Profile profile={profile} users={users} isNew={slug === "new"} />
    );
}