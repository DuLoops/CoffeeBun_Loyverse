import React, { useEffect, useState } from 'react'
import {db} from '../api/firebase'
import {collection, query, doc, onSnapshot, updateDoc } from 'firebase/firestore'

export default function Baristar() {

  const [inventory, setInvetory] = useState([])
  const [showInventory, setShowInventory] = useState(false)

  
  useEffect(()=> {
    const q = query(collection(db, "buns"))
    const unsub = onSnapshot(q, (snapshot) => {
      console.log("snap")
      const upodatedInventory = []
      snapshot.forEach((doc) => {
        upodatedInventory.push({id: doc.id, ...doc.data()})
      })
      setInvetory(upodatedInventory.sort((a,b) => a.order - b.order))
    })
    return () => unsub()
  }, [])
  
  const handleChange = (itemID) => (e) => {
    
    if (e.target.value > -1 && e.target.value < 30) {
    updateDoc(doc(db, "buns", itemID), {
      quantity: parseInt(e.target.value)
    })
  }
  } 

  return (
    <div >
      <h1 className='my-5'>Inventory</h1>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {inventory.map((item) => (
          <div key={item.id} className='flex flex-col items-center border'>
            <p>{item.name}</p>
            <input type="number" value={item.quantity} onChange={handleChange(item.id)} min={0} max={30}/>
          </div>
        ))}
      </div>
      <button className='my-5 border border-orange-300 p-2' onClick={() =>setShowInventory(!showInventory)}>{showInventory ? 'Hide' : "Show"} CDS Inventory</button>
    </div>
  )
}
