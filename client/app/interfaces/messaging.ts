export interface Messaging {
    id: string,
    user_id: string,
    nickname: string,
    content: { id: string, content: string },
    sent_at: Date,
    is_readed: boolean
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