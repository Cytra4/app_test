import { Profile } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

export function useProfile() {
	return useQuery<Profile | null, Error>({
		queryKey: ["useProfile"],
		queryFn: async () => {
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;

			const user = userData.user;
			if (!user) return null;

			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (profileError) throw profileError;
			return profile;
		},
	});
}
