import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { useUser } from '@/app/contexts/userContext';
import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import {
  getAll,
  getById,
} from '@/app/services/server/usersService';

import Profile from './profile';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { user } = useUser();
    // on récupère le paramétre slug (identifiant de la propriété)
    const slug: string = (await params).slug;
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let profile: User | null = null;
    let users: User[] = [];
    let res;

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin]))) {
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
        users = res;
    } else {
        throw new Error(res.error);
    }

    return (
        <Profile profile={profile} users={users} isNew={slug === "new"} />
    );
}