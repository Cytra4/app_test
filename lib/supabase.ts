import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { queryClient } from "./client";
import { useMutation, useQuery } from "@tanstack/react-query";

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
	useSignOut,
	useFetch,
	useFetchBuilder,
	useInsert,
	useDelete,
	useUpdate,
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
		queryKey: ['useFetch', table, options],
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
		staleTime: 1000 * 60, // fetch per 1 min
	});
}

function useFetchBuilder<T>(
	queryBuilder: () => any, // Supabase 查詢函數
	deps: any[] = [] // 用來觸發 refetch 的依賴值
) {
	return useQuery<T[], Error>({
		queryKey: ["useFetch", ...deps], // 把依賴值加入 queryKey
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
			queryClient.invalidateQueries({ queryKey: [table] });
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
			queryClient.invalidateQueries({ queryKey: [table] });
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
			queryClient.invalidateQueries({ queryKey: [table] });
		},
		onError: (error: any) => {
			console.error("Update failed:", error.message);
		},
	});
}