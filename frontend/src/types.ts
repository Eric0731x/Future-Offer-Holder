import type { KR, PersonaData } from './data';

export interface PageProps {
  data: PersonaData;
  isMobile: boolean;
  setRoute: (route: string) => void;
  openCheckin: () => void;
}

export interface MoodItem {
  id: string;
  emoji: string;
  label: string;
  submit: string;
}

export interface CheckinResult {
  kr: KR;
  hours: number;
  progress: number;
  newProgress: number;
  mood: MoodItem;
  stars: number;
  text: string;
}
