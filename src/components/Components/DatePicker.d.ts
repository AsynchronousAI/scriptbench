import { Element } from "@rbxts/react";
import { CommonProps } from "../CommonProps";

interface TimeData {
	Year: number;
	Month: number;
	Day: number;
}

interface DatePickerProps extends CommonProps {
	Date: DateTime;
	OnChanged?: (newDate: DateTime) => void;
}

export const DatePicker: (props: DatePickerProps) => Element;
