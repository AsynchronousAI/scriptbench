import { useEffect, useState } from "@rbxts/react";
import { AssetService } from "@rbxts/services";
import React from "@rbxts/react";

const GRADIENT_SIZE = 1024;

/** Gradient Cache */
const gradientLUT: number[] = table.create(GRADIENT_SIZE);

for (let i = 0; i < GRADIENT_SIZE; i++) {
  const value = math.map(i, 0, GRADIENT_SIZE - 1, 0.1, 0.9);
  gradientLUT[i] = math.floor(value * 255);
}

function greedyMesh(
  resolution: Vector2,
  y: number,
  func: (x: number) => number,
) {
  /*
    hello reader! if you are new to greedy meshing,
    check out this: https://usaco.guide/bronze/intro-greedy?lang=py
  */

  const meshes: [number, number][] =
    []; /* first number is start, second is end */

  let prev = 0;
  let prevWithinBounds = false;
  for (const x of $range(0, resolution.X)) {
    if (x < 0 || x >= resolution.X || y < 0 || y >= resolution.Y) continue;

    const maxY = math.floor(func(x / resolution.X) * resolution.Y);
    const withinBounds = y > maxY;

    if (prevWithinBounds !== withinBounds) {
      /* x is a turning point */
      if (!withinBounds) meshes.push([prev, x]);
      prev = x;
    }
    prevWithinBounds = withinBounds;
  }

  return meshes;
}

export function EditableImageGradient(props: {
  Color: Color3;
  Function: (x: number) => number;
}) {
  const [image] = useState(
    AssetService.CreateEditableImage({ Size: Vector2.one.mul(GRADIENT_SIZE) }),
  );

  useEffect(() => {
    const resolution = image.Size;

    for (const y of $range(0, resolution.Y)) {
      const meshes = greedyMesh(resolution, y, props.Function);
      const opacity = (gradientLUT[y] ?? 1) / 255;

      for (const mesh of meshes) {
        image.DrawRectangle(
          new Vector2(mesh[0], y),
          new Vector2(mesh[1] - mesh[0], 10),
          props.Color,
          opacity,
          "Overwrite",
        );
      }
    }

    return () => {
      image.DrawRectangle(
        new Vector2(0, 0),
        resolution,
        new Color3(1, 1, 1),
        1,
        "Overwrite",
      );
    };
  }, [props.Function]);

  return (
    <imagelabel
      BackgroundTransparency={1}
      Size={new UDim2(1, 0, 1, 0)}
      ImageContent={Content.fromObject(image)}
    />
  );
}
