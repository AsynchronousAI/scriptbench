import { Settings } from "settings";

export const Theme = (settings().Studio as unknown as { Theme: StudioTheme })
  .Theme;

function c(color: Enum.StudioStyleGuideColor) {
  return Theme.GetColor(color);
}

export const COLORS = {
  Background: c(Enum.StudioStyleGuideColor.MainBackground),
  LightBackground: c(Enum.StudioStyleGuideColor.ScrollBarBackground),
  Border: c(Enum.StudioStyleGuideColor.Border),
  Text: c(Enum.StudioStyleGuideColor.SubText),
  DarkText: new Color3(0.12, 0.12, 0.12),
  Selected: c(Enum.StudioStyleGuideColor.LinkText),
  FocusText: c(Enum.StudioStyleGuideColor.MainText),
  ErrorText: c(Enum.StudioStyleGuideColor.ErrorText),
};

const HUES = [0, 35, 60, 100, 175, 235, 305];
export function GetKeyColor(
  index: number,
  sat: number = Settings.GetSetting("LineSat") / 100,
  value: number = Settings.GetSetting("LineVal") / 100,
): Color3 {
  const hue = HUES[(index - 1) % HUES.size()] / 355; /* who uses 355 range  */
  return Color3.fromHSV(hue, sat, value);
}
export function LightenColor(color: Color3, amount: number = 0.015): Color3 {
  const [h, s, v] = color.ToHSV();

  const newV = math.clamp(v + amount, 0, 1);
  const newS = math.clamp(s - amount * 2, 0, 1);

  return Color3.fromHSV(h, newS, newV);
}
