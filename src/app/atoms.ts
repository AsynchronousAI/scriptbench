import { atom } from "@rbxts/charm";

export const Atoms = {
  hoveringLine: atom<
    | {
        text: string;
        position: Vector2;
        color: Color3;
      }
    | undefined
  >(),
};
