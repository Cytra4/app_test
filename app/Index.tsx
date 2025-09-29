import { Button } from '@/components/Button';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { useSignOut } from '@/lib/supabase/auth';
import { useProfile } from '@/lib/supabase/models/profile';
import { useFetch, useInsert } from '@/lib/supabase/query';
import { useAuth } from '@/scripts/AuthContext';
import { wp } from '@/scripts/constants';
import { Group } from '@/types/supabase';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
	const { user, setAuth } = useAuth();

	const signOutMutation = useSignOut();
	const { data: profile } = useProfile();

	const insertMutation = useInsert();
	const { data: groups } = useFetch<Group>('groups', {
		order: [{ column: 'created_at', ascending: false }]
	});

	return (
		<ScreenWrapper bg="white">
			<View style={styles.container}>
				<Text>名稱：{profile?.username}</Text>
				<Text>權限：{profile?.role === 'user' ? '一般使用者' : profile?.role === 'admin' ? '管理員' : "未知"}</Text>
				<Text
					onPress={() => signOutMutation.mutate()}
					style={{ fontSize: 20 }}
				>
					登出
				</Text>
				<Button
					title='Add Group'
					onPress={() => {
						insertMutation.mutate({
							table: 'groups', row: {
								name: `By ${profile?.username}`,
								created_by: profile?.user_id
							}
						});
					}}
					loading={insertMutation.isPending}
				></Button>
				<FlatList
					data={groups}
					keyExtractor={(group) => group.id}
					renderItem={({ item }) => (
						<View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
							<Pressable>
								<Text>{item.name}</Text>
							</Pressable>
						</View>
					)}
				></FlatList>
			</View >
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
})