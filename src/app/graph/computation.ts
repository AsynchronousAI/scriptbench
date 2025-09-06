import { Object } from "@rbxts/luau-polyfill";
import { GraphAtoms } from "./atoms";
import { useAtom } from "@rbxts/react-charm";
import { DomainRange, GraphData } from "./types";

/* Handles math for rendering, like converting values to position */
export function AsPosition(
  Min: number,
  Max: number,
  Value: number,
  IsRange = false,
) {
  const value = math.map(Value, Min, Max, 0, 1);

  if (IsRange) {
    return 1 - value;
  }
  return value;
}
export function FromPosition(
  Min: number,
  Max: number,
  Value: number,
  IsRange = false,
) {
  if (IsRange) {
    Value = 1 - Value;
  }

  const value = math.map(Value, 0, 1, Min, Max);

  return math.max(value, 0);
}
export function FormatNumber(value: number, prefix?: string): string {
  return string.format("%.2f", value) + (prefix || "");
}
export function useDomainRange(
  data: GraphData,
  baseline: number = 0 /* set to math.huge to disable */,
): DomainRange {
  const zoom = useAtom(GraphAtoms.zoom);
  const focusedX = useAtom(GraphAtoms.focusedX);

  let domainMin = math.huge;
  let domainMax = -math.huge;
  let rangeMin = math.huge;
  let rangeMax = -math.huge;

  for (const series of Object.values(data)) {
    for (const [domain, range] of Object.entries(series.data)) {
      domainMin = math.min(domainMin, domain);
      domainMax = math.max(domainMax, domain);
      rangeMin = math.min(rangeMin, range);
      rangeMax = math.max(rangeMax, range);
    }
  }

  return {
    DomainMin: domainMin + focusedX,
    DomainMax: domainMin + focusedX + (domainMax - domainMin) / zoom,
    RangeMin: math.min(rangeMin, baseline),
    RangeMax: rangeMax,
    Domain: domainMax - domainMin,
    Range: rangeMax - rangeMin,
  };
}
export function InIncrements(
  Min: number,
  Max: number,
  Range: number,
  Amount: number,
) {
  let increment = Range / Amount;
  let increments = [];
  for (let i = Min; i <= Max; i += increment) {
    increments.push(i);
  }
  return increments;
}
