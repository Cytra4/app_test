import { useJoinGroup } from '@/lib/supabase/models/group';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function JoinGroup({ code }: { code?: string }) {
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [groupCode, setGroupCode] = useState<string>(code ?? "");

	const joinGroupMutation = useJoinGroup();

	const handleJoin = () => {
		if (!groupCode) {
			setError('小組代碼不得為空');
		} else {
			joinGroupMutation.mutate({ groupCode: groupCode.trim() }, {
				onError: (error: any) => setError(error.message),
				onSuccess: () => modalClose()
			});
		}
	};

	function modalOpen() {
		setGroupCode(code ?? "")
		setError("");
		setModalVisible(true);
	}

	function modalClose() {
		setModalVisible(false);
	}

	return (
		<View>
			<Feather
				name="plus-square"
				size={28}
				style={{ marginRight: 16 }}
				onPress={modalOpen}
			/>

			<Modal
				transparent={true}
				animationType="fade"
				visible={modalVisible}
				onRequestClose={modalClose}
				statusBarTranslucent={true}
			>
				<TouchableWithoutFeedback>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalTitle}>加入小組</Text>

							<TextInput
								style={[styles.input, error ? styles.errorInput : {}]}
								placeholder="輸入小組代碼"
								value={groupCode}
								onChangeText={setGroupCode}
							/>

							{error ? <Text style={styles.error}>{error}</Text> : null}

							<View style={styles.buttonRow}>
								<Pressable style={[styles.button, styles.cancel]} onPress={modalClose}>
									<Text style={styles.buttonText}>取消</Text>
								</Pressable>

								<Pressable style={[styles.button, styles.join]}
									onPress={handleJoin}
									disabled={joinGroupMutation.isPending}
								>
									<Text style={styles.buttonText}>加入</Text>
								</Pressable>
							</View>

						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View >
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.3)",

	},
	modalView: {
		width: "80%",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	input: {
		width: "100%",
		borderWidth: 1.5,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginBottom: 15,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	button: {
		flex: 1,
		marginHorizontal: 5,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	cancel: {
		backgroundColor: "#888787ff",
	},
	join: {
		backgroundColor: "coral",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
	error: {
		color: "#E43636",
		marginBottom: 15,
		fontWeight: "bold"
	},
	errorInput: {
		borderColor: "#E43636"
	}
});
