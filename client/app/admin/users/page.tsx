import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import {
  getAll,
  getById,
} from '@/app/services/server/usersService';

import UsersList from './users';

export default async function UsersPage() {
    const cookieStore = await cookies()
    const userId: string | undefined = cookieStore.get("userId")?.value;
    const token: string | undefined = cookieStore.get("token")?.value;
    const user = await getById(token, userId ?? '');
    let users: User[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin]))) {
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