'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { useCookies } from 'next-client-cookies';

import EmojiPicker from '@/app/components/ui/EmojiPicker';
import { useUser } from '@/app/contexts/userContext';
import { DateUtils } from '@/app/lib/dateUtils';

import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import ModalAddRemoveMembers from '../components/modals/modalAddRemoveMembers';
import ModalCreateThread from '../components/modals/modalCreateThread';
import ModalLeaveThread from '../components/modals/modalLeaveThread';
import ModalRenameThread from '../components/modals/modalRenameThread';
import IconButton from '../components/ui/IconButton';
import Input from '../components/ui/Input';
import Link from '../components/ui/Link';
import MessageAttachments from '../components/ui/MessageAttachments';
import {
  HeaderMenuItems,
  IconButtonImages,
  InputImageTypes,
  InputTypes,
} from '../enums/enums';
import {
  Message,
  MessageAttachment,
  Messaging,
} from '../interfaces/messaging';
import {
  formatDDMMY,
  formatHHMMSS,
  getInitials,
  prepareBodyToShowModal,
  redirectWithDelay,
} from '../lib/utils';
import {
  getAllMessagesById,
  sendMessage,
  uploadMessageFiles,
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
    userList: { value: string, label: string | undefined }[];
}

/**
 * Affiche la page Messaging
 * 
 * @function MessagingPage
 */
export default function MessagingPage({ threads, userList } : MessagingProps) {
    const { user } = useUser();
    const cookieStore = useCookies();
    const token: string | undefined = cookieStore.get("token");
    const [search, setSearch] = useState<string>("");
    const [threadId, setThreadId] = useState<string>(threads && threads.length > 0 ? threads[0].id : "-1");
    const [messages, setMessages] = useState<Message[]>([]);
    const [visibleThreads, setVisibleThreads] = useState<Messaging[]>(threads);
    const [currentThread, setCurrentThread] = useState<Messaging | undefined>(threads ? threads.find((thread: Messaging) => thread.id === threadId) : undefined);
    const [message, setMessage] = useState<string>("");
    const messagesRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [showModalNewThread, setShowModalNewThread] = useState<boolean>(false);
    const [threadType, setThreadType] = useState<"private" | "group">("private");
    const [showModalAddRemoveMembers, setShowModalAddRemoveMembers] = useState<boolean>(false);
    const [removeMembers, setRemoveMembers] = useState<boolean>(false);
    const [showModalRenameThread, setShowModalRenameThread] = useState<boolean>(false);
    const [showModalLeaveGroup, setShowModalLeaveGroup] = useState<boolean>(false);
    const potentialNewMemberList = userList.filter((userItem) => !currentThread?.members?.some((member) => member.id === userItem.value)) ?? [];
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!currentThread || !user) return;
        if (!message.trim() && pendingFiles.length === 0) return;        

        let attachments: MessageAttachment[] = [];
        if (pendingFiles.length > 0) {
            attachments = await uploadMessageFiles(token, pendingFiles);
            setPendingFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }

        await sendMessage(token, currentThread.id, user.id, message, attachments);
        setThreadId("-1");
        setMessage("");
        setTimeout(() => setThreadId(currentThread.id), 10);
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

    const createNewThread = (type: "private" | "group") => {
        setThreadType(type);
        setShowModalNewThread(true);
    }

    useEffect(() => {
        prepareBodyToShowModal(showModalNewThread || showModalAddRemoveMembers || showModalLeaveGroup ? "hidden" : "");
    }, [showModalNewThread, showModalAddRemoveMembers, showModalLeaveGroup]);

    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') return '/images/pdf.png';
        if (file.type.startsWith('image/')) return URL.createObjectURL(file);
        if (file.type.includes('word')) return '/images/doc.png';
        if (file.type.includes('spreadsheet')) return '/images/xls.png';
        return '/images/text.png';
    }

  return (
        <main className="flex flex-col gap-20 w-full h-screen items-center md:pt-20 md:px-140">
            <Header activeMenu={HeaderMenuItems.Messaging} />
            {showModalNewThread && createPortal(
                <ModalCreateThread
                    type={threadType}
                    userList={userList}
                    closeModal={() => setShowModalNewThread(false)}
                    onSuccess={() => {
                        setShowModalNewThread(false);
                        redirectWithDelay(`/messaging`, 1000);
                    }}
                />,
                document.body
            )}
            {showModalAddRemoveMembers && createPortal(
                <ModalAddRemoveMembers
                    threadId={currentThread?.id ?? "-1"}
                    userList={!removeMembers ? potentialNewMemberList : currentThread?.members?.map((member: { id: string, name: string }) => ({ value: member.id, label: member.name })) ?? []}
                    removeMembers={removeMembers}
                    closeModal={() => setShowModalAddRemoveMembers(false)}
                    onSuccess={(members: string[]) => {
                        setShowModalAddRemoveMembers(false);
                        if (removeMembers) {
                            currentThread!.members = currentThread?.members?.filter((member: { id: string }) => !members.some((id) => id === member.id)) ?? [];
                        } else {
                            currentThread?.members.push(...members.map((id) => ({ id, name: userList.find((user) => user.value.toString() === id)?.label ?? "Utilisateur inconnu" })));
                        }
                    }}
                />,
                document.body
            )}
            {showModalRenameThread && createPortal(
                <ModalRenameThread
                    threadId={currentThread?.id ?? "-1"}
                    groupName={currentThread?.nickname ?? ""}
                    closeModal={() => setShowModalRenameThread(false)}
                    onSuccess={(newName: string) => {
                        currentThread!.nickname = newName;
                        setShowModalRenameThread(false);
                    }}
                />,
                document.body
            )}
            {showModalLeaveGroup && createPortal(
                <ModalLeaveThread
                    threadId={currentThread?.id ?? "-1"}
                    isLastMember={currentThread?.members?.length === 1}
                    closeModal={() => setShowModalLeaveGroup(false)}
                    onSuccess={() => {
                        setShowModalLeaveGroup(false);
                        redirectWithDelay(`/messaging`, 1000);
                    }}
                />,
                document.body
            )}

            <div className="flex gap-20 md:gap-30 p-30 md:p-0 w-full xl:w-1115 flex-1 min-h-0">
                <div className="flex flex-col border border-1 border-(--primary) rounded-[10px] w-321 p-16 gap-10 h-full">
                    <div className='flex felx-col gap-3'>
                        <IconButton
                            icon={IconButtonImages.Person}
                            svgFill='#902677'
                            title='Créer une discussion privée'
                            onClick={() => createNewThread("private")} />
                        <IconButton
                            icon={IconButtonImages.Group}
                            svgFill='#902677'
                            title='Créer une discussion groupée'
                            onClick={() => createNewThread("group")} />
                        <Input
                            name="search"
                            placeHolder="Rechercher un utilisateur"
                            type={InputTypes.Text}
                            imageType={InputImageTypes.Search}
                            className="max-h-40"
                            value={search}
                            showLabel={false}
                            onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <hr className='border-(--primary)' />
                    <div className='flex flex-col flex-1 gap-2 overflow-y-auto' onClick={() => { setShowPicker(false)} }>
                        {visibleThreads?.map((thread:Messaging) => (
                            <div key={thread.id} className='flex h-64 items-center cursor-pointer' onClick={(e) => setThreadId(thread.id)}>
                                <div className='flex flex-1 gap-8'>
                                    <div className={"flex justify-center items-center rounded-[50%] w-48 h-48 text-(--white) " + (thread.type === "private" ? "bg-(--text)" : "bg-(--pink)")}>{thread.type === "private" ? getInitials(thread.nickname) : "G"}</div>
                                    <div className="flex flex-col">
                                        <div className="text-(--primary)">{thread.nickname}</div>
                                        <div className={"text-sm text-(--pink)" + (!thread.is_readed && thread.content && thread.content.id ? " font-bold" : "")}>{thread.content.content}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <span className='text-sm text-(--primary)'>{thread.sent_at ? formatDDMMY(new Date(thread.sent_at)): ""}</span>
                                    <span className='text-xs text-(--primary)'>{thread.sent_at ? formatHHMMSS(new Date(thread.sent_at)):""}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={"flex flex-col flex-1 border border-1 border-(--primary) rounded-[10px] gap-6 bg-(--white) overflow-hidden "
                    + (!currentThread ? " justify-center items-center": "")}>
                    {currentThread ?
                        <>
                            <div className="flex h-75 p-16 border-b-1 border-b-(--primary) gap-8">
                                <div className={"flex justify-center items-center rounded-[50%] w-48 h-48 text-(--white) relative " + (currentThread.type === "private" ? "bg-(--text)" : "bg-(--pink)")}>
                                    {currentThread.type === "private" ? getInitials(currentThread.nickname) : "G"}
                                    {currentThread.type === "group" && user?.id === currentThread.user_id && 
                                        <IconButton
                                            icon={IconButtonImages.Pen}
                                            imgWidth={12}
                                            imgHeight={12}
                                            svgFill='#fff'
                                            className='absolute -top-5 right-0 bg-(--primary) rounded-[50%] w-20 h-20 flex justify-center items-center cursor-pointer'
                                            onClick={() => setShowModalRenameThread(true)} />
                                    }
                                </div>
                                <div className="flex flex-1 items-center text-(--primary)">{
                                    currentThread.type === "private"
                                    ? currentThread.nickname
                                    : <div className='flex flex-col gap-2'>
                                        <div className=''>{currentThread.nickname}</div>
                                        <div className='flex gap-2 flex-wrap -ml-5'>
                                            {currentThread.members?.map((member: { id: string, name: string }, idx: number) => 
                                                (user?.id !== member.id 
                                                    ? <Link
                                                        className={'px-5 text-sm ' + (idx > 0 ? 'border-l-1' : '') + (currentThread.user_id === member.id ? " font-bold" : " ") }
                                                        key={member.id}
                                                        text={member.name}
                                                        onClick={() => {}}
                                                        title="Écrire un message privé" />
                                                    : <span key={member.id} className={'px-5 text-sm ' + (idx > 0 ? 'border-l-1' : '') + (currentThread.user_id === member.id ? " font-bold" : " ") }>{member.name}</span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                }</div>
                                    <div className='flex flex-col gap-5'>
                                        <div className='flex gap-5 justify-center'>
                                            <IconButton icon={IconButtonImages.Person} imgWidth={24} imgHeight={24} svgFill='#902677' title='Ajouter un membre' onClick={() => { setRemoveMembers(false); setShowModalAddRemoveMembers(true)} } />
                                            {currentThread.type === "group" && user?.id === currentThread.user_id &&
                                                <IconButton icon={IconButtonImages.RemoveParticipant} imgWidth={24} imgHeight={24} svgFill='#902677' title='Supprimer un membre' onClick={() => { setRemoveMembers(true); setShowModalAddRemoveMembers(true)} } />
                                            }
                                        </div>
                                    <Link text="Quitter le groupe" className='text-sm text-(--pink) hover:underline' onClick={() => setShowModalLeaveGroup(true)} />
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 min-h-0 relative bg-[url(/images/discussion.png)] bg-no-repeat bg-center bg-blend-lighten bg-[#ffffffcc]">
                                <div className="flex flex-col flex-1 overflow-y-auto pl-5 pr-5 gap-10" ref={messagesRef} onClick={() => { setShowPicker(false)} }>
                                    {messages.map((m: Message, idx: number) => (
                                        <div key={idx} className={"flex" + (user?.id === m.user_id ? " self-end" : "")}>
                                            <div className="flex flex-col">
                                                {currentThread.type === "group" && user?.id !== m.user_id && <span className={"flex text-xs text-[#aaa]" + (user?.id !== m.user_id ? " pl-10" : " pr-10 justify-end")}>{m.nickname}</span>}
                                                <span
                                                    className={"flex flex-col text-sm p-5 pl-10 pr-10 whitespace-pre-line relative " +
                                                        (user?.id !== m.user_id 
                                                            ? " self-start tooltip-left text-(--white) bg-(--primary) rounded-es-[10px] rounded-e-[10px]" 
                                                            : " self-end tooltip-right text-(--white) bg-(--pink) rounded-s-[10px] rounded-ee-[10px]")}>
                                                        {m.content && <span className={"whitespace-pre-line " + (user?.id === m.user_id ? "self-end" : "")}>{m.content}</span>}
                                                        <MessageAttachments attachments={m.attachments} isMine={user?.id === m.user_id} />
                                                </span>
                                                <span className={"flex text-xs text-[#aaa]" + (user?.id !== m.user_id ? " pl-10" : " pr-10 justify-end")}>{DateUtils.differenceDate(new Date(m.sent_at)).text}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {showPicker && (
                                    <>
                                        <EmojiPicker textareaRef={textareaRef} className='pink-emoji-picker absolute bottom-[60px] z-2' />
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
                                {/* Prévisualisation des fichiers sélectionnés */}
                                {pendingFiles.length > 0 && (
                                    <div className="absolute bottom-[60px] left-5 flex gap-4 bg-white border border-(--pink) rounded p-8 shadow">
                                        {pendingFiles.map((f: File, i: number) => (
                                        <div key={i} className="relative text-xs flex flex-col items-center gap-2 max-w-[80px]">
                                            <img src={getFileIcon(f)} className="w-[60px] h-[50px] object-cover rounded" alt={f.name} />
                                            <span className="truncate w-full text-center">{f.name}</span>
                                            <IconButton
                                                icon={IconButtonImages.Cross}
                                                imgWidth={6}
                                                imgHeight={6}
                                                svgFill='#fff'
                                                className="absolute -top-2 -right-2 text-white bg-(--pink) rounded-full w-14 h-14 text-[10px] flex items-center justify-center cursor-pointer"
                                                onClick={() => setPendingFiles(prev => prev.filter((_: File, j: number) => j !== i))}
                                            />
                                        </div>
                                        ))}
                                    </div>
                                )}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex w-full p-5 gap-5 bg-(--white)"
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
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files ?? []);
                                            setPendingFiles(prev => [...prev, ...files].slice(0, 5));
                                        }}
                                    />
                                    <IconButton
                                        icon={IconButtonImages.Paperclip}
                                        imgWidth={24}
                                        imgHeight={24}
                                        svgStroke='#902677'
                                        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                                    />                                        
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
