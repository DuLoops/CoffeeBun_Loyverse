import React, { useEffect, useState } from 'react'
import { db } from '../api/firebase'
import { collection, query, doc, onSnapshot, updateDoc, increment } from 'firebase/firestore'
import { io } from "socket.io-client";
import Cookies from '../components/Cookies';

export default function Baristar() {

  const [inventory, setInventory] = useState([])
  const [showInventory, setShowInventory] = useState(false)
  const [socket, setSocket] = useState(null); // WebSocket instance
  const [showQuant, setShowQuant] = useState(false)


  useEffect(() => {
    const newSocket = io('https://coffeebun-inventory-b2a46451fe1f.herokuapp.com/'); // Adjust the URL

    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('Connected to server', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close(); // Clean up the WebSocket connection when the component unmounts
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "buns"))
    const unsub = onSnapshot(q, (snapshot) => {
      const upodatedInventory = []
      snapshot.forEach((doc) => {
        upodatedInventory.push({ id: doc.id, ...doc.data() })
      })
      setInventory(upodatedInventory.sort((a, b) => a.order - b.order))
    })
    return () => unsub()
  }, [])




  const toggleInventory = () => {
    const updatedShowInventory = !showInventory; // Calculate the updated value
    setShowInventory(updatedShowInventory);
    const filteredInventory = inventory.filter(item => item.quantity > 0);
    if (socket) socket.send(updatedShowInventory, showQuant, filteredInventory); // Send the updated value to the server
  };

  const handleSetQuant = (e) => {
    setShowQuant(e.target.checked)
    const filteredInventory = inventory.filter(item => item.quantity > 0);
    if (socket) socket.send(showInventory, e.target.checked, filteredInventory); // Send the updated value to the server
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


  return (
    <div >
      <h1 className='my-5'>Buns</h1>
      <div className='grid grid-cols-2 md:grid-cols-4  gap-3 texl-xl'>
        {inventory.map((item) => (
          <div key={item.id} className={`flex flex-col items-center border ${item.quantity > 0 && 'border-green'}`}>
            <p>{item.name}</p>
            <div className='flex gap-3 p-3 z-0 justify-center'>
              <button className='rounded-full w-12 h-12 bg-blue-200 text-2xl' onClick={(e) => { handleQuickChange(e, item.id, 1) }}>+</button>
              <input type="number" value={item.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => handleNumberChange(e, item.id)} className='bg-amber-100 w-11  text-3xl pl-2' />
              <button className='rounded-full w-12 h-12 bg-red-200 text-2xl' onClick={(e) => { handleQuickChange(e, item.id, -1) }}>-</button>
            </div>
          </div>
        ))}
      </div>
      <button className={`my-5 border border-green-300 p-2 ${showInventory && 'bg-green-200'}`} onClick={toggleInventory}>{showInventory ? 'Hide' : "Show"} CDS Inventory</button>
      <label>
        <input type='checkbox' checked={showQuant} onChange={handleSetQuant} className='ml-2 mr-1' />
        Show Quantity
      </label>
      <Cookies />
    </div>
  )
}
