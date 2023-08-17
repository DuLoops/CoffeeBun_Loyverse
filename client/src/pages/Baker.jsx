import React, { useEffect, useState } from 'react'
import { db } from '../api/firebase'
import { collection, query, doc, onSnapshot, updateDoc, orderBy, increment, writeBatch } from 'firebase/firestore'


export default function Baker() {

  const [inventory, setInventory] = useState([])
  const [selectedInventory, setSelectedInventory] = useState([])
  const controllerOptions = [-1, 1, 3, 6]

  useEffect(() => {
    const q = query(collection(db, "buns"), orderBy('order'))
    const unsub = onSnapshot(q, (snapshot) => {
      const upodatedInventory = []
      console.log('snap')
      snapshot.forEach((doc) => {
        upodatedInventory.push({ id: doc.id, ...doc.data() })
      })
      setInventory(upodatedInventory)
    })
    return () => unsub()
  }, [])

  //Handle manual number input
  const handleNumberChange = (e, itemID) => {
    e.stopPropagation()
    if (isNaN(e.target.value)) return
    const newQuantity = Math.max(0, parseInt(e.target.value))
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === itemID ? { ...item, quantity: newQuantity } : item
      )
    );
    updateDoc(doc(db, 'buns', itemID), { quantity: newQuantity })
  }

  //Handle quick plus and minus
  const handleQuickChange = (e, itemID, val) => {
    e.stopPropagation()
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === itemID ? { ...item, quantity: Math.max(0, item.quantity + val) } : item
      )
    );
    updateDoc(doc(db, 'buns', itemID), { quantity: increment(val)})
  }

  const handleItemSelect = (itemID) => () => {
    if (selectedInventory.includes(itemID)) {
      setSelectedInventory(selectedInventory.filter((id) => id !== itemID));
    } else {
      setSelectedInventory([...selectedInventory, itemID]);
    }
  };

  //Handle controller input (batch change)
  const handleControllerClick = (option) => {
    if (selectedInventory.length === 0) {
      return;
    }
    const updatedInventory = inventory.map((item) => {
      if (selectedInventory.includes(item.id)) {
        const newQuantity = Math.max(0, item.quantity + option);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setInventory(updatedInventory);
    const batch = writeBatch(db)
    selectedInventory.forEach((itemID) => {
      const itemRef = doc(db, 'buns', itemID)
      const item = updatedInventory.find((item) => item.id === itemID)
      console.log(item)
      batch.update(itemRef, { quantity: item.quantity })
    })
    batch.commit()
  }

  const handleReset = () => {
    const confirmed = window.confirm('Are you sure you want to reset all quantities to 0?');
    if (confirmed) {
      const resetInventory = inventory.map((item) => ({ ...item, quantity: 0 }));
      setInventory(resetInventory);

      const batch = writeBatch(db);
      resetInventory.forEach((item) => {
        const itemRef = doc(db, 'buns', item.id);
        batch.update(itemRef, { quantity: item.quantity });
      });

      batch.commit();
    }
  };
  return (
    <div >
      <h1 className='my-5'>Inventory</h1>
      <div className='grid grid-cols-2 lg:grid-cols-4  gap-3'>
        {inventory.map((item) => (
          <div key={item.id} className={`flex flex-col items-center border ${selectedInventory.includes(item.id) ? 'border-red-500' : 'border-gray-300'}`}
            onClick={handleItemSelect(item.id)}
          >
            <p>{item.name}</p>
            <div className='flex gap-3 p-3 z-0'>
              <button className='rounded-full w-6 h-6 bg-blue-200' onClick={(e) => {handleQuickChange(e, item.id, 1)}}>+</button>
              <input type="number" value={item.quantity} onClick={(e)=>e.stopPropagation()} onChange={(e)=> handleNumberChange(e, item.id)} className='bg-amber-100 max-w-l' />
              <button className='rounded-full w-6 h-6 bg-red-200' onClick={(e) => {handleQuickChange(e, item.id, -1)}}>-</button>
            </div>
          </div>
        ))}
      </div>
      <div className='flex w-full my-3 gap-2 bg-slate-400 p-3'>
        <div className='flex w-5/6 gap-2'>
          {controllerOptions.map((option) => (
            <button key={option} className='border border-gray-300 w-full' onClick={() => handleControllerClick(option)}>{option > 0 ? '+' + option : option}</button>
          ))}
        </div>
        <div className='flex flex-col w-1/6 gap-2'>
          <button className='border border-gray-300 w-full' onClick={() => setSelectedInventory([])}>Clear Selection</button>
          <button className='border border-pink-300 w-full' onClick={handleReset}>Restart</button>
        </div>
      </div>
      <div>
        <h1>History</h1>
      </div>
    </div>
  )
}
