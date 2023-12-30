import { json, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { getSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
      { title: "Terima kasih" }
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  // First page load
  const session = await getSession(
    request.headers.get("Cookie")
  );
  const user_id = session.get('userId');
  const topik_id = session.get('topik_id');
  const show_result = session.get('show_result');
  const jwt = session.get("jwt")

  let url = `${process.env.SERVER}/hasils-topik/${topik_id}/${user_id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    }
  });
  const hasil = await response.json();  
  return json({poin: hasil.poin, show_result: show_result})
}

export default function Thanks() {
  const navigate = useNavigate();
  const loader = useLoaderData();
  return (
    <>
      <div className="h-screen grid place-items-center">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Terima kasih</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Skor Anda pada test ini: <span style={{fontSize: "20px", fontWeight: "bold"}}>{loader.poin}</span></div>
            <Button onClick={() => navigate('/logout')} style={{
              marginTop: "20px"
            }}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
