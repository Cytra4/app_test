import { ScreenWrapper } from '@/components/ScreenWrapper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/scripts/AuthContext';
import { wp } from '@/scripts/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
	const { user, setAuth } = useAuth();

	async function SignOut() {
		const { error } = await supabase.auth.signOut();
		if (error) console.log("Sign out failed.")
		else {
			console.log("Sign out success.")
		};
	}

	return (
		<ScreenWrapper bg="white">
			<View style={styles.container}>
				<Text
					onPress={SignOut}
					style={{ fontSize: 20 }}
				>
					登出
				</Text>
			</View>
		</ScreenWrapper>
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
})