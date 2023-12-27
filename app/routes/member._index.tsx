import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
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
  return json({ data: session })
}

export default function Member() {
  const navigate = useNavigate()
  return (
    <div className="h-screen grid place-items-center text-center">
      <div>Untuk memulai ujian. Silahkan klik tombol MULAI<br />
        <Button className="mt-4" onClick={() => navigate('/member/soal')}>MULAI</Button>
      </div>
    </div>
  )
}
