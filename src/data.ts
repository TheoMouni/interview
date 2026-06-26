import type { Contact } from "./type";

const sound = (name: string) => `${import.meta.env.BASE_URL}${name}`;
const avatar = (name: string) => `${import.meta.env.BASE_URL}avatar/${name}`;

const waves = {
    calm: [3, 5, 7, 9, 6, 8, 10, 7, 5, 8, 11, 9, 6, 4, 7, 9, 5, 8, 10, 6, 7, 4, 6, 9, 8, 5, 7, 10, 6, 4],
    precise: [4, 8, 6, 10, 7, 5, 9, 11, 6, 8, 4, 7, 10, 8, 5, 9, 6, 11, 7, 4, 8, 6, 9, 5, 10, 7, 4, 8, 6, 9],
    bright: [6, 4, 9, 7, 11, 5, 8, 6, 10, 4, 7, 9, 5, 8, 11, 6, 4, 9, 7, 5, 10, 8, 6, 4, 9, 7, 11, 5, 8, 6],
    dense: [5, 9, 7, 4, 10, 8, 6, 11, 5, 7, 9, 4, 8, 6, 10, 5, 7, 11, 4, 9, 6, 8, 5, 10, 7, 4, 9, 6, 11, 8],
    long: [7, 5, 10, 8, 4, 11, 6, 9, 5, 8, 10, 6, 4, 9, 7, 11, 5, 8, 6, 10, 4, 7, 9, 5, 11, 8, 6, 4, 10, 7],
};

export const SOUND_SRC = sound("sound1.mp3");

export const CONTACTS: Contact[] = [
    {
        id: "mentor",
        name: "Mickael Suard",
        role: "Ingénieur en Ingénierie Logicielle",
        preview: "Ingénieur en Ingénierie Logicielle",
        date: "19/06",
        status: "En ligne",
        avatarSrc: avatar("MS.jpg"),
        avatarClassName: "bg-gradient-to-br from-blue-100 to-blue-200",
        avatarTextClassName: "text-blue-700",
        conversation: [
            { id: 1, question: " Qui etes vous ?", audioWaveform: waves.calm, audioSrc: sound("mickeal1.mp3") },
            { id: 2, question: "Quel est votre parcours ?", audioWaveform: waves.precise, audioSrc: sound("mickeal2.mp3") },
            { id: 3, question: "Quelles sont vos missions au sein de l'Université de Lyon ?", audioWaveform: waves.bright, audioSrc: sound("mickeal3.mp3") },
        ],
    },
    {
        id: "tutor",
        name: "Romain Labolle",
        role: "Responsable service securite informatique ",
        preview: "Responsable service securite informatique",
        date: "19/06",
        status: "Disponible",
        avatarClassName: "bg-gradient-to-br from-violet-100 to-violet-300",
        avatarTextClassName: "text-violet-800",
        conversation: [
            { id: 1, question: "Qui etes vous ?", audioWaveform: waves.precise, audioSrc: sound("romain1.mp3") },
            { id: 2, question: "Quel est votre parcours ?", audioWaveform: waves.dense, audioSrc: sound("romain2.mp3") },
            { id: 3, question: "Quelles sont vos missions au sein de l'Université de Lyon ?", audioWaveform: waves.calm, audioSrc: sound("romain3.mp3") },
        ],
    },
    {
        id: "project",
        name: "Kevin Woeffler",
        role: "Responsable du service informatique",
        preview: "Responsable du service informatique",
        date: "18/06",
        status: "Occupee",
        avatarClassName: "bg-gradient-to-br from-amber-100 to-amber-300",
        avatarTextClassName: "text-amber-800",
        conversation: [
            { id: 1, question: "Qui etes vous ?", audioWaveform: waves.precise, audioSrc: sound("kevin1.mp3") },
            { id: 2, question: "Quel est votre parcours ?", audioWaveform: waves.dense, audioSrc: sound("kevin2.mp3") },
            { id: 3, question: "Quelles sont vos missions au sein de l'Université de Lyon ?", audioWaveform: waves.calm, audioSrc: sound("kevin3.mp3") },
        ],
    },
    {
        id: "dev",
        name: "Bilel Laichaoui",
        role: "Responsable du pole surpport",
        preview: "Responsable du pole surpport",
        date: "17/06",
        status: "En ligne",
        avatarClassName: "bg-gradient-to-br from-green-100 to-green-300",
        avatarTextClassName: "text-green-800",
        conversation: [
            { id: 1, question: "Qui etes vous ?", audioWaveform: waves.precise, audioSrc: sound("bilel1.mp3") },
            { id: 2, question: "Quel est votre parcours ?", audioWaveform: waves.dense, audioSrc: sound("bilel2.mp3") },
            { id: 3, question: "Quelles sont vos missions au sein de l'Université de Lyon ?", audioWaveform: waves.calm, audioSrc: sound("bilel3.mp3") },
        ],
    },
    
];
