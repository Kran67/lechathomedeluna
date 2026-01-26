import { cookies } from 'next/headers';

import { User } from '@/app/interfaces/user';
import {
  getAll,
  getById,
} from '@/app/services/userService';

import Profile from './profile';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    // on récupère le paramétre slug (identifiant de la propriété)
    const slug: string = (await params).slug;
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let profile: User | null = null;
    let users: User[] = [];

    let res = await getById(token, slug);
    if (!res.error) {
        profile = res;
        console.log("Profile loaded:", profile);
    } else {
        throw new Error(res.error);
    }
    res = await getAll(token);
    if (!res.error) {
        users = res;
    } else {
        throw new Error(res.error);
    }

    return (
        <Profile profile={profile} users={users} />
    );
}