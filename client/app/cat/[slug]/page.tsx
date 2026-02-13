import {
  Metadata,
  ResolvingMetadata,
} from 'next';
import {
  redirect,
  RedirectType,
} from 'next/navigation';

import CatDetail from '@/app/cat/[slug]/catDetail';
import { Cat } from '@/app/interfaces/cat';
import { getBySlug } from '@/app/services/server/catsService';

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: Props,
  parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  // on va chercher les information du chat
  const cat: Cat | any = await getBySlug(slug);
  return {
    title: `Le Chat'Home de Luna - ${cat.name}`,
    description: cat.description,
    openGraph: {
      type: 'article',
      images: [cat.cover],
    },
  }
}

/**
 * Affiche les détails d'un chat
 * 
 * @async
 * @function CatPage
 * @param { params: Promise<{ slug: string }> } params - Identifiant du chat sous forme de Promise
 */
export default async function CatPage({ params }: { params: Promise<{ slug: string }> }) {
  // on récupère le paramétre slug (identifiant du chat)
  const slug = (await params).slug;
  // on va chercher le chat
  const cat = await getBySlug(slug);
  // si le chat n'a pas été trouvée, on redirige vers la page 404
  if (cat?.error) {
    redirect("/404", RedirectType.push);
  }

  return <CatDetail cat={cat} />
}