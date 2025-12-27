// Logout route
// Clears session cookie and redirects to home
import type { Route } from "./+types/auth.logout";
import { redirect } from "react-router";
import { clearSessionCookie } from "~/services/session.server";

export async function loader() {
    return redirect("/", {
        headers: {
            "Set-Cookie": clearSessionCookie(),
        },
    });
}

export async function action() {
    return redirect("/", {
        headers: {
            "Set-Cookie": clearSessionCookie(),
        },
    });
}
