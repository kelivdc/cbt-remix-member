import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { commitSession, destroySession, getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    if (session.has("jwt")) {
        const username = session.get("username")
        return json({ username: username })
    } else {
        return redirect("/login")
    }
}

export async function logout(request: Request) {
    const session = await getSession(
        request.headers.get("Cookie")
    );

    return redirect("/login", {
        headers: { 'Set-Cookie': await destroySession(session) }
    })
}

export default function Member() {
    const data = useLoaderData<typeof loader>()
    return (
        <div>
            <div className="flex justify-between py-2 border-b">
                <div>
                    Welcome, <span className="text-blue-400">{data.username}</span>
                </div>
                <div><Link className="hover:text-blue-600" to="/logout">Logout</Link></div>
            </div>
            <div className="py-4">
                <Outlet />
            </div>
        </div>
    )
}
