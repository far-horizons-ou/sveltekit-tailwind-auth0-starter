import { handleLogoutRedirect } from "../../../../lib/auth";
import type { RequestEvent } from "@sveltejs/kit";

export function GET(request: RequestEvent): Response {
    return handleLogoutRedirect(request)
}
