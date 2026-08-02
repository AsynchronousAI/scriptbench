import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface NumberSequenceKeypoint {
	Time: number;
	Value: number;
	Envelope: number;
}

interface NumberSequencePickerProps extends CommonProps {
	Sequence: NumberSequenceKeypoint[];
	OnChange: (newSequence: NumberSequenceKeypoint[]) => void;
	Width?: UDim;
	Height?: UDim;
	Disabled?: boolean;
}

export const NumberSequencePicker: (props: NumberSequencePickerProps) => Element;
