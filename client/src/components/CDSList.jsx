import React from 'react'

export default function CDSList({buns, showQuant}) {
  console.log(showQuant)
  return (
    <div className='flex h-full w-full flex-col gap-5 justify-center'>
      <h1 className='text-4xl'>Available Buns</h1>
      {buns.map((bun) => (
        <div key={bun.id} className='flex flex-col items-center text-2xl'>
          <p>{bun.name} Bun {showQuant && ' - ' + bun.quantity}</p>
          <p></p>
          </div>
      ))}
    </div>
  )
}
