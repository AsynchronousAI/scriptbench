import React from "react";
import { ScrollData, BarOrientation } from "./Types";

interface ScrollBarProps {
	BumpScroll: (scrollVector: Vector2) => void;
	Orientation: BarOrientation;
	ScrollData: React.Binding<ScrollData>;
	ScrollOffset: React.Binding<Vector2>;
	SetScrollOffset: (offset: Vector2) => void;
	Disabled?: boolean;
}

export function ScrollBar(props: ScrollBarProps): React.Element;
