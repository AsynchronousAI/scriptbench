import React from "@rbxts/react";

function App() {
	return (
		<textlabel
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			Text="Hello world!"
			TextScaled={true}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextStrokeTransparency={0.7}
			Size={new UDim2(1, 0, 1, 0)}
			Position={new UDim2(0.5, 0, 0.5, 0)}
		/>
	);
}

export default App;
