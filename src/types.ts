/**
 * Finding Khushboo - Shared Status Types
 */

export interface DailyEntry {
  day: number;
  date: string;
  dietFollowed: boolean;
  dietExceptionsUsed: number; // Cumulative exceptions used on this day
  workFocus: "Case Study" | "Client Project" | "Upskilling" | "None";
  workFocusDetails?: string; // Details of work focus
  physicalActivity: ("Walk" | "Workout" | "Swim" | "Dance" | "Other")[];
  physicalActivityOther?: string; // Custom activity if 'Other' is checked
  physicalDuration: number; // in mins
  socialConnection: "new" | "friend" | "none";
  creativeOutput: string;
  creativeTags: ("Writing" | "Design" | "Music" | "Art" | "Coding")[];
  writeDuration: number; // in mins
  writeType: "Journal" | "Brain Dump";
  contentCreated: boolean;
  contentType: "Text Post" | "Video" | "Carousel" | "None" | "Multi-Format";
  contentFormatList?: ("Text Post" | "Video" | "Carousel")[]; // Selected types for multi-format
  contentPlatforms?: ("LinkedIn" | "Instagram" | "Medium" | "YouTube" | "Twitter" | "Threads")[]; // Social platforms
  readPages: number;
  readType?: "Book" | "Report/Paper"; // Split between standard book or papers/reports
  readDocTitleOrLink?: string; // Tracks the document title or link
  earnings: number; // today's earnings in Rs
  createdAt?: string; // Audit log timestamp
  updatedAt?: string; // Audit log timestamp
}

export interface AppState {
  currentDay: number;
  startDate: string; // The Journey to Sept 9, 2026
  targetEarnings: number; // ₹50,000
  baseEarnings: number; // Base initial earnings before tracking
  entries: { [day: number]: DailyEntry };
  successCriteria: {
    consistency: boolean;
    sincerity: boolean;
    quality: boolean;
    approval: boolean;
  };
}

export const INITIAL_ENTRIES: { [day: number]: DailyEntry } = {};
