import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup } from "~/components/ui/radio-group";
import { getSession } from "~/sessions";

export const meta: MetaFunction = () => {
    return [
        { title: "Soal" }
    ]
}

export async function loader({ request }: LoaderFunctionArgs) {
    // First page load
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const jwt = session.get("jwt");
    let url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[pilihan_ganda][fields][0]=title`
    url += `&pagination[page]=1&pagination[pageSize]=1`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
    })
    const result = await response.json()
    const total = await result.data.length;
    if (total <= 0) {
        return redirect('/member/nosoal');
    } else {
        return json({result: result, url: process.env.PUBLIC})
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const formData = await request.formData()
    const soal_id = formData.get("soal_id")
    const pilihan_id = formData.get("pilihan_id")
    const jwt = session.get("jwt")
    let url = `${process.env.SERVER}/user-jawabans`
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
            data: {
                soal_id: soal_id,
                pilihan_id: pilihan_id,
            },
        })
    })
    const pageCount = parseInt(formData.get("pageCount"))
    let page = parseInt(formData.get("page")) + 1
    if (page > pageCount) {
        return redirect('/member/thanks')
    }
    url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[pilihan_ganda][fields][0]=title`
    url += `&pagination[page]=${page}&pagination[pageSize]=1`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
    })
    const result = await response.json()
    return json({result: result, url: process.env.PUBLIC})
}

export default function Soal() {
    const loader = useActionData() || useLoaderData<typeof loader>()
    const data = loader.result.data[0]
    const meta = loader.result.meta
    const url = loader.url;
    const [count, setCount] = useState(data.attributes.waktu);
    const [disableForm, setDisableForm] = useState(false)
    const handleSelesai = () => {
        setDisableForm(true)
    }
    const { state } = useNavigation()
    let busy = state === "submitting"
    let formRef = useRef();
    useEffect(() => {
        if (!busy) {
            formRef.current?.reset()
            setDisableForm(false)
            setCount(data.attributes.waktu)
        }
    }, [busy])
    const HitungMundur = () => {
        useEffect(() => {
            //Implementing the setInterval method
            if (count > 0) {
                const interval = setInterval(() => {
                    let nextcount = count - 1;
                    setCount(nextcount);
                }, 1000);
                //Clearing the interval
                return () => clearInterval(interval);
            } else {
                handleSelesai()
            }
        }, [count]);
    }
    HitungMundur()
    return (
        <>
            <div className="text-right">
                Sisa waktu <span className="border p-1 bg-slate-200">
                    {new Date(count * 1000).toISOString().substring(14, 19)}
                </span>
            </div>
            <Form method="POST" replace ref={formRef}>
                <input type="hidden" name="soal_id" value={data.id} />
                <input type="hidden" name="page" value={meta.pagination.page} />
                <input type="hidden" name="pageCount" value={meta.pagination.pageCount} />
                <fieldset disabled={disableForm}>
                    {data.attributes.image.data && (
                        <img src={`${url}${data.attributes.image.data[0].attributes.url}`}  className="mb-4"/>
                    )}
                    <div className="mb-4 ">{meta.pagination.page}. {data.attributes.keterangan}</div>
                    <RadioGroup className="space-y-4">
                        {data.attributes.pilihan_ganda.map((pilihan, idx) => (
                            <div className="flex items-center space-x-2" key={idx}>
                                <input type="radio" value={pilihan.id} name="pilihan_id" id={pilihan.id} />
                                <Label htmlFor={pilihan.id}>{pilihan.title}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </fieldset>
                <div className="text-center">
                    <Button type="submit" disabled={busy}>
                        {busy ? "Wait..." :
                            <>
                                {meta.pagination.page < meta.pagination.pageCount ? "Next" : "Selesai"}
                            </>
                        }
                    </Button>
                    {" "}({meta.pagination.page}/{meta.pagination.total})
                </div>
            </Form>
            Note:
            <p>Mohon halaman ini jangan direfresh/reload</p>
        </>
    )
}
