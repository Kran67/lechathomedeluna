export interface Messenging {
    id: string,
    user_id: string,
    nickname: string,
    content: { id: string, content: string },
    sent_at: Date,
    is_readed: boolean
}