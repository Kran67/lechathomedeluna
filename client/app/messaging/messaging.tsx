'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useCookies } from 'next-client-cookies';
import { toast } from 'react-toastify';

import EmojiPicker from '@/app/components/ui/EmojiPicker';
import { useUser } from '@/app/contexts/userContext';
import { DateUtils } from '@/app/lib/dateUtils';

import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import IconButton from '../components/ui/IconButton';
import Input from '../components/ui/Input';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputImageTypes,
  InputTypes,
} from '../enums/enums';
import {
  Message,
  Messaging,
} from '../interfaces/messaging';
import {
  formatDDMMY,
  formatHHMMSS,
  getInitials,
} from '../lib/utils';
import {
  getAllMessagesById,
  sendMessage,
} from '../services/client/messagingService';

/**
 * Ajout les métadata à la page
 * 
 * @function metadata
 * @returns { Metadata } - Les méta data à ajouter
 */
//export const metadata: Metadata = {
//    title: "Le Chat'Home de Luna - Messagerie",
//    description: "Messagerie - Le Chat'Home de Luna"
//};

/**
 * Interface pour les propriétés d'initialisation de la messagrie
 * 
 * @interface ProfileProps
 */
interface MessagingProps {
    threads: Messaging[];
}

/**
 * Affiche la page Messaging
 * 
 * @function MessagingPage
 */
export default function MessagingPage({ threads } : MessagingProps) {
    const { user } = useUser();
    const cookieStore = useCookies();
    const token: string | undefined = cookieStore.get("token");
    const [search, setSearch] = useState<string>("");
    const [threadId, setThreadId] = useState<string>(threads && threads.length > 0 ? threads[0].id : "-1");
    const [messages, setMessages] = useState<Message[]>([]);
    const [visibleThreads, setVisibleThreads] = useState<Messaging[]>(threads);
    const [currentThread, setCurrentThread] = useState<Messaging | undefined>(threads.find((thread: Messaging) => thread.id === threadId));
    const [message, setMessage] = useState<string>("");
    const messagesRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (search.trim() !== "") {
            setVisibleThreads(threads.filter((thread: Messaging) => thread.nickname.toLowerCase().includes(search.toLowerCase())));
        } else {
            setVisibleThreads(threads);
        }
    }, [search]);

    useEffect(() => {
        const thread: Messaging | undefined = threads.find((thread: Messaging) => thread.id === threadId);
        if (thread) {
            getAllMessagesById(token, thread.id, user?.id ?? "0").then((data: Message[]) => {
                if (data) {
                    thread.is_readed = true;
                }
                setMessages(data);
            });
            setCurrentThread(thread);
        }
    }, [threadId]);

    useEffect(() => {
        if (messagesRef.current) {
            const element:HTMLElement = (messagesRef.current as HTMLElement);
            element.scrollTop = element.scrollHeight;
        }
    }, [messages]);

    const _sendMessage = async () => {
        if (currentThread && user) {
            const res = await sendMessage(
                token,
                currentThread?.id,
                user?.id,
                message
            );
            if (!res.error) {
                setThreadId("-1");
                setMessage("");
                setTimeout(() => setThreadId(currentThread.id), 10);
            } else {
                toast.error(res.error);
            }
        }
    }

    const handleSendMessage: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await _sendMessage();
    };

    const handleKeyDown = async (e: any) => {
        if (e.key === "Enter") {
            if (!e.altKey) {
                e.preventDefault();
                await _sendMessage();
            } else {
                setMessage(`${message}\n`);
            }
        }
    }

  return (
        <main className="flex flex-col gap-20 w-full h-screen items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.Messaging} />
            <div className="flex gap-20 md:gap-30 p-30 md:p-0 w-full xl:w-1115 flex-1 min-h-0">
                {visibleThreads && visibleThreads.length > 0 && <div className="flex flex-col border border-1 border-(--primary) rounded-[10px] w-321 p-16 gap-10 h-full">
                    <Input
                        name="search"
                        placeHolder="Rechercher un utilisateur"
                        type={InputTypes.Text}
                        imageType={InputImageTypes.Search}
                        className="w-full max-h-40"
                        value={search}
                        showLabel={false}
                        onChange={(e) => setSearch(e.target.value)} />
                    <hr className='border-(--primary)' />
                    <div className='flex flex-col flex-1 gap-2 overflow-y-auto' onClick={() => { setShowPicker(false)} }>
                        {visibleThreads?.map((thread, idx) => (
                            <div key={thread.id} className='flex h-64 items-center cursor-pointer' onClick={(e) => setThreadId(thread.id)}>
                                <div className='flex flex-1 gap-8'>
                                    <div className="flex justify-center items-center rounded-[50%] w-48 h-48 bg-(--text) text-(--white)">{getInitials(thread.nickname)}</div>
                                    <div className="flex flex-col">
                                        <div className="text-(--primary)">{thread.nickname}</div>
                                        <div className={"text-sm text-(--pink)" + (!thread.is_readed ? " font-bold" : "")}>{thread.content.content}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <span className='text-sm text-(--primary)'>{formatDDMMY(new Date(thread.sent_at))}</span>
                                    <span className='text-xs text-(--primary)'>{formatHHMMSS(new Date(thread.sent_at))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                <div className={"flex flex-col flex-1 border border-1 border-(--primary) rounded-[10px] gap-6 bg-[url(/images/discussion.png)] bg-no-repeat bg-center bg-blend-lighten bg-[#ffffffcc]"
                    + (!currentThread ? " justify-center items-center": "")}>
                    {currentThread ?
                        <>
                            <div className="flex h-75 p-16">
                                <div className="flex gap-8">
                                    <div className="flex justify-center items-center rounded-[50%] w-48 h-48 bg-(--text) text-(--white)">{getInitials(currentThread.nickname)}</div>
                                    <div className="flex items-center text-(--primary)">{currentThread.nickname}</div>
                                </div>
                            </div>
                            <hr className="border-(--primary)" />
                                <div className="flex flex-col flex-1 min-h-0 relative">
                                    <div className="flex flex-col flex-1 overflow-y-auto pl-5 pr-5 gap-10" ref={messagesRef} onClick={() => { setShowPicker(false)} }>
                                        {messages.map((m: Message, idx: number) => (
                                            <div key={idx} className={"flex" + (user?.id === m.user_id ? " self-end" : "")}>
                                                <div className="flex flex-col">
                                                    <span
                                                        className={"flex text-sm p-5 pl-10 pr-10 whitespace-pre-line" +
                                                            (user?.id !== m.user_id 
                                                                ? " tooltip-left text-(--white) bg-(--primary) rounded-es-[10px] rounded-e-[10px]" 
                                                                : " tooltip-right text-(--white) bg-(--pink) rounded-s-[10px] rounded-ee-[10px]")}>
                                                            {m.content}
                                                    </span>
                                                    <span className={"flex text-xs text-[#aaa]" + (user?.id !== m.user_id ? " pl-10" : " pr-10 justify-end")}>{DateUtils.differenceDate(new Date(m.sent_at)).text}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {showPicker && (
                                        <>
                                            <EmojiPicker textareaRef={textareaRef} className='pink-emoji-picker absolute bottom-[60px]' />
                                            <style>{`
                                                .pink-emoji-picker {
                                                    --ep-bg: #fff;
                                                    --ep-border: var(--primary-dark);
                                                    --ep-text: var(--text);
                                                    --ep-text-muted: var(--text);
                                                    --ep-accent: var(--text);
                                                    --ep-hover: var(--pink);
                                                    --ep-active-tab: var(--primary);
                                                    --ep-search-bg: var(--light-pink);
                                                    --ep-radius: 12px;
                                                }
                                            `}</style>
                                        </>
                                    )}
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="flex w-full p-5 gap-5"
                                        role="form"
                                        aria-label="Envoyer un message"
                                        encType='multipart/form-data'
                                        ref={formRef}>
                                        <IconButton
                                            icon={IconButtonImages.Emoji}
                                            imgWidth={24}
                                            imgHeight={24}
                                            svgFill='#902677'
                                            svgStroke={showPicker ? '#902677' : ''}
                                            onClick={(e) => { e.preventDefault(); setShowPicker((v) => !v)} } />
                                        <textarea
                                            className='text-sm text-(--text) w-full outline-0 border border-(--pink) px-10 py-5'
                                            ref={textareaRef}
                                            name="message"
                                            rows={2}
                                            style={{ resize: "none"}}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e)}
                                            placeholder="Saisissez votre message" />
                                        <IconButton icon={IconButtonImages.SendMessage} imgWidth={24} imgHeight={24} svgStroke='#902677' />
                                    </form>
                                </div>
                        </> :
                        <span className="text-lg text-(--text)">Vous n'avez pas de messages</span>
                    }
                </div>
            </div>
            <Footer />
        </main>
    );
}
