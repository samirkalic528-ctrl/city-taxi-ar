
export interface AdItem {
    id: string;
    title: string;
    body: string;
    icon: string;
    type: 'globos' | 'pitch' | 'trivia';
    url: string;
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
    sources?: { title: string; uri: string }[];
}

export type ActivityType = 'GAME_PLAYED' | 'AD_VIEWED' | 'AD_SKIPPED' | 'AD_CLICKED';

export interface ActivityLog {
    type: ActivityType;
    detail: string; // e.g., "TicTacToe (Win)" or "Globos Kasko"
    timestamp: string;
    duration?: number; // seconds
}

export interface UserProfile {
    interests: string[];
    habits: string[];
    tripHistory: string[];
    lastTopic: string;
    activityLog: ActivityLog[]; // New field for behavior tracking
}

export enum AppState {
    LOADING = 'LOADING',
    ACTIVE = 'ACTIVE'
}

export interface GeoState {
    speed: number;
    lat: number;
    lng: number;
}

export interface Gift {
    id: number;
    x: number; // percentage left 0-100
    y: number; // percentage top 0-100
    z: number; // depth scale factor (0.4 to 1.5)
    vx: number; // velocity x
    vy: number; // velocity y
    vz: number; // velocity z (depth speed)
    rot: number; // current rotation
    vRot: number; // rotation speed
    createdAt: number; // timestamp
    lifespan: number; // how long it lasts in ms
}

export enum GameType {
    NONE = 'NONE',
    AR_HUNT = 'AR_HUNT',
    TIC_TAC_TOE = 'TIC_TAC_TOE',
    NEON_TRIVIA = 'NEON_TRIVIA',
    REFLEX_GRID = 'REFLEX_GRID',
    TRAFFIC_SIMON = 'TRAFFIC_SIMON'
}

export interface TriviaQuestion {
    q: string;
    options: string[];
    correct: number;
}

export interface LeaderboardEntry {
    id: string;
    nickname: string;
    score: number;
    date: string;
    isUser?: boolean; // Highlight user's own score
}

export interface Prize {
    id: number;
    sponsor: string;
    item: string;
    icon: string;
    color: string;
    desc: string;
}