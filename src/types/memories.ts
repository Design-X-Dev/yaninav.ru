/** Данные глобала «Воспоминания» с сервера (Payload). */
export interface MemoriesSlide {
  id: number;
  image: string;
  text: string;
}

export interface MemoriesContent {
  heading: string;
  subheading: string;
  description: string;
  slides: MemoriesSlide[];
}
