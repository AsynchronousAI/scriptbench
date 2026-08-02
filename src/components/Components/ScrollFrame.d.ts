import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

type IScrollFrame = CommonProps &
	Partial<
		{
			Disabled: boolean;
			OnScrolled: (pos: Vector2) => void;
			Layout: Partial<UIListLayout>;
			PaddingLeft?: UDim;
			PaddingRight?: UDim;
			PaddingTop?: UDim;
			PaddingBottom?: UDim;
		} & Pick<
			ScrollingFrame,
			"AnchorPoint" | "BorderSizePixel" | "LayoutOrder" | "Position" | "ScrollingDirection" | "Size" | "ZIndex"
		>
	>;

export const ScrollFrame: (props: IScrollFrame) => Element;
