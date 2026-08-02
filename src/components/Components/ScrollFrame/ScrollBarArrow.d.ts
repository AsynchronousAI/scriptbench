import React from "react";
import { BarOrientation } from "./Types";

interface ScrollBarArrowProps {
	BumpScroll: (scrollVector: Vector2) => void;
	Orientation: BarOrientation;
	Side: number;
	Position?: UDim2;
	AnchorPoint?: Vector2;
	Disabled?: boolean;
}

export function ScrollBarArrow(props: ScrollBarArrowProps): React.ReactElement;
