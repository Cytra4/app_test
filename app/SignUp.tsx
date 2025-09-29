import { Button } from '@/components/Button';
import CustomInput from '@/components/CustomInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useForm } from '@/lib/hooks/useForm';
import { useSignUp } from '@/lib/supabase/auth';
import { hp, wp } from '@/scripts/constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function SignUp() {
	const [error, setError] = useState<string | null>("");
	const router = useRouter();

	const signUpForm = useForm({ username: '', email: '', password: '' });
	const signUpMutation = useSignUp();

	function SignUp() {
		const { username, email, password } = signUpForm.values;

		if (!username) {
			setError("請輸入使用者名稱");
			return;
		}
		if (!email || !password) {
			setError("請輸入信箱與密碼");
			return;
		}
		if (password.length < 6) {
			setError("密碼長度不能少於六位")
			return;
		}

		signUpMutation.mutate({
			email: email.trim(),
			password: password.trim(),
			username: username.trim(),
		});

		if (signUpMutation.isSuccess) {
			console.log("User create success.")
			setError(null);
		}
	}

	return (
		<ScreenWrapper bg="white">
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.container}>
					<Image
						source={require("../assets/images/thinking_emoji.png")}
						resizeMode="contain"
						style={styles.logo}
					/>

					<View style={{ marginBottom: hp(5) }}>
						<Text style={styles.title}>*那一天，人類回想起了被帳號支配的恐懼*</Text>
					</View>

					<View style={{ marginBottom: hp(3) }}>
						<Text style={styles.welcome}>馬上加入調查兵團</Text>
					</View>

					<CustomInput
						placeholder="使用者名稱"
						onChange={(t) => signUpForm.onChange('username', t)}
						boxStyle={{ marginBottom: 25 }}
						iconName='user'
					/>

					<CustomInput
						placeholder="信箱"
						onChange={(t) => signUpForm.onChange('email', t)}
						boxStyle={{ marginBottom: 25 }}
						iconName='mail'
						keyboardType='email-address'
					/>

					<CustomInput
						placeholder="密碼"
						onChange={(t) => signUpForm.onChange('password', t)}
						boxStyle={{}}
						iconName='lock'
						secureText={true}
					/>

					{error ? <Text style={styles.error}>{error}</Text> : null}

					<Button
						title="申請"
						buttonStyle={styles.button}
						loading={signUpMutation.isPending}
						onPress={SignUp}
					/>

					<View style={{ flexDirection: "row" }}>
						<Text style={styles.switchText}>已經有帳號了？</Text>
						<Text
							onPress={() => router.push("/login")}
							style={[styles.switchText, { fontWeight: "bold", color: "coral" }]}
						>
							登入帳號
						</Text>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScreenWrapper >
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
		paddingHorizontal: wp(4)
	},
	logo: {
		height: hp(20),
		width: wp(100),
		alignSelf: "center"
	},
	title: {
		fontSize: 30,
		fontWeight: "bold"
	},
	welcome: {
		fontSize: 25
	},
	switchText: {
		fontSize: 18,
	},
	button: {
		width: wp(50),
		marginTop: 25,
		marginBottom: 20
	},
	error: {
		color: "red",
		fontSize: 18,
		marginTop: 5
	}
})