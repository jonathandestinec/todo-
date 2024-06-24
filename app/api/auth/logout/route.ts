import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest) {
    const supabase = createClient()

    let { error } = await supabase.auth.signOut()

    if (error) {
        console.log(error)
    } else {
        return redirect("/login")
    }

}