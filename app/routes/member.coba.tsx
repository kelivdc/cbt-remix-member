import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { GraphQLClient, gql } from "graphql-request"
import { useState } from "react";
import { getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
    const endpoint = `http://localhost:1337/graphql`
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const jwt = session.get("jwt")
    const user_id = session.get("userId")
    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            authorization: `Bearer ${jwt}`,
        },
    })

    const query = gql`
    {
        soals(    
            sort: "id",
            filters: { 
                Topik: { 
                    users: { id: { eq: ${user_id} } } 
                } 
            },
            pagination:{      
                pageSize: 1
            }
        ) {
            data {
                id
                attributes {
                    uuid
                    title
                    daftar_jawaban {
                        id
                        title
                    }
                }
            }
        }
    }
    `
    const data = await graphQLClient.request(query)
    return json({ data: data })
}

export default function Coba() {
    const data = useLoaderData()
    const [count, setCount] = useState(80);
    return (
        <>
        <div className="text-right">
            Sisa waktu <span className="border p-1 bg-slate-200">
            {new Date(count * 1000).toISOString().substring(14, 19)}
            </span>
        </div>
            {JSON.stringify(data)}
            <div>

            </div>
        </>
    )
}
