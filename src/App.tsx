import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { CONTACTS, SOUND_SRC } from "./data";
import type { Contact, ConversationItem } from "./type";

type AudioPlayerProps = Readonly<{
    waveform: number[];
    audioSrc?: string;
    animate?: boolean;
    onMounted?: () => void;
}>;

type AvatarProps = Readonly<{
    contact?: Contact;
    label?: string;
    size?: "sm" | "md" | "lg";
    variant?: "me" | "contact";
}>;

type MessageProps = Readonly<{
    item: ConversationItem;
    contact: Contact;
}>;

type ActiveMessageProps = MessageProps & Readonly<{
    onAudioMounted?: () => void;
}>;

type ContactListProps = Readonly<{
    onSelectContact: (contact: Contact) => void;
}>;

type TypeIntoInputCallback = (text: string, onDone?: () => void) => void;

const waveHeightClass: Record<number, string> = {
    3: "h-1.5",
    4: "h-2",
    5: "h-2.5",
    6: "h-3",
    7: "h-3.5",
    8: "h-4",
    9: "h-4.5",
    10: "h-5",
    11: "h-5.5",
};

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join("");
}

function formatAudioDuration(duration: number) {
    if (!Number.isFinite(duration) || duration <= 0) return "0:00";

    const totalSeconds = Math.round(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function AudioPlayer({ waveform, animate = false, onMounted, audioSrc }: AudioPlayerProps) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [durationLabel, setDurationLabel] = useState("0:00");
    const [visible, setVisible] = useState(!animate);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const calledRef = useRef(false);

    useEffect(() => {
        const audio = new Audio(audioSrc || SOUND_SRC);
        audio.preload = "auto";
        audioRef.current = audio;

        const handleTimeUpdate = () => {
            if (audio.duration > 0) setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            if (audio.duration > 0) {
                setDurationSeconds(audio.duration);
                setDurationLabel(formatAudioDuration(audio.duration));
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setPlaying(false);
            setProgress(100);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
            audioRef.current = null;
        };
    }, [audioSrc]);

    useEffect(() => {
        if (!animate) return;
        const timer = globalThis.setTimeout(() => setVisible(true), 60);
        return () => globalThis.clearTimeout(timer);
    }, [animate]);

    useEffect(() => {
        if (visible && !calledRef.current) {
            calledRef.current = true;
            onMounted?.();
        }
    }, [visible, onMounted]);

    const seekTo = (time: number) => {
        const audio = audioRef.current;
        if (!audio || durationSeconds <= 0) return;
        const nextTime = Math.min(Math.max(0, time), durationSeconds);
        audio.currentTime = nextTime;
        setProgress((nextTime / durationSeconds) * 100);
    };

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
            return;
        }

        if (audio.duration > 0 && audio.currentTime >= audio.duration) {
            audio.currentTime = 0;
            setProgress(0);
        }

        audio.play().catch(() => undefined);
        setPlaying(true);
    };

    return (
        <div className={cn(
            "flex w-full max-w-70 origin-left items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_2px_16px_rgba(37,99,235,0.18)] transition-all duration-700 ease-out",
            visible ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-none" : "-translate-x-3 translate-y-3 scale-95 opacity-0 blur-sm",
        )}>
            <button
                onClick={togglePlayback}
                aria-label={playing ? "Mettre en pause" : "Lire le vocal"}
                className={cn(
                    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 transition-all",
                    playing
                        ? "bg-linear-to-br from-orange-500 to-orange-400 shadow-[0_3px_12px_rgba(249,115,22,0.35)]"
                        : "bg-linear-to-br from-blue-600 to-sky-500 shadow-[0_3px_12px_rgba(37,99,235,0.18)]",
                )}
            >
                {playing
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><rect x="1" y="1" width="4" height="10" rx="1" /><rect x="7" y="1" width="4" height="10" rx="1" /></svg>
                    : <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><path d="M2 1 L11 6 L2 11 Z" /></svg>}
            </button>

            <button
                tabIndex={0}
                aria-label="Se deplacer dans le vocal"
                onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const ratio = Math.min(Math.max(0, (e as MouseEvent).clientX - rect.left), rect.width) / rect.width;
                    seekTo(ratio * durationSeconds);
                }}
                className="flex h-7 min-w-0 flex-1 cursor-pointer items-end gap-0.5 overflow-hidden"
            >
                {waveform.map((h, i) => {
                    const filled = (i / waveform.length) * 100 <= progress;
                    return (
                        <div
                            key={`${i}-${h}`}
                            className={cn(
                                "min-w-0.75 flex-1 rounded-full transition-colors",
                                waveHeightClass[h] ?? "h-3",
                                filled && playing && "bg-linear-to-t from-orange-500 to-amber-300",
                                filled && !playing && "bg-linear-to-t from-blue-600 to-sky-500",
                                !filled && "bg-blue-100",
                            )}
                        />
                    );
                })}
            </button>

            <span className="shrink-0 font-mono text-[0.7rem] text-gray-500">{durationLabel}</span>
        </div>
    );
}

function Avatar({ contact, label, size = "md", variant = "contact" }: AvatarProps) {
    const [imageError, setImageError] = useState(false);
    const sizeClass = size === "lg" ? "h-11 w-11 text-sm" : size === "sm" ? "h-11 w-11 text-[0.62rem]" : "h-11 w-11 text-[0.68rem]";
    const visualClass = variant === "me"
        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
        : `${contact?.avatarClassName ?? "bg-gray-200"} ${contact?.avatarTextClassName ?? "text-gray-700"}`;
    const showImage = variant === "contact" && contact?.avatarSrc && !imageError;

    return (
        <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 font-bold shadow-[0_2px_8px_rgba(37,99,235,0.18)]", sizeClass, visualClass)}>
            {showImage ? (
                <img src={contact.avatarSrc} alt={contact.name} className="h-full w-full scale-[1.01] object-cover object-center antialiased" onError={() => setImageError(true)}/>
            ) : (
                label ?? (contact ? getInitials(contact.name) : "")
            )}
        </div>
    );
}

function VoiceTypingIndicator() {
    return (
        <div className="flex w-20 items-center justify-center gap-1.5 rounded-[18px] bg-white px-4 py-3 shadow-[0_2px_16px_rgba(37,99,235,0.18)]">
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms]" />
        </div>
    );
}

function StaticMessage({ item, contact }: MessageProps) {
    return (
        <div className="flex w-full flex-col gap-3.5">
            <div className="flex items-end justify-end gap-2">
                <div className="max-w-[320px] rounded-[20px_20px_6px_20px] bg-linear-to-br from-blue-600 to-blue-500 px-4.5 py-3 font-serif text-[0.92rem] leading-relaxed text-white shadow-[0_4px_20px_rgba(37,99,235,0.18)]">
                    {item.question}
                </div>
                <Avatar label="Moi" variant="me" />
            </div>

            <div className="flex items-end justify-start gap-2">
                <Avatar contact={contact} />
                <div>
                    <AudioPlayer waveform={item.audioWaveform} audioSrc={item.audioSrc} />
                </div>
            </div>
        </div>
    );
}

function ActiveMessage({ item, contact, onAudioMounted }: ActiveMessageProps) {
    const [showAudio, setShowAudio] = useState(false);

    useEffect(() => {
        const timer = globalThis.setTimeout(() => setShowAudio(true), 1050);
        return () => globalThis.clearTimeout(timer);
    }, []);

    return (
        <div className="flex w-full flex-col gap-3.5">
            <div className="flex items-end justify-end gap-2">
                <div className="max-w-[320px] rounded-[20px_20px_6px_20px] bg-linear-to-br from-blue-600 to-blue-500 px-4.5 py-3 font-serif text-[0.92rem] leading-relaxed text-white shadow-[0_4px_20px_rgba(37,99,235,0.18)]">
                    {item.question}
                </div>
                <Avatar label="Moi" variant="me" />
            </div>

            <div className="flex items-end justify-start gap-2">
                <Avatar contact={contact} />
                <div>
                    {showAudio ? (
                        <AudioPlayer waveform={item.audioWaveform} audioSrc={item.audioSrc} animate onMounted={onAudioMounted} />
                    ) : (
                        <VoiceTypingIndicator />
                    )}
                </div>
            </div>
        </div>
    );
}

function ContactList({ onSelectContact }: ContactListProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-[#f2f2f2] py-1">
            {CONTACTS.map((contact) => (
                <button
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className="grid w-full cursor-pointer grid-cols-[42px_minmax(0,1fr)_44px] items-center gap-2 border-0 border-b border-gray-200 bg-[#f2f2f2] py-2 pr-1 pl-1 text-left font-sans transition-colors hover:bg-[#e9eef5]"
                >
                    <Avatar contact={contact} size="sm" />
                    <div className="min-w-0">
                        <strong className="block truncate text-[0.91rem] leading-tight font-medium text-[#555]">{contact.name}</strong>
                        <p className="mt-0.5 truncate text-[0.78rem] leading-tight text-[#5f6368]">{contact.preview}</p>
                    </div>
                    <span className="self-start pt-0.5 pr-1 text-right font-sans text-xs text-neutral-600">{contact.date}</span>
                </button>
            ))}
        </div>
    );
}

export default function InterviewStage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [doneIds, setDoneIds] = useState<number[]>([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [canSend, setCanSend] = useState(false);
    const [pillReady, setPillReady] = useState(true);

    const typeRef = useRef<number | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const conversation = useMemo(() => selectedContact?.conversation ?? [], [selectedContact]);
    const nextIdx = doneIds.length;
    const isFinished = conversation.length > 0 && doneIds.length >= conversation.length;

    useEffect(() => {
        return () => {
            if (typeRef.current !== null) globalThis.clearInterval(typeRef.current);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [doneIds, inputValue, activeIdx]);

    const typeIntoInput: TypeIntoInputCallback = useCallback((text, onDone) => {
        if (typeRef.current !== null) globalThis.clearInterval(typeRef.current);
        setInputValue("");
        setIsTyping(true);
        setCanSend(false);
        let i = 0;
        typeRef.current = globalThis.setInterval(() => {
            i++;
            setInputValue(text.slice(0, i));
            if (i >= text.length) {
                if (typeRef.current !== null) globalThis.clearInterval(typeRef.current);
                setIsTyping(false);
                setCanSend(true);
                onDone?.();
            }
        }, 32);
    }, []);

    const resetConversation = useCallback(() => {
        if (typeRef.current !== null) globalThis.clearInterval(typeRef.current);
        setDoneIds([]);
        setActiveIdx(-1);
        setInputValue("");
        setIsTyping(false);
        setCanSend(false);
        setPillReady(true);
    }, []);

    const handleContactSelect = useCallback((contact: Contact) => {
        resetConversation();
        setSelectedContact(contact);
    }, [resetConversation]);

    const handleBackToContacts = useCallback(() => {
        resetConversation();
        setSelectedContact(null);
    }, [resetConversation]);

    const handlePillClick = () => {
        if (!conversation[0]) return;
        setPillReady(false);
        typeIntoInput(conversation[0].question);
    };

    const handleSend = useCallback(() => {
        if (!canSend || activeIdx >= 0 || !conversation[nextIdx]) return;
        setCanSend(false);
        setInputValue("");
        setActiveIdx(nextIdx);
    }, [canSend, activeIdx, nextIdx, conversation]);

    const handleAudioMounted = useCallback(() => {
        const justDone = activeIdx;
        setDoneIds(prev => [...prev, justDone]);
        setActiveIdx(-1);

        const next = justDone + 1;
        if (next < conversation.length) {
            globalThis.setTimeout(() => {
                typeIntoInput(conversation[next].question);
            }, 600);
        }
    }, [activeIdx, conversation, typeIntoInput]);

    if (!selectedContact) {
        return (
            <div className="mx-auto flex h-screen max-w-180 flex-col overflow-hidden bg-[#f2f2f2] font-sans text-gray-800">
                <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white/75 px-4.5 py-3.5 backdrop-blur-2xl">
                    <div>
                        <h1 className="text-base leading-tight font-semibold text-gray-600">Contacts</h1>
                        <p className="text-[0.72rem] text-gray-500">{CONTACTS.length} conversations</p>
                    </div>
                    <span className="text-[0.72rem] text-gray-500">Rapport de stage</span>
                </header>
                <ContactList onSelectContact={handleContactSelect} />
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-screen max-w-180 flex-col overflow-hidden bg-linear-to-br from-blue-50 via-[#e8f2ff] to-[#f5f9ff] font-sans text-gray-800">
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white/75 px-4.5 py-3.5 backdrop-blur-2xl">
                <div className="flex min-w-0 items-center gap-2.5">
                    <button
                        onClick={handleBackToContacts}
                        aria-label="Retour aux contacts"
                        className="flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-gray-200 bg-white text-blue-600 shadow-[0_1px_6px_rgba(37,99,235,0.08)]"
                    >
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <Avatar contact={selectedContact} />
                    <div className="min-w-0">
                        <h1 className="truncate text-base leading-tight font-bold text-gray-800">{selectedContact.name}</h1>
                        <p className="font-mono text-[0.72rem] text-gray-500">{conversation.length} questions</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={cn("block h-2 w-2 rounded-full", selectedContact.status === "Absent" ? "bg-slate-300" : "bg-green-400 shadow-[0_0_6px_#4ade80]")} />
                    <span className="font-mono text-[0.72rem] text-gray-500">{selectedContact.status}</span>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-6">
                {doneIds.length === 0 && activeIdx === -1 && (
                    <div className="mx-auto mt-8 max-w-85 text-center">
                        <div className="mb-4 flex justify-center">
                            <Avatar contact={selectedContact} size="lg" />
                        </div>
                        <h3 className="mb-2 text-[1.16rem] font-bold text-gray-800">{selectedContact.name}</h3>
                        <h2 className="mb-2 text-[1.16rem] font-bold text-gray-800">{selectedContact.role}</h2>
                        <p className="text-[0.88rem] leading-relaxed text-gray-500">Lancez la premiere question suggeree pour demarrer cet echange.</p>
                    </div>
                )}

                {doneIds.map(idx => (
                    <StaticMessage key={`done-${conversation[idx].id}`} item={conversation[idx]} contact={selectedContact} />
                ))}

                {activeIdx >= 0 && (
                    <ActiveMessage
                        key={`active-${conversation[activeIdx].id}`}
                        item={conversation[activeIdx]}
                        contact={selectedContact}
                        onAudioMounted={handleAudioMounted}
                    />
                )}

                {isFinished && (
                    <div className="py-2 text-center">
                        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4.5 py-1.5 font-mono text-xs text-blue-600">Entretien termine</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white/85 px-4 pt-3 pb-4 backdrop-blur-2xl">
                {pillReady && doneIds.length === 0 && activeIdx === -1 && !isTyping && !canSend && conversation[0] && (
                    <div className="mb-2.5 flex">
                        <button
                            onClick={handlePillClick}
                            className="max-w-125 cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-4.5 py-2 text-left text-[0.84rem] text-blue-600 shadow-[0_2px_12px_rgba(37,99,235,0.18)] transition-shadow hover:shadow-[0_4px_18px_rgba(37,99,235,0.25)]"
                        >
                            {conversation[0].question.length > 55 ? `${conversation[0].question.slice(0, 52)}...` : conversation[0].question}
                        </button>
                    </div>
                )}

                <div className={cn(
                    "flex items-center gap-2.5 rounded-[18px] bg-white px-3.5 py-2.5 shadow-[0_1px_6px_rgba(37,99,235,0.05)] transition-all",
                    canSend ? "border-[1.5px] border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-[1.5px] border-gray-200",
                )}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-35">
                        <path d="M18 13a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8z" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>

                    <span className={cn("block min-h-[1.4em] flex-1 truncate font-serif text-[0.92rem]", inputValue ? "text-gray-800" : "text-blue-300")}>
                        {inputValue || (!isTyping && "Selectionnez une question...")}
                        {isTyping && <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-blue-600 align-middle" />}
                    </span>

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        aria-label="Envoyer la question"
                        className={cn(
                            "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] border-0 transition-all",
                            canSend
                                ? "cursor-pointer scale-100 bg-linear-to-br from-blue-600 to-sky-500 shadow-[0_3px_12px_rgba(37,99,235,0.18)]"
                                : "cursor-not-allowed scale-[0.88] bg-blue-50",
                        )}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M13 7L1 1l3 6-3 6 12-6z" className={canSend ? "fill-white" : "fill-blue-200"} />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
