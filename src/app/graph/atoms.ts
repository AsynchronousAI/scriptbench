import { atom } from "@rbxts/charm";

export namespace GraphAtoms {
  export const zoom = atom(4);
  export const focusedX = atom(0);
  export const hoveringLine = atom<
    | {
        text?: string;
        position: Vector2;
        color: Color3;
      }
    | undefined
  >();
}
