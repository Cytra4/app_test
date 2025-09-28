import { StatusBar, View } from "react-native";

//screen wrapper so stuffs don't get covered by status bar
export function ScreenWrapper({ children, bg }: { children: any, bg: string }) {
	const top = StatusBar.currentHeight;
	return (
		<View style={{ paddingTop: top, flex: 1, backgroundColor: bg }}>
			{children}
		</View>
	)
}