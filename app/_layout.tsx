import { supabase } from "@/lib/supabase";
import Feather from "@expo/vector-icons/Feather";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../scripts/AuthContext";
import { GetUserData } from "../scripts/UserService.js";
import index from "./index";
import Login from "./Login"
import SignUp from "./SignUp";

const Stack = createNativeStackNavigator();

export default function _layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
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
          component={index}
          options={{
            headerShown: true,
            headerTitleAlign: "center",
            headerTitle: "你的小組",
            headerRight: () => (
              <>
                <Feather
                  name="plus"
                  size={24}
                  style={{ marginRight: 16 }}
                  onPress={() => {
                    // Join group

                  }}
                />
                <Feather
                  name="settings"
                  size={24}
                  style={{ marginRight: 16 }}
                  onPress={() => {
                    // Navigate to settings screen

                  }}
                />
              </>
            )
          }}
        />
        : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
            />
          </>
        )
      }
    </Stack.Navigator>
  )
}
