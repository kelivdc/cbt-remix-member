import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, MetaFunction, useActionData, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { getSession } from "~/sessions";
import { request, gql } from 'graphql-request'
export const meta: MetaFunction = () => {
  return [
    { title: "Soal" }
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const jwt = session.get("jwt")
  const user_id = session.get("userId")
  let url = `${process.env.SERVER}/soals?populate[pilihan_ganda][fields][0]=title`
  url += `&pagination[page]=1&pagination[pageSize]=1`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + jwt
    }
  })
  const result = await response.json()
  if (response.status == 200) {
    if (result.meta.pagination.total == 0) {
      return redirect("/member/kosong")
    } else {
      return json({ result })
    }
  } else {
    return json({ mesasge: "Error in reading data..." })
  }
}

export async function action({ request, }: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const formData = await request.formData()
  const jwt = session.get("jwt")
  const user_id = session.get("userId")
  const pageCount = parseInt(formData.get("pageCount"))
  let page = parseInt(formData.get("page")) + 1
  if (page > pageCount) {
    return redirect('/member/thanks')
  }
  const jawaban_id = formData.get("jawaban")
  const soal_id = formData.get("soal_id")
  if (jawaban_id !== null) {
    // let url = `${process.env.SERVER}/user-jawabans`
    // const kirim = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": "Bearer " + jwt
    //   },
    //   body: JSON.stringify({
    //     soal_id: soal_id,
    //     jawaban_id: jawaban_id,
    //   }),
    // })
    // console.log('--- Soal Id ---', soal_id)
  }
  // let url = `${process.env.SERVER}/soals?populate[pilihan_ganda][fields][0]=title&filters[Topik][users][id][$eq]=${user_id}`
  let url = `${process.env.SERVER}/soals?populate[pilihan_ganda]`
  url += `&pagination[page]=${page}&pagination[pageSize]=1`

  // const response = await fetch(url, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Authorization": "Bearer " + jwt
  //   }
  // })
  // const result = await response.json()
  // console.log(response)
  // if (response.status == 200) {
  //   return json({ result })
  // } else {
  //   return json({ mesasge: "Error in reading data..." })
  // }
  return json({message: "Okeh"})
}

export default function Soal() {
  const data = useLoaderData<typeof loader>()
  const next_data = useActionData()
  const rows = next_data ? next_data.result.data : data.result.data
  const meta = next_data ? next_data : data
  const soal = rows[0]
  const waktu = 60
  const navigate = useNavigate()
  const [disableForm, setDisableForm] = useState(false)
  const handleSelesai = () => {
    setDisableForm(true)
  }
  const { state } = useNavigation()
  const busy = state === "submitting"

  const handlePilih = async (event) => {
    // console.log('--- Pencet ---', event.target.value)
    // const session = await getSession(
    //   request.headers.get("Cookie")
    // );
    // const jwt = session.get("jwt")
    // console.log(jwt)

    // let url = `${process.env.SERVER}/soals?populate[daftar_jawaban][fields][0]=title&filters[Topik][users][id][$eq]=${user_id}`
    // url += `&pagination[page]=${page}&pagination[pageSize]=1`
    // const response = await fetch(url, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": "Bearer " + jwt
    //   }
    // })
    // const result = await response.json()
    // if (response.status == 200) {
    //   return json({ result })
    // } else {
    //   return json({ mesasge: "Error in reading data..." })
    // }
  }
  const [count, setCount] = useState(waktu);
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
      <Form method="POST">
        <input type="hidden" name="soal_id" value={soal.id} />
        <input type="hidden" name="page" value={meta.result.meta.pagination.page} />
        <input type="hidden" name="pageCount" value={meta.result.meta.pagination.pageCount} />

      <Button type="submit" disabled={busy}>
            {busy ? "Wait..." :
              <>
                {meta.result.meta.pagination.page < meta.result.meta.pagination.pageCount ? 'Next' : 'Selesai'}
              </>
            }

          </Button>
          </Form>
      
      Note:
      <p>Mohon halaman ini jangan direfresh/reload</p>
    </>
  )
}
