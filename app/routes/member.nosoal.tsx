import { useNavigate } from '@remix-run/react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
    return [
      { title: "Tidak ada soal yang aktif" }
    ]
  }

export default function Thanks() {
    const navigate = useNavigate()
    return (
        <>
            <div>Maaf, untuk saat ini Anda tidak ada soal. Harap hubungi pengawas</div>
            <Button onClick={() => navigate('/logout')}>Logout</Button>
        </>
    )
}
