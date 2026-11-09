import type { SlideDef } from "../deck/Deck";
import { apiSlides } from "./api";
import { closingSlides } from "./closing";
import { conceptSlides } from "./concepts";
import { demoSlides } from "./demos";
import { introSlides } from "./intro";
import { platformSlides } from "./platforms";

export const SLIDES: SlideDef[] = [
  ...introSlides,
  ...conceptSlides,
  ...platformSlides,
  ...apiSlides,
  ...demoSlides,
  ...closingSlides,
];
