/** Configurations */
export const VERSION_NUMBER = "3.1.0";

/* App UI */
export const SIDEBAR_WIDTH = 0.15;
export const RESULTS_WIDTH = 0.2;
export const MICROPROFILER_HEIGHT = 0.2;
export const TITLE_HEIGHT = 0.035;

/* Graph UI */
export const LABEL_THICKNESS = 0.075;
export const DOMAIN_LABELS = 5;
export const RANGE_LABELS = 5;
export const LINE_WIDTH = 2.5;
export const LABEL_TEXT_SIZE = 16;
export const GRADIENT_RES = 1024;

/* ZIndex Layer Constants
 *
 * Only used for elements that need explicit layering.
 * Most elements rely on default Roblox rendering order.
 */
export const ZINDEX = {
  /** Grid lines, behind content */
  GRID_LINES: 1,
  /** Buttons, interactive controls */
  CONTROLS: 35,
  /** Trim frames, masks, decorative overlays */
  OVERLAY: 30,
  /** Hover tooltips, always on top */
  TOOLTIP: 40,
  /** Axis labels that must never be occluded */
  ALWAYS_ON_TOP: math.huge,
} as const;
