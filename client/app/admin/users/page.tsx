import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { useUser } from '@/app/contexts/userContext';
import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import { getAll } from '@/app/services/server/usersService';

import UsersList from './users';

export default async function UsersPage() {
    const { user } = useUser();
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
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