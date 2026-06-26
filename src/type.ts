export type ConversationItem = {
    readonly id: number;
    readonly question: string;
    readonly audioWaveform: number[];
    readonly audioSrc?: string;
};

export type Contact = {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly preview: string;
    readonly date: string;
    readonly status: string;
    readonly avatarSrc?: string;
    readonly avatarClassName: string;
    readonly avatarTextClassName: string;
    readonly conversation: ConversationItem[];
};
