import Feather from "@expo/vector-icons/Feather";
import JoinGroup from "./JoinGroup";

export default function IndexHeader() {
	return (
		<>
			<JoinGroup />
			<Feather
				name="settings"
				size={24}
				style={{ marginRight: 16 }}
				onPress={() => {
					// TODO: navigate to settings
				}}
			/>
		</>
	);
}
