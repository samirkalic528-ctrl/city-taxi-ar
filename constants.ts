
import { AdItem, Prize } from './types';

export const GLOBOS_LINK = "https://webshop.globos.rs/putno-osiguranje/info";
export const APP_LINK = "https://play.google.com/store/apps/details?id=nstaxi.codecab.biz.app&hl=en";
export const ADMIN_EMAIL = "admin@citytaxi.rs"; // Change this to your real email

export const ADS: AdItem[] = [
    { id: '1', type: 'globos', title: "BRZA POLISA", body: "Dok taksi stigne do aerodroma, polisa stiže na Vaš mejl.", icon: "fa-paper-plane", url: GLOBOS_LINK },
    { id: '2', type: 'globos', title: "SPECIJALNI POPUST", body: "Iskoristi vožnju i ostvari 20% popusta na putno!", icon: "fa-percent", url: GLOBOS_LINK },
    { id: '3', type: 'globos', title: "POMOĆ NA PUTU", body: "Iskoristi priliku dok se voziš - obezbedi se!", icon: "fa-tools", url: GLOBOS_LINK },
    { id: '4', type: 'globos', title: "KASKO ZAŠTITA", body: "Mirno spavajte uz Globos Kasko.", icon: "fa-car-crash", url: GLOBOS_LINK },
    { id: '5', type: 'pitch', title: "15 MINUTA PAŽNJE", body: "Toliko traje prosečna vožnja. Iskoristite to.", icon: "fa-clock", url: APP_LINK },
    { id: '6', type: 'trivia', title: "DA LI STE ZNALI?", body: "Prvi taksi na svetu je bio kočija (1605).", icon: "fa-history", url: APP_LINK },
    { id: '7', type: 'trivia', title: "ZAŠTO ŽUTA?", body: "Žuta boja se najlakše vidi u saobraćaju.", icon: "fa-palette", url: APP_LINK }
];

export const WEEKLY_PRIZES: Prize[] = [
    { 
        id: 1, 
        sponsor: "GIGATRON", 
        item: "Razer BlackShark V2 Slušalice", 
        icon: "fa-headset", 
        color: "text-green-400", 
        desc: "Kristalno čist zvuk za gaming i muziku." 
    },
    { 
        id: 2, 
        sponsor: "WORLD CLASS", 
        item: "VIP Mesečna Članarina", 
        icon: "fa-dumbbell", 
        color: "text-red-500", 
        desc: "Treniraj kao profesionalac u najboljim uslovima." 
    },
    { 
        id: 3, 
        sponsor: "BERBERAJ", 
        item: "Royal Tretman (Šišanje + Brada)", 
        icon: "fa-cut", 
        color: "text-amber-400", 
        desc: "Vrhunska nega za pravu gospodu." 
    },
    { 
        id: 4, 
        sponsor: "CINESTAR 4DX", 
        item: "Gold Class Paket za Dvoje", 
        icon: "fa-film", 
        color: "text-blue-400", 
        desc: "Kokice, piće i najbolja mesta u sali." 
    }
];