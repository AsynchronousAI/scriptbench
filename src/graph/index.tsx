import React, { useRef, useEffect } from "@rbxts/react";
import Graph, { Theme } from "./Graph";

interface GraphProps {
  Resolution: number;
  Data: { [key: string]: number[] };
  BaselineZero: boolean;
  Theme?: Theme;
}
function ReactGraph(props: GraphProps) {
  const frameRef = useRef<Frame>(undefined);

  /** hacky way to mount the Graph as a react component. */
  let graph: Graph;
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || graph) return;

    graph = new Graph(frame);
  }, []);

  /** Edit graph props whenever our props change */
  useEffect(() => {
    if (!graph) return;

    graph.Resolution = props.Resolution;
    graph.Data = props.Data;
    graph.BaselineZero = props.BaselineZero;
    if (props.Theme) graph.Theme(props.Theme);

    graph.Render(); /* disabled automatic rerendering. */
  });

  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      BackgroundTransparency={1}
      ref={frameRef}
    />
  );
}

export default ReactGraph;
