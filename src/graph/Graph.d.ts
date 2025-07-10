/**
 * Interface for theme overrides.
 */
interface Theme {
  Name?: string;
  Background?: Color3;
  LightBackground?: Color3;
  Text?: Color3;
}

type Graph = {
  /** The number of points rendered on the graph. */
  Resolution: number;

  /** A dictionary of data sets to be graphed. */
  Data: { [key: string]: number[] };

  /** Wheteher or not the bottom of the grpah should start at zero (as opposed to the minimum value) */
  BaselineZero: boolean;

  /**
   * Set a theme to be used for the graph.
   * @param newTheme The theme to use
   */
  Theme(newTheme: Theme): void;

  /**
   * Render the graph
   */
  Render(): void;
};

interface GraphConstructor {
  readonly ClassName: "Graph";
  new (frame: Frame): Graph;
}

declare const Graph: GraphConstructor;

export = Graph;
