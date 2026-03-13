import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserRoles } from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import { hasRoles } from '@/app/core/lib/utils';
import {
  getAll,
  getById,
} from '@/app/core/services/server/usersService';

import UsersList from './users';

export default async function UsersPage() {
    const cookieStore = await cookies()
    const userId: string = cookieStore.get("userId")?.value as string;
    const token: string = cookieStore.get("token")?.value as string;
    const user = await getById(token, userId ?? '');
    let users: User[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRoles.Admin]))) {
        redirect("/");
    }

    const res = await getAll(token);
    if (!res.error) {
        users = res;
        users.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else {
        throw new Error(res.error);
    }

    return (
        <UsersList users={users} />
    );
}