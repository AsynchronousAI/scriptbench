/** Configurations */
export const VERSION_NUMBER = "3.0.0";

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
 * Hierarchy (bottom → top):
 *   GRID_LINES → BASE → CONTENT → CONTROLS → OVERLAY → TOOLTIP
 *
 * Every component explicitly sets its own ZIndex. Children always get
 * a higher ZIndex than their parent within the same zone. Each zone
 * (Sidebar, Results, Graph, etc.) offsets by +5 so sibling zones
 * never collide.
 */
export const ZINDEX = {
  /** Grid lines, decorations behind everything */
  GRID_LINES: -1,
  /** Default / unstyled elements */
  BASE: 1,
  /** Text, data display, general content */
  CONTENT: 10,
  /** Buttons, inputs, interactive controls */
  CONTROLS: 20,
  /** Trim frames, masks, decorative overlays */
  OVERLAY: 30,
  /** Hover tooltips, always on top */
  TOOLTIP: 40,
  /** Axis labels that must never be occluded */
  ALWAYS_ON_TOP: math.huge,

  /** Per-zone offsets: children get parent + offset */
  ZONE: {
    SIDEBAR: 5,
    RESULTS: 5,
    GRAPH: 5,
    MICROPROFILER: 5,
    SETTINGS: 5,
    DATAFRAME: 5,
  },
} as const;
