import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { queryClient } from "./client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

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

export function useForm<T>(initial: T) {
	const [values, setValues] = useState(initial);

	const onChange = (key: keyof T, value: any) => {
		setValues((prev) => ({ ...prev, [key]: value }));
	};

	const reset = () => setValues(initial);

	return { values, onChange, setValues, reset };
}

export const SupabaseHooks = {
	useSignUp,
	useFetch,
	useInsert,
	useDelete,
};

// export function useFetchTest<T>(
//     table: string,
//     filter?: Record<string, string | number>,
//     limit?: number,
// ) {
//     return useQuery<T[], Error>({
//         queryKey: ['useFetchTest'],
//         queryFn: async () => {
//             const query = supabase.from(table).select('*');

//             query.limit(-1);
//         }
//     });
// }

export function useFetch<T>(
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

function useInsert() {
	return useMutation({
		mutationFn: async ({ table, row }: {
			table: string;
			row: Record<string, any>;
		}) => {
			const { data, error } = await supabase.from(table).insert(row).select();

			if (error) throw error;
			console.log("Inserted data:", data);

			return data ?? [];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: [table] });
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
			const { data, error } = await supabase
				.from(table)
				.delete()
				.eq(column, value)
				.select();

			if (error) throw error;
			console.log("Deleted data:", data);

			return (data ?? []) as T[];
		},
		onSuccess: (_, { table }) => {
			queryClient.invalidateQueries({ queryKey: [table] });
		},
	});
}

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
			console.log("註冊成功:", data);

			return data;
		},
	});
}

// async function signIn(email: string, password: string) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//     })

//     if (error) {
//         console.error('登入失敗:', error.message)
//     } else {
//         console.log('登入成功:')
//     }
// }
