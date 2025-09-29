import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useJoinGroup() {
	return useMutation({
		mutationFn: async ({ groupCode }: { groupCode: string }) => {
			// 取得使用者
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError || !userData.user)
				throw new Error("尚未取得使用者資料");
			const userId = userData.user.id;

			// 查詢群組
			const { data: group, error: groupError } = await supabase
				.from('groups')
				.select('id, join_code')
				.eq('join_code', groupCode)
				.single();
			if (groupError || !group)
				throw new Error("找不到該小組代碼");

			// 嘗試加入
			const { error: insertError } = await supabase.from('group_members').insert({
				group_id: group.id,
				user_id: userId
			});

			if (insertError?.code === '23505')
				throw new Error("你已經加入過這個小組了");
			if (insertError) throw insertError;

			return group;
		},
		onError: (error: any) => {
			console.error("加入小組失敗:", error.message);
		},
		onSuccess: (data) => {
			console.log("加入小組成功:", data);
		},
	});
}