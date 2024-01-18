import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
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
    const tipe_soal = session.get("tipe_soal");
    let url = ''
    if (tipe_soal == 'Ganda') {
        url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[pilihan_ganda][fields][0]=title`
    }
    else if (tipe_soal == 'Multi') {
        url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[multi_jawaban][fields][0]=hint`
    }
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
        return json({ result: result, url: process.env.PUBLIC, tipe_soal: tipe_soal, jwt: jwt })
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
    const pageCount = parseInt(formData.get("pageCount"));
    const tipe_soal = session.get("tipe_soal");

    let page = parseInt(formData.get("page")) + 1
    if (page > pageCount) {
        return redirect('/member/thanks')
    }
    if (tipe_soal == 'Ganda') {
        url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[pilihan_ganda][fields][0]=title`
    }
    else if (tipe_soal == 'Multi') {
        url = `${process.env.SERVER}/soals?populate[image][fields][1]=url&populate[multi_jawaban][fields][0]=hint`
    }
    url += `&pagination[page]=${page}&pagination[pageSize]=1`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
    })
    const result = await response.json()
    return json({ result: result, url: process.env.PUBLIC, tipe_soal: tipe_soal });
}

export default function Soal() {
    const loader = useActionData() || useLoaderData<typeof loader>()
    const tipe_soal = loader.tipe_soal
    const data = loader.result.data[0]
    const meta = loader.result.meta
    const url = loader.url;
    const [count, setCount] = useState(data.attributes.waktu);
    const [disableForm, setDisableForm] = useState(false)
    const handleSelesai = () => {
        setDisableForm(true)
    }
    const [jawaban, setJawaban] = useState('')

    const { state } = useNavigation()
    let busy = state === "submitting"
    let formRef = useRef();
    useEffect(() => {
        if (!busy) {
            formRef.current?.reset()
            document.getElementById("MultiForm")?.reset();
            setDisableForm(false);
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
    const action_url = url + '/api/user-jawabans/multi'

    const simpanJawaban = async (event) => {
        let multi_id = event.target.name;
        let value = event.target.value;
        let soal_id = event.target.getAttribute('data-soal-id');
        const resp = await fetch(action_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loader.jwt}`
            },
            body: JSON.stringify({
                data: {
                    soal_id: soal_id,
                    multi_id: multi_id,
                    value: value,
                },
            })
        })
        const result = await resp.json();
    }
    HitungMundur()
    return (
        <>
            <div className="text-right">
                Sisa waktu <span className="border p-1 bg-slate-200">
                    {new Date(count * 1000).toISOString().substring(14, 19)}
                </span>
            </div>
            {tipe_soal == 'Ganda' ? (
                <>
                    <Form method="POST" replace ref={formRef}>
                        <input type="hidden" name="soal_id" value={data.id} />
                        <input type="hidden" name="page" value={meta.pagination.page} />
                        <input type="hidden" name="pageCount" value={meta.pagination.pageCount} />
                        <input type="hidden" name="form_name" value="Ganda" />
                        <fieldset disabled={disableForm}>
                            {data.attributes.image.data && (
                                <img src={`${url}${data.attributes.image.data[0].attributes.url}`} className="mb-4" />
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
                        </fieldset >

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
                </>
            ) : (
                <div>
                    <Table style={{ width: "500px", border: "solid 1px #ccc" }}>
                        <TableBody>
                            <TableRow>
                                <TableCell>{data.attributes.multi_bahan_1}</TableCell>
                                <TableCell>{data.attributes.multi_bahan_2}</TableCell>
                                <TableCell>{data.attributes.multi_bahan_3}</TableCell>
                                <TableCell>{data.attributes.multi_bahan_4}</TableCell>
                                <TableCell>{data.attributes.multi_bahan_5}</TableCell>
                            </TableRow>
                            <TableRow className="font-bold">
                                <TableCell>{data.attributes.multi_abjad_1}</TableCell>
                                <TableCell>{data.attributes.multi_abjad_2}</TableCell>
                                <TableCell>{data.attributes.multi_abjad_3}</TableCell>
                                <TableCell>{data.attributes.multi_abjad_4}</TableCell>
                                <TableCell>{data.attributes.multi_abjad_5}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="my-4">
                        {data.attributes.multi_perintah}
                    </div>
                    <div className="space-y-2">
                        <Form id="MultiForm">
                            <fieldset disabled={disableForm}>
                                {data.attributes.multi_jawaban.map((multi, idx) => (
                                    <div className="flex" key={idx}>
                                        <div>{idx + 1}. Soal:
                                            <span className="pl-2 tracking-[8px]">{multi.hint}</span>
                                        </div>
                                        <RadioGroup className="flex space-x-4 pl-12" onChange={simpanJawaban}>
                                            <div className="flex items-center space-x-1">
                                                <input type="radio" value="1" name={multi.id} data-soal-id={data.id} id={`option-A-${multi.id}`} />
                                                <Label htmlFor={`option-A-${multi.id}`}>A</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <input type="radio" value="2" name={multi.id} data-soal-id={data.id} id={`option-B-${multi.id}`} />
                                                <Label htmlFor={`option-B-${multi.id}`}>B</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <input type="radio" value="3" name={multi.id} data-soal-id={data.id} id={`option-C-${multi.id}`} />
                                                <Label htmlFor={`option-C-${multi.id}`}>C</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <input type="radio" value="4" name={multi.id} data-soal-id={data.id} id={`option-D-${multi.id}`} />
                                                <Label htmlFor={`option-D-${multi.id}`}>D</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <input type="radio" value="5" name={multi.id} data-soal-id={data.id} id={`option-E-${multi.id}`} />
                                                <Label htmlFor={`option-E-${multi.id}`}>E</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                            </fieldset>

                        </Form>
                        <Form method="POST" replace ref={formRef}>
                            <input type="hidden" name="soal_id" value={data.id} />
                            <input type="hidden" name="page" value={meta.pagination.page} />
                            <input type="hidden" name="pageCount" value={meta.pagination.pageCount} />
                            <input type="hidden" name="form_name" value="Multi" />
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
                    </div>
                </div>
            )}

            Note:
            <p>Mohon halaman ini jangan direfresh/reload</p>
        </>
    )
}
