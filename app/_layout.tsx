import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../scripts/AuthContext";
import { GetUserData } from "../scripts/UserService.js";
import Index from "./index";
import Login from "./login";
import SignUp from "./signUp";

import IndexHeader from "@/components/IndexHeader";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase/client";
import { QueryClientProvider } from '@tanstack/react-query';

const Stack = createNativeStackNavigator();

export default function _layout() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RootLayout />
			</AuthProvider>
		</QueryClientProvider>
	)
}

function RootLayout() {
	const { user, setAuth, setUserData } = useAuth();

	//*useEffect((),[]) -> Only trigger once
	useEffect(() => {
		supabase.auth.onAuthStateChange((_event, session) => {
			//console.log(`User: ${session?.user?.user_metadata?.name}`);

			//Set user when login success
			if (session) {
				setAuth(session?.user);
				updateUserData(session?.user);
			}
			else {
				setAuth(null);
			}
		})
	}, []);

	async function updateUserData(user: User) {
		let res = await GetUserData(user?.id);
		if (res.success) {
			setUserData(res.data);
		}
	}

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{/* Take user to index page when login success */}
			{user ?
				<Stack.Screen
					name="index"
					component={Index}
					options={{
						headerShown: true,
						headerTitleAlign: "center",
						headerTitle: "你的小組",
						headerRight: () => <IndexHeader />
					}}
				/>
				: (
					<>
						<Stack.Screen name="login" component={Login} />
						<Stack.Screen name="signUp" component={SignUp} />
					</>
				)
			}
		</Stack.Navigator>
	)
}
