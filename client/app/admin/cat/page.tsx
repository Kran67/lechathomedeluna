import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NewCat from '@/app/admin/cat/newCat';
import { User } from '@/app/interfaces/user';
import { getAll } from '@/app/services/userService';

export default async function Page() {
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let hostFamilies: User[] = [];

    if (!token || token === "") {
        redirect("/");
    }

    const res = await getAll(token);
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