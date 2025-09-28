//shows the loading spin

import { ActivityIndicator, View } from "react-native";

//adding this to prevent error coming up from size
type LoadingProps = {
	size?: "small" | "large" | number;
	color?: string;
};

export function Loading({ size = "large", color = "coral" }: LoadingProps) {
	return (
		<View style={{ justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size={size} color={color} />
		</View>
	)
}