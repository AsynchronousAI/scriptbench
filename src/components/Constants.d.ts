/**
 * @class Constants
 * This module exposes values that are read from in various components.
 * These can be used to, for example, match the appearance of custom components with components
 * from this library.
 *
 * @warning
 * The table returned by this module is read-only. It is not a config.
 */

declare namespace Constants {
	/** The default font for text. */
	const DefaultFont: Enum.Font;

	/** The default size for text. */
	const DefaultTextSize: number;

	/** The default height of buttons. */
	const DefaultButtonHeight: number;

	/** The default height of toggles (Checkbox and RadioButton). */
	const DefaultToggleHeight: number;

	/** The default height of text and numeric inputs. */
	const DefaultInputHeight: number;

	/** The default height of sliders. */
	const DefaultSliderHeight: number;

	/** The default height of the permanent section of dropdowns. */
	const DefaultDropdownHeight: number;

	/** The default height of rows in dropdown lists. */
	const DefaultDropdownRowHeight: number;

	/** The default height of progress bars. */
	const DefaultProgressBarHeight: number;

	/** The default window size of color pickers. */
	const DefaultColorPickerSize: UDim2;

	/** The default window size of number sequence pickers. */
	const DefaultNumberSequencePickerSize: UDim2;

	/** The default window size of date pickers. */
	const DefaultDatePickerSize: UDim2;
}

export = Constants;
