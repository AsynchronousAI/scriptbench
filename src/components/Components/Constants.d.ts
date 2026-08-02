interface IConstants {
	Font: Enum.Font.SourceSans;
	FontBold: Enum.Font.SourceSansBold;
	TextSize: 14;

	CheckboxAlignment: {
		Left: "Left";
		Right: "Right";
	};
	CheckboxIndeterminate: "Indeterminate";

	SplitterOrientation: {
		Horizontal: "Horizontal";
		Vertical: "Vertical";
	};
	ZIndex: {
		Dropdown: number;
		Tooltip: number;
	};
}

declare const Constants: IConstants;

export = Constants;
