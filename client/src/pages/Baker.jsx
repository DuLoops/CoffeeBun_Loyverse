import React, { useEffect, useState } from 'react'
import { db } from '../api/firebase'
import { collection, query, doc, onSnapshot, updateDoc, orderBy, increment, getDocs, writeBatch } from 'firebase/firestore'
import BakerSales from '../components/BakerSales'
import { resetServer } from '../api/inventoryServer'
export default function Baker() {

  const [inventory, setInventory] = useState([])
  const [selectedInventory, setSelectedInventory] = useState([])
  const controllerOptions = [-1, 1, 3, 6]
  const [sales, setSales] = useState([])

  useEffect(() => {
    const q = query(collection(db, "buns"), orderBy('order'))
    const unsub = onSnapshot(q, (snapshot) => {
      const updatedInventory = []
      snapshot.forEach((doc) => {
        updatedInventory.push({ id: doc.id, ...doc.data() })
      })
      setInventory(updatedInventory)
      updatesales()
    })
    return () => unsub()
  }, [])

  const updatesales = async () => {
    const newsales = []
    const q = query(collection(db, "sales"), orderBy('receipt_date', 'desc'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      newsales.push(doc.data())
    }
    )
    setSales(newsales)

  }

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
    updateDoc(doc(db, 'buns', itemID), { quantity: increment(val) })
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
      batch.update(itemRef, { quantity: item.quantity })
    })
    batch.commit()
  }

  const handleSetTo0 = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all quantities to 0?');
    if (confirmed) {

      const resetInventory = inventory.map((item) => ({ ...item, quantity: 0 }));
      setInventory(resetInventory);

      const batch = writeBatch(db);
      resetInventory.forEach((item) => {
        const itemRef = doc(db, 'buns', item.id);
        batch.update(itemRef, { quantity: item.quantity });
      });

      try {
        await batch.commit();
        await resetServer();
      } catch (err) {
        console.log(err);
      }
    }

  };

  const handleReset = async () => {
    const confirmed = window.confirm('New day?');
    if (confirmed) {
      const resetInventory = inventory.map((item) => {
        switch (item.id) {
          case 'og':
            return { ...item, quantity: 12 };
          case 'mi':
          case 'gt':
          case 'eg':
            return { ...item, quantity: 4 };
          case 'co':
          case 'cr':
            return { ...item, quantity: 3 };
          case 'cc':
          case 'cho':
          case 're':
          case 'nu':
            return { ...item, quantity: 6 };
          case 'ci':
            return { ...item, quantity: 2 };
          case 'ga':
            return { ...item, quantity: 4 };
          default:
            return {...item, quantity: 0}
        }
      });
      setInventory(resetInventory);
      const batch = writeBatch(db);
      resetInventory.forEach((item) => {
        const itemRef = doc(db, 'buns', item.id);
        batch.update(itemRef, { quantity: item.quantity });
      });

      try {
        await batch.commit();
        await resetServer();
      } catch (err) {
        console.log(err);
      }
    }
  };


  return (
    <div >
      <h1 className='my-5 text-2xl'>Inventory</h1>
      <div className='grid grid-cols-2 md:grid-cols-4  gap-3 texl-xl'>
        {inventory.map((item) => (
          <div key={item.id} className={`flex flex-col items-center border ${selectedInventory.includes(item.id) ? 'border-red-500' : 'border-gray-300'} py-2`}
            onClick={handleItemSelect(item.id)}
          >
            <p>{item.name}</p>
            <div className='flex gap-3 p-3 z-0 justify-center'>
              <button className='rounded-full w-12 h-12 bg-blue-200 text-2xl' onClick={(e) => { handleQuickChange(e, item.id, 1) }}>+</button>
              <input type="number" value={item.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => handleNumberChange(e, item.id)} className='bg-amber-100 w-11 text-3xl pl-2' />
              <button className='rounded-full w-12 h-12 bg-red-200 text-2xl' onClick={(e) => { handleQuickChange(e, item.id, -1) }}>-</button>
            </div>
          </div>
        ))}
      </div>
      <div className='flex w-full my-3 gap-2 bg-slate-400 p-3 text-xl'>
        <div className='flex w-5/6 gap-2'>
          {controllerOptions.map((option) => (
            <button key={option} className='border border-gray-300 w-full text-3xl' onClick={() => handleControllerClick(option)}>{option > 0 ? '+' + option : option}</button>
          ))}
        </div>
        <div className='flex flex-col w-1/6 gap-2 text-sm md:text-xl '>
          <button className='border border-gray-300 w-full h-12' onClick={() => setSelectedInventory([])}>Clear Selection</button>
          <div className='flex gap-2'>
            <button className='border border-pink-300 bg-pink-200 w-full h-12' onClick={handleSetTo0}>Set to 0</button>
            <button className='border border-red-300 bg-red-200 w-full h-12' onClick={handleReset}>New Day</button>
          </div>
        </div>
      </div>
      <BakerSales sales={sales} />

    </div>
  )
}
