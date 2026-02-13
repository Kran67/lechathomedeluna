import { cookies } from 'next/headers';
import {
  redirect,
  RedirectType,
} from 'next/navigation';

import { useUser } from '@/app/contexts/userContext';
import { UserRole } from '@/app/enums/enums';
import { User } from '@/app/interfaces/user';
import { hasRoles } from '@/app/lib/utils';
import { getBySlug } from '@/app/services/server/catsService';
import { getAll } from '@/app/services/server/usersService';

import EditCat from './editCat';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { user } = useUser();
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let hostFamilies: User[] = [];

    if (!user || (user && !hasRoles(user.roles, [UserRole.Admin, UserRole.HostFamily]))) {
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