export interface HeroVideoSource {
  src: string;
  type: string;
}

export interface HeroContent {
  overlayText: string;
  poster: string;
  sources: HeroVideoSource[];
}
