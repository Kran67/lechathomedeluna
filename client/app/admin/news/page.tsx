import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NewNew from '@/app/admin/news/newNew';
import { UserRole } from '@/app/enums/enums';
import { hasRoles } from '@/app/lib/utils';
import { getById } from '@/app/services/server/usersService';

export default async function Page() {
    const cookieStore = await cookies()
    const userId: string | undefined = cookieStore.get("userId")?.value;
    const token: string | undefined = cookieStore.get("token")?.value;
    const user = await getById(token, userId ?? '');

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin]))) {
        redirect("/");
    }

    return (
        <NewNew />
    );
}