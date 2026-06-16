import { mountTankWorld } from "./tankWorld";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root.");
}

mountTankWorld(root);
