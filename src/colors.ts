const Theme = (settings().Studio as unknown as { Theme: StudioTheme }).Theme;
function c(color: Enum.StudioStyleGuideColor) {
  return Theme.GetColor(color);
}

export const COLORS = {
  Background: c(Enum.StudioStyleGuideColor.ScrollBarBackground),
  LightBackground: c(Enum.StudioStyleGuideColor.MainBackground),
  Border: c(Enum.StudioStyleGuideColor.Border),
  Text: c(Enum.StudioStyleGuideColor.SubText),
  DarkText: c(Enum.StudioStyleGuideColor.MainText),
  Selected: c(Enum.StudioStyleGuideColor.LinkText),
  FocusText: c(Enum.StudioStyleGuideColor.MainText),
  ErrorText: c(Enum.StudioStyleGuideColor.ErrorText),
};
