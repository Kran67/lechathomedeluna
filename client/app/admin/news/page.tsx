import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NewNew from '@/app/admin/news/newNew';
import { UserRoles } from '@/app/enums/enums';
import { hasRoles } from '@/app/lib/utils';
import { getById } from '@/app/services/server/usersService';

export default async function Page() {
    const cookieStore = await cookies()
    const userId: string = cookieStore.get("userId")?.value as string;
    const token: string = cookieStore.get("token")?.value as string;
    const user = await getById(token, userId ?? '');

    if (!user || (user && !hasRoles(user.roles, [UserRoles.Admin]))) {
        redirect("/");
    }

    return (
        <NewNew />
    );
}