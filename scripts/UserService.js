import { supabase } from "@/lib/supabase/client";

//Get user data from database
export async function GetUserData(userID) {
    try {
        //Fetch data by ID
        //*single -> Array to object
        const { data, error } = await supabase.from("profiles")
            .select().eq("user_id", userID).single();

        if (error) {
            return { success: false, msg: error?.message };
        }
        else {
            return { success: true, data };
        }
    }
    catch (error) {
        console.log(error);
        return { success: false, msg: error.message }
    }
}

export async function GetUserGroup(userID) {

}