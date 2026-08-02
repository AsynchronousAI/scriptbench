/**
 * @class CommonProps
 * @private
 *
 * The props listed here are accepted by every component except where explicitly noted.
 * These props are accepted in addition to the props specified by components on their API pages.
 *
 * @remarks
 * This file is not exported and serves only to host an internal type and documentation.
 */

/**
 * @interface CommonProps
 */
export interface CommonProps {
	/** @field */
	Disabled?: boolean;
	/** @field */
	AnchorPoint?: Vector2;
	/** @field */
	Position?: UDim2;
	/** @field */
	Size?: UDim2;
	/** @field */
	LayoutOrder?: number;
	/** @field */
	ZIndex?: number;
}

export type T = CommonProps;
