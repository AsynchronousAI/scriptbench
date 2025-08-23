import { atom } from "@rbxts/charm";

export const GraphAtoms = {
  zoom: atom(4),
  focusedX: atom(0),
  hoveringLine: atom<
    | {
        text?: string;
        position: Vector2;
        color: Color3;
      }
    | undefined
  >(),
};
