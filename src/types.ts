export type Family = "strategy" | "promotion" | "price" | "service" | "analytics" | "risk" | "project";

export interface FamilyInfo { c: string; light: string; name: string }

export interface Mcq { stem: string; options: string[]; answer: number; why: string }
export interface ShortQ { stem: string; answer: string }
export interface Link { to: string; how: string }
export interface Reading { ref: string; point: string; number: string }

export interface Picture {
  type: "flow" | "grid2x2" | "pyramid" | "compare" | "timeline" | "table";
  title: string;
  caption?: string;
  items?: { label?: string; sub?: string; when?: string }[];
  axes?: { x: string[]; y: string[] };
  cells?: { label: string; sub: string }[];
  left?: { title: string; items: string[] };
  right?: { title: string; items: string[] };
  headers?: string[];
  rows?: string[][];
}

export interface Slide {
  slideNo: number;
  session: string;
  type: "cover" | "map" | "title" | "picture" | "concept" | "distinctions" | "readings" | "exercise" | "likely" | "links" | "recap" | "recall";
  title: string;
  subtitle?: string;
  bullets?: string[];
  definition?: string;
  example?: string;
  trap?: string;
  memorise?: string;
  notes?: string;
  caption?: string;
  picture?: Picture;
  pictureType?: string;
  table?: { headers: string[]; rows: string[][] };
  readings?: Reading[];
  mcq?: Mcq[];
  short?: ShortQ[];
  links?: Link[];
  family: Family;
}

export interface Content {
  generated: string;
  families: Record<Family, FamilyInfo>;
  order: string[];
  slides: Slide[];
}

export type Status = "got" | "revisit";

export interface Progress {
  version: number;
  status: Record<number, Status>;
  viewed: Record<number, true>;
  bookmarks: Record<number, true>;
  notes: Record<number, string>;
  last: { session: string; slideNo: number } | null;
  minutes: number;
  lastDay: string;
  streak: number;
  fontScale: number;
  dark: boolean | null;
}
