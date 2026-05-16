import type { RefObject } from 'react';

export type MoonDomRefs = {
  ambient: RefObject<HTMLDivElement | null>;
  introSky: RefObject<HTMLDivElement | null>;
  moon: RefObject<HTMLDivElement | null>;
};
