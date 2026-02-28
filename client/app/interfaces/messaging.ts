export interface Messaging {
    id: string,
    user_id: string,
    nickname: string,
    type: string,
    content: { id: string, content: string },
    sent_at: Date,
    is_readed: boolean,
    members: { id: string, name: string }[]
}

export interface Message {
    id: string;
    thread_id: string;
    user_id: string;
    nickname: string;
    content: string;
    sent_at: Date;
    is_readed: boolean;
}