import { useEffect, useMemo, useState } from "@rbxts/react";
import { AssetService } from "@rbxts/services";
import React from "@rbxts/react";
import { GRADIENT_RES } from "configurations";

/* Main */
const gradientLUT: number[] = table.create(GRADIENT_RES);
for (let i = 0; i < GRADIENT_RES; i++) {
  gradientLUT[i] = math.floor(math.map(i, 0, GRADIENT_RES - 1, 0.5, 0) * 255);
}

export function EditableImageGradient(props: {
  Color: Color3;
  Function: (x: number) => number;
  ZIndex: number;
  StartClock: number;
  Label: string;
}) {
  const r = math.floor(props.Color.R * 255);
  const g = math.floor(props.Color.G * 255);
  const b = math.floor(props.Color.B * 255);
  const colorBits = (b << 16) | (g << 8) | r;

  const [image] = useState(
    AssetService.CreateEditableImage({ Size: Vector2.one.mul(GRADIENT_RES) }),
  );

  const gradientCol = useMemo(() => {
    const col = buffer.create(4 * GRADIENT_RES);
    for (const y of $range(0, GRADIENT_RES - 1)) {
      buffer.writeu32(col, 4 * y, colorBits | (gradientLUT[y] << 24));
    }
    return col;
  }, [colorBits]);
  const sliceLUT = useMemo(() => {
    const lut = table.create(GRADIENT_RES) as buffer[];
    for (const height of $range(1, GRADIENT_RES)) {
      const maxY = GRADIENT_RES - height;
      const slice = buffer.create(4 * height);
      buffer.copy(slice, 0, gradientCol, 4 * maxY, 4 * height);
      lut[height] = slice;
    }
    return lut;
  }, [gradientCol]);

  useEffect(() => {
    const resolution = image.Size;

    for (const x of $range(0, resolution.X - 1)) {
      const maxY = math.clamp(
        math.floor(props.Function(x / resolution.X) * resolution.Y),
        0,
        resolution.Y,
      );
      const height = resolution.Y - maxY;
      if (height <= 0) continue;

      image.WritePixelsBuffer(
        new Vector2(x, maxY),
        new Vector2(1, height),
        sliceLUT[height],
      );
    }

    print(
      `[EditableImage] ${props.Label}: ${string.format("%.2f", (os.clock() - props.StartClock) * 1000)}ms total`,
    );

    return () => {
      image.WritePixelsBuffer(
        Vector2.zero,
        resolution,
        buffer.create(4 * resolution.X * resolution.Y),
      );
    };
  }, [props.Function, sliceLUT]);

  return (
    <imagelabel
      BackgroundTransparency={1}
      Size={new UDim2(1, 0, 1, 0)}
      ImageContent={Content.fromObject(image)}
      ZIndex={props.ZIndex}
    />
  );
}
