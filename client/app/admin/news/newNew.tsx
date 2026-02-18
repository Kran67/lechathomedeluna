'use client'

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Cookies,
  useCookies,
} from 'next-client-cookies';
import Image from 'next/image';
import { toast } from 'react-toastify';

//import { toast } from 'react-toastify';
import Footer from '@/app/components/layout/Footer';
import Header from '@/app/components/layout/Header';
import Button from '@/app/components/ui/Button';
import IconButton from '@/app/components/ui/IconButton';
import Input from '@/app/components/ui/Input';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputTypes,
} from '@/app/enums/enums';
import { redirectWithDelay } from '@/app/lib/utils';
import { create } from '@/app/services/server/newsService';

export default function NewCat() {
    const cookies: Cookies = useCookies();
    const token: string | undefined = cookies.get("token");
    const [pictures, setPictures] = useState<any>([]);
    const [picturesPreview, setPicturesPreview] = useState<string[]>([]);

    // Avant chaque soumission, vérification des données fournies valides.
    const handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form: EventTarget & HTMLFormElement = e.currentTarget;
        const formData: FormData = new FormData(form);
        const date: string | null = formData.get("date") as string !== '' ? formData.get("date") as string : null;

        try {
        await create(
            token,
            date,
            pictures
        );
        redirectWithDelay("/", 1000);
        } catch (err: any) {
            toast.error("Erreur lors de la création de l'actualité :", err);
        }
    };

    useEffect(() => {
        const newImageUrls: any = [];
        pictures.map((image:any) => newImageUrls.push(URL.createObjectURL(image)));
        setPicturesPreview(newImageUrls);
    }, [pictures]);

    const picturesChange = (e: { target: { files: any; }; }) => {
        setPictures([...pictures, ...e.target.files]);
    }

    const removePicture = (e: { preventDefault: () => void; }, idx: number) => {
        pictures.splice(idx, 1);
        e.preventDefault();
        setPictures([...pictures]);
    }

    return (
        <main className="flex flex-col gap-10 lg:gap-20 w-full items-center lg:pt-20 lg:px-140 relative">
            <Header activeMenu={HeaderMenuItems.Home} />
            <div className="flex flex-col w-full gap-10 lg:gap-24 lg:w-970 px-16 pb-80 lg:px-0 lg:pb-0">
                <div className="flex flex-col flex-1 gap-20 md:gap-41 rounded-[10px] border border-solid border-(--pink) bg-(--white) py-20 px-30 md:py-40 md:px-59">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-20 md:gap-41" role="form" aria-label="Ajouter une actualité" encType='multipart/form-data'>
                        <div className="flex flex-col gap-4 md:gap-8">
                            <h5 className="text-(--primary)">Nouvelle actualité</h5>
                        </div>
                        <div className="flex gap-12 md:gap-24">
                            <Input name="date" label="Date de l'actualité" type={InputTypes.Date} className="w-120"  />
                            <Input name="newPictures" label="Photos" type={InputTypes.File} multipleFile={false} onChange={picturesChange} />
                            <div className='flex flex-wrap w-full gap-7' data-p={picturesPreview.length}>
                                {picturesPreview.map((picture: string, idx: number) => (
                                    <div key={idx} className="rounded-[10px] h-100 w-100 overflow-hidden relative">
                                        <IconButton className='absolute right-3 top-3 w-16 h-16 z-1 bg-(--primary) flex justify-center items-center rounded-[5px]'
                                            icon={IconButtonImages.Trash} svgFill='#fff' title='Supprimer cette image' onClick={(e) => removePicture(e, idx)} />
                                        <Image
                                            data-testid={"new-image-" + (idx + 1)}
                                            src={picture}
                                            alt={"Image de l'actualité n°" + (idx + 1)}
                                            fill
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='flex gap-10 md:justify-center flex-wrap md:flex-nowrap mt-10 md:mt-0 gap-y-10'>
                            <Button text="Créer l'actualité" className='cursor-pointer flex justify-center bg-(--primary) rounded-[10px] p-8 px-32 text-(--white) md:w-230' />
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </main>
    );
}