const Theme = (settings().Studio as unknown as { Theme: StudioTheme }).Theme;
function c(color: Enum.StudioStyleGuideColor) {
  return Theme.GetColor(color);
}

export const COLORS = {
  Background: c(Enum.StudioStyleGuideColor.ScrollBarBackground),
  LightBackground: c(Enum.StudioStyleGuideColor.MainBackground),
  Border: c(Enum.StudioStyleGuideColor.Border),
  Text: c(Enum.StudioStyleGuideColor.SubText),
  DarkText: new Color3(0.12, 0.12, 0.12),
  Selected: c(Enum.StudioStyleGuideColor.LinkText),
  FocusText: c(Enum.StudioStyleGuideColor.MainText),
  ErrorText: c(Enum.StudioStyleGuideColor.ErrorText),
};

export function ShouldUseBlackText(backgroundColor: Color3): boolean {
  const r = backgroundColor.R * 255;
  const g = backgroundColor.G * 255;
  const b = backgroundColor.B * 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 128;
}
