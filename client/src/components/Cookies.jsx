import React, { useState } from 'react'

const cookiesData = [
    { name: 'Triple Nut', available: true },
    { name: 'Chocolate', available: true },
    { name: 'Green Tea', available: true },
    { name: 'Earl Grey', available: true },
    { name: 'Red Velvet', available: true },
    { name: 'Tiramisu', available: true },
    { name: "S'more", available: true },
    { name: 'Pistachio', available: true },
]

export default function Cookies() {
    const [cookies, setCookies] = useState(cookiesData)
    const handleClick = (name) => {
        setCookies((prevCookies) =>
            prevCookies.map((cookie) =>
                cookie.name === name ? { ...cookie, available: !cookie.available } : cookie
            )
        )
    }
    return (
        <div>
            <p>Cookies</p>
            <div className='grid grid-cols-4 gap-2 m-2'>
                {cookies.map((cookie) => (
                    <div key={cookie.name} className={`items-center text-xl border-2 ${cookie.available ? 'border-green-500' : 'border-red-100 text-slate-300'} py-1`} onClick={() => handleClick(cookie.name)}>
                        <p>{cookie.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
