import { useNavigate } from '@remix-run/react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
    return [
      { title: "Terima kasih" }
    ]
  }

export default function Thanks() {
    const navigate = useNavigate()
    return (
        <>
            <div>Thanks</div>
            <Button onClick={() => navigate('/logout')}>Logout</Button>
        </>
    )
}
