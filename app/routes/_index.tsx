import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate()
  return (
    <div className="h-screen grid place-items-center">
      <div className="text-center">
        <h1>Selamat Datang</h1>
        <Button onClick={() => navigate('/login')} className="mt-4">Login</Button>
      </div>
    </div>
  );
}
