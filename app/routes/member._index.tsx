import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import React, { useState, useEffect } from 'react';
import { Button } from "~/components/ui/button";
import { getSession } from "~/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Welcome" },
  ];
};
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const jwt = session.get("jwt")
  let url = `${process.env.SERVER}/soals?populate=Topik&filters[Topik][mulai][$lte]=1004-01-26`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    }
  })
  const result = await response.json()
  const total = await result.meta.pagination.total;  

  return json({ data: session, total: total })
}


export default function Member() {
  const navigate = useNavigate()  
  const loader = useLoaderData()  
  // const url = loader?.server
  // useEffect(() => {
  //   console.log(loader?.server)
  // },[loader?.server])   
  return (
    <div className="h-screen grid place-items-center text-center">
      <div>        
        {loader.total > 0 ? (
          <>
          <div>Untuk memulai ujian. Silahkan klik tombol MULAI<br />
            <Button className="mt-4" onClick={() => navigate('/member/soal')}>MULAI</Button>
          </div>
          </>
        ) : (
          <div>Maaf, untuk saat ini Anda tidak ada soal yang tersedia. Silahkan hubungi pengawas<br />
            <Button className="mt-4" onClick={() => navigate('/logout')}>TUTUP</Button>
          </div>
        )}
      </div>
    </div>
  )
}
