//import { getProperties } from '@/app/api/api';
//import { Lodging } from '@/app/interfaces/lodging';

/**
 * Page du sitemap
 * 
 * @function sitemap
 * @returns { Promise<{ url: string; lastModified: Date; changeFrequency: string; priority: number;}[]> } - Le sitemap
 */
export default async function sitemap(): Promise<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
}[]> {
    //const properties: Lodging[] = await getProperties();
    //const lodgings: {
    //    url: string;
    //    lastModified: Date;
    //    changeFrequency: string;
    //    priority: number;
    //}[] = properties.map((lodging) => (
    //    {
    //        url: `https://www.lechathomedeluna.org/property/${lodging.id}`,
    //        lastModified: new Date(),
    //        changeFrequency: "monthly",
    //        priority: 0.8,
    //    }
    //));

    return [
        {
            url: 'https://www.lechathomedeluna.org',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://www.lechathomedeluna.org/about',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://www.lechathomedeluna.org/adoption',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: 'https://www.lechathomedeluna.org/messaging',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        //...lodgings
    ]
}