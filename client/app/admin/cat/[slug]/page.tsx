import { cookies } from 'next/headers';
import {
  redirect,
  RedirectType,
} from 'next/navigation';

import { getCat } from '@/app/api/api';
import { User } from '@/app/interfaces/user';
import { getAll } from '@/app/services/userService';

import EditCat from './editCat';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("token")?.value;
    let hostFamilies: User[] = [];

    if (!token || token === "") {
        redirect("/");
    }

    // on récupère le paramétre slug (identifiant du chat)
    const slug = (await params).slug;
    // on va chercher le chat
    const cat = await getCat(slug);
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