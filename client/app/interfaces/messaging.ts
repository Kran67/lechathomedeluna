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

export interface MessageAttachment {
  id: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface Message {
    id: string;
    thread_id: string;
    user_id: string;
    nickname: string;
    content: string;
    sent_at: Date;
    is_readed: boolean;
    attachments: MessageAttachment[];
}