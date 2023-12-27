import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );

    return redirect("/login", {
        headers: { 'Set-Cookie': await destroySession(session) }
    })
}

export default function Logout() {
    return (
        <div>Logging out ...</div>
    )
}
