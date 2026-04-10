import { cookies } from 'next/headers';
import {
  redirect,
  RedirectType,
} from 'next/navigation';

import { UserRoles } from '@/app/core/enums/enums';
import { User } from '@/app/core/interfaces/user';
import { hasRoles } from '@/app/core/lib/utils';
import { getBySlug } from '@/app/core/services/server/catsService';
import {
  getAll,
  getById,
} from '@/app/core/services/server/usersService';

import EditCat from './editCat';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const cookieStore = await cookies()
    const userId: string = cookieStore.get("userId")?.value as string;
    const token: string = cookieStore.get("token")?.value as string;
    const user = await getById(token, userId ?? '');
    let hostFamilies: User[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRoles.SuperAdmin, UserRoles.Admin, UserRoles.CommitteeMember, UserRoles.HostFamily]))) {
        redirect("/");
    }

    // on récupère le paramétre slug (identifiant du chat)
    const slug = (await params).slug;
    // on va chercher le chat
    const cat = await getBySlug(slug);
    // si le chat n'a pas été trouvée, on redirige vers la page 404
    if (cat?.error) {
        redirect("/404", RedirectType.push);
    }

  const res = await getAll(token);
    if (!res.error) {
        hostFamilies = res;
        hostFamilies = hostFamilies.filter(u => !u?.blacklisted);
    } else {
        throw new Error(res.error);
    }

    return (
        <EditCat hostFamilies={hostFamilies} cat={cat} slug={slug} />
    );
}