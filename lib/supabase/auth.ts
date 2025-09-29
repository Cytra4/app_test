import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { supabase } from "./client";

export function useSignUp() {
	return useMutation({
		mutationFn: async ({ email, password, username, }: {
			email: string;
			password: string;
			username: string;
		}) => {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { username } },
			});
			if (error) throw error;
			return data;
		},
	});
}

export function useSignIn() {
	return useMutation({
		mutationFn: async ({ email, password, }: {
			email: string;
			password: string;
		}) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			return data;
		},
	});
}

export function useSignOut() {
	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			return true;
		},
		onSuccess: () => {
			queryClient.clear();
		},
	});
}
