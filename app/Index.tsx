import { ScreenWrapper } from '@/components/ScreenWrapper';
import { SupabaseHooks } from '@/lib/supabase';
import { useAuth } from '@/scripts/AuthContext';
import { wp } from '@/scripts/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
	const { user, setAuth } = useAuth();

	const signOutMutation = SupabaseHooks.useSignOut();

	const { data: profile } = SupabaseHooks.useProfile();

	return (
		<ScreenWrapper bg="white">
			<View style={styles.container}>
				<Text>名稱：{profile?.username}</Text>
				<Text>權限：{profile?.role === 'user' ? '一般使用者' : '管理員'}</Text>
				<Text
					onPress={() => signOutMutation.mutate()}
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