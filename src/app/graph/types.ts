/** Types */
export type GraphData = {
  name: string;
  data: { [key: number]: number };
  highlightedX?: number;
}[];
export interface GraphProps {
  Data: GraphData;
  XPrefix?: string;
  YPrefix?: string;
}
export interface DomainRange {
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
  Domain: number;
}
