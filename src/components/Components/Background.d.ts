import { Element } from "@rbxts/react";

type IBackgroundProps = Partial<
    Pick<Frame, "Size" | "Position" | "AnchorPoint" | "LayoutOrder" | "ZIndex">
>;

export const Background: (props: IBackgroundProps) => Element;
