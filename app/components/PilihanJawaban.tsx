import React from 'react'

export default function PilihanJawaban() {
  
  const handleKlik = () => {
    alert('Klik')
    // console.log(props)
  }
  return (
    <div onClick={handleKlik}>PilihanJawaban</div>
  )
}
