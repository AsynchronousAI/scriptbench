import { useEffect, useState } from "@rbxts/react";
import { AssetService } from "@rbxts/services";
import React from "@rbxts/react";

/* Main */
const GRADIENT_SIZE = 256;

const gradientLUT: number[] = table.create(GRADIENT_SIZE);
for (let i = 0; i < GRADIENT_SIZE; i++) {
  /* linear gradient (0.9 -> 0.1) */
  gradientLUT[i] = math.floor(
    (((GRADIENT_SIZE - i - 1) / (GRADIENT_SIZE - 1)) * 0.8 + 0.1) * 255,
  );
}
export function EditableImageGradient(props: {
  Color: Color3;
  Function: (x: number) => number;
}) {
  /* precompute the color into a partial u32, opacity written later */
  const r = math.floor(props.Color.R * 255);
  const g = math.floor(props.Color.G * 255);
  const b = math.floor(props.Color.B * 255);
  const colorBits = (b << 16) | (g << 8) | r;

  const [image] = useState(
    AssetService.CreateEditableImage({ Size: Vector2.one.mul(GRADIENT_SIZE) }),
  );

  useEffect(() => {
    const resolution = image.Size;
    const imageBuffer = image.ReadPixelsBuffer(Vector2.zero, resolution);

    for (const x of $range(0, resolution.X)) {
      const maxY = math.floor(props.Function(x / resolution.X) * resolution.Y);

      for (const y of $range(maxY, resolution.Y)) {
        if (x < 0 || x >= resolution.X || y < 0 || y >= resolution.Y) continue;

        const opacity = gradientLUT[y];
        const pixel = colorBits | (opacity << 24);
        const memoryPos = 4 * (y * resolution.X + x);

        buffer.writeu32(imageBuffer, memoryPos, pixel);
      }
    }

    image.WritePixelsBuffer(Vector2.zero, resolution, imageBuffer);

    return () => {
      image.WritePixelsBuffer(
        Vector2.zero,
        resolution,
        buffer.create(buffer.len(imageBuffer)),
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
