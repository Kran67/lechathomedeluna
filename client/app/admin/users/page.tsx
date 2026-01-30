import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { User } from '@/app/interfaces/user';
import { getAll } from '@/app/services/userService';

import UsersList from './users';

export default async function UsersPage() {
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let users: User[] = [];

    if (!token || token === "") {
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