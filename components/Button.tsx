import { hp } from "@/scripts/constants";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Loading } from "./Loading";

//custom button
export function Button({
	buttonStyle = {},
	textStyle = {},
	title = "",
	onPress = () => { },
	loading = false,
	hasShadow = true
}) {
	const shadowStyle = {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4
	}

	if (loading) {
		return (
			<View style={[styles.button, buttonStyle, { backgroundColor: "white" }]}>
				<Loading />
			</View>
		)
	}
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.button, buttonStyle, hasShadow && shadowStyle]}
		>
			<Text style={[styles.text, textStyle]}>{title}</Text>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "coral",
		height: hp(6.5),
		justifyContent: "center",
		alignItems: "center",
		borderCurve: "continuous",
		borderRadius: 15
	},
	text: {
		fontSize: hp(2.5),
		fontWeight: "bold",
		color: "white"
	}
})