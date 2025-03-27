import { Form, useActionData, useFetcher, useNavigation } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ActionFunctionArgs, MetaFunction, createSession, json, redirect } from '@remix-run/node';
import { getSession, commitSession } from "../sessions";

export const meta: MetaFunction = () => {
    return [
        { title: "Login" },
    ];
};

export async function action({ request, }: ActionFunctionArgs) {
    const formData = await request.formData()
    const username = formData.get("username")
    const password = formData.get("password")
    const response = await fetch(`${process.env.SERVER}/auth/local`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            identifier: username,
            password: password
        })
    });
    const data = await response.json()    

    if (response.status == 200) {       
        const topik = await fetch(`${process.env.SERVER}/users/me?populate=Topik`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.jwt}`
            }
          })
          const hasil = await topik.json()
          const topik_id = hasil.Topik?.id ?? null
        const sessionData = { 
            jwt: data.jwt, 
            userId: data.user.id, 
            username: data.user.username, 
            topik_id: topik_id,
            show_result: false
        };
        const session = createSession(sessionData, "__session");
        return redirect("/member/check", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        })
    } else {
        return json({ message: "Salah username atau password" })
    }
}

export default function Login() {
    let navigation = useNavigation()
    let busy = navigation.formAction;
    let data = useActionData()
    return (
        <div className="h-screen grid place-items-center">
            <Card className="w-[500px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Masukkan username dan password</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="POST">
                        <div className="space-y-4">
                            <Input name="username" placeholder="Username" />{" "}
                            <Input type="password" name="password" placeholder="Password" />{" "}
                            <div className="text-red-600">{data ? data.message : ""}</div>
                            <div className="text-right">
                                <Button>{busy ? "Please wait..." : "Login"}</Button>
                            </div>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
