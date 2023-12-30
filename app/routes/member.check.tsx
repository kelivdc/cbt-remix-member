import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );    
    if (session.has("jwt")) {
        const jwt = session.get("jwt")
        const response = await fetch(`${process.env.SERVER}/users/me?populate=Topik,role`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        });
        const data = await response.json();    
        session.set('topik_id', data?.Topik?.id);
        session.set('show_result', data?.Topik?.show_result);
        return redirect("/member", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    } else {
        return redirect("/login")
    }
}

export default function Check() {
  return (
    <div>Please wait ...</div>
  )
}
