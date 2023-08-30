import React from 'react'

export default function BakerSales({sales}) {
  return (
    <div className='border'>
        <h1 className='text-2xl my-3'>Sales</h1>
        <div className='flex flex-col gap-2 w-5/6 m-auto h-80 overflow-scroll'>
          {sales.map((sale, i) => (
            <div key={i} className='grid grid-cols-3 items-center border py-1'>
              <p>{sale.receipt_date.toDate().toTimeString().slice(0,5 )}</p>
              <p>{sale.receipt_type}</p>
              <div className='flex flex-row flex-wrap gap-3'>
              {sale.sales && sale.sales.map((item, i) => (
                <div key={i}>
                  <p>{item.item} {sale.receipt_type == "SALE" ? '-' : '+'} {item.quantity}</p>
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
