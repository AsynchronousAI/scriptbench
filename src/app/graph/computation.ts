import { Object } from "@rbxts/luau-polyfill";
import { GraphAtoms } from "./atoms";
import { useAtom } from "@rbxts/react-charm";
import { DomainRange, GraphData } from "./types";
import { useMemo } from "@rbxts/react";

export function AsPosition(
  Min: number,
  Max: number,
  Value: number,
  IsRange = false,
) {
  const value = math.map(Value, Min, Max, 0, 1);
  return IsRange ? 1 - value : value;
}

export function FromPosition(
  Min: number,
  Max: number,
  Value: number,
  IsRange = false,
) {
  const mapped = math.map(IsRange ? 1 - Value : Value, 0, 1, Min, Max);
  return math.max(mapped, 0);
}

export function FormatNumber(value: number, prefix?: string): string {
  return string.format("%.2f", value) + (prefix ?? "");
}

export function useDomainRange(
  data: GraphData,
  baseline = 0 /* set to math.huge to disable baseline */,
): DomainRange {
  const zoom = useAtom(GraphAtoms.zoom);
  const focusedX = useAtom(GraphAtoms.focusedX);

  return useMemo(() => {
    let domainMin = 1;
    let domainMax = -1;
    let rangeMin = 1;
    let rangeMax = -1;

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
      FullDomainMin: domainMin,
      FullDomainMax: domainMax,
    };
  }, [data, focusedX, zoom, baseline]);
}

export function InIncrements(
  min: number,
  max: number,
  range: number,
  amount: number,
) {
  if (
    min === math.huge ||
    max === math.huge ||
    range === math.huge ||
    amount === math.huge
  ) {
    return [];
  }
  if (range === 0 || amount === 0) {
    return table.create(amount, min);
  }

  const increment = range / amount;
  const length = math.floor((max - min) / increment) + 1;

  const increments = new Array<number>(length);

  for (let i = 0; i < length; i++) {
    increments[i] = min + i * increment;
  }

  return increments;
}
