import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "./client";

const supabaseUrl = "https://eorzockecnnafbeghvnq.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcnpvY2tlY25uYWZiZWdodm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDYwNzMsImV4cCI6MjA3MzIyMjA3M30.y3nZkdvDEFiLxO69wdB9EnUsTzbtUUGIOhxBG9UT5mc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		lock: processLock,
	},
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== "web") {
	AppState.addEventListener("change", (state) => {
		if (state === "active") {
			supabase.auth.startAutoRefresh();
		} else {
			supabase.auth.stopAutoRefresh();
		}
	});
}

export const SupabaseHooks = {
	useSignUp,
	useSignIn,
	useSignOut,
	useFetch,
	useFetchBuilder,
	useInsert,
	useDelete,
	useUpdate,
	useProfile,
};

function useSignUp() {
	return useMutation({
		mutationFn: async ({ email, password, username }: {
			email: string;
			password: string;
			username: string;
		}) => {
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					data: { username: username },
				},
			});
			if (error) throw error;

			return data;
		},
		onError: (error: any) => {
			console.error("Sign up failed:", error.message);
		},
	});
}

function useSignIn() {
	return useMutation({
		mutationFn: async ({ email, password }: {
			email: string;
			password: string;
		}) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});
			if (error) throw error;

			return data;
		},
		onSuccess: () => {
			console.log("Sign in success.");
		},
		onError: (error: any) => {
			console.error("Sign in failed:", error.message);
		},
	});
}

function useSignOut() {
	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			return true;
		},
		onSuccess: () => {
			console.log("Sign out success");
			queryClient.clear(); // clear react-query cache
		},
		onError: (error: any) => {
			console.error("Sign out failed:", error.message);
		},
	});
}

type FetchOptions = {
	select?: string;
	limit?: number;
	filter?: Record<string, string | number>;
	order?: { column: string; ascending?: boolean }[];
	search?: { column: string; value: string | number };
};
function useFetch<T>(
	table: string,
	options: FetchOptions = { select: '*' }
) {
	return useQuery<T[], Error>({
		queryKey: ['fetch', table, options],
		queryFn: async () => {
			let query = supabase.from(table).select(options.select);

			if (options.filter) {
				for (const [key, value] of Object.entries(options.filter)) {
					query = query.eq(key, value);
				}
			}

			if (options.search) {
				const { column, value } = options.search;
				if (typeof value === 'number') {
					query = query.eq(column, value);
				} else {
					query = query.ilike(column, `%${value}%`);
				}
			}

			if (options.limit) query = query.limit(options.limit);

			if (options.order) {
				options.order.forEach(o => {
					query = query.order(o.column, { ascending: o.ascending ?? true });
				});
			}

			const { data, error } = await query;
			if (error) throw error;

			return (data ?? []) as T[];
		},
		staleTime: 1000 * 60 * 5, // fetch per 5 min
		refetchOnWindowFocus: false, // 窗口 / app 返回前台時自動刷新
		refetchOnMount: false,       // component mount 時自動刷新
	});
}

function useFetchBuilder<T>(
	queryBuilder: () => any, // Supabase 查詢函數
	deps: any[] = [] // 用來觸發 refetch 的依賴值
) {
	return useQuery<T[], Error>({
		queryKey: ["fetch", ...deps], // 把依賴值加入 queryKey
		queryFn: async () => {
			const query = queryBuilder();

			const { data, error } = await query;
			if (error) throw error;

			return (data ?? []) as T[];
		},
	});
}

function useInsert<T>() {
	return useMutation({
		mutationFn: async ({ table, row }: {
			table: string;
			row: Record<string, any>;
		}) => {
			const { data, error } = await supabase.from(table).insert(row).select();
			if (error) throw error;

			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ['fetch', table] });
		},
		onError: (error: any) => {
			console.error("Insert failed:", error.message);
		},
	});
}

function useDelete<T>() {
	return useMutation({
		mutationFn: async ({ table, column, value }: {
			table: string;
			column: string;
			value: string | number;
		}) => {
			const { data, error } = await supabase.from(table).delete().eq(column, value).select();
			if (error) throw error;

			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ['fetch', table] });
		},
		onError: (error: any) => {
			console.error("Delete failed:", error.message);
		},
	});
}

function useUpdate<T>() {
	return useMutation({
		mutationFn: async ({ table, column, value, newRow }: {
			table: string;
			column: string;
			value: string | number;
			newRow: Record<string, any>;
		}) => {
			const { data, error } = await supabase.from(table).update(newRow).eq(column, value).select();
			if (error) throw error;

			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: ['fetch', table] });
		},
		onError: (error: any) => {
			console.error("Update failed:", error.message);
		},
	});
}

export type Profile = {
	user_id: string;
	username: string;
	role: string;
	phone?: string;
	created_at: string;
};
function useProfile() {
	return useQuery<Profile | null, Error>({
		queryKey: ['useProfile'],
		queryFn: async () => {
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;

			const user = userData.user;
			if (!user) return null;

			const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
			if (profileError) throw profileError;

			return profile;
		}
	});
}