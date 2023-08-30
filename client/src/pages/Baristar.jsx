import React, { useEffect, useState } from 'react'
import {db} from '../api/firebase'
import {collection, query, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { io } from "socket.io-client";


export default function Baristar() {

  const [inventory, setInvetory] = useState([])
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

  
  useEffect(()=> {
    const q = query(collection(db, "buns"))
    const unsub = onSnapshot(q, (snapshot) => {
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
          <div key={item.id} className={`flex flex-col items-center border ${item.quantity > 0 ? 'bg-green-200' : ''}`}>
            <p>{item.name}</p>
            <input type="number" className='text-2xl' value={item.quantity} onChange={handleChange(item.id)} min={0} max={100}/>
          </div>
        ))}
      </div>
      <button className={`my-5 border border-green-300 p-2 ${showInventory && 'bg-green-200'}`} onClick={toggleInventory}>{showInventory ? 'Hide' : "Show"} CDS Inventory</button>
      <label>
        <input type='checkbox' checked={showQuant} onChange={handleSetQuant} className='ml-2 mr-1' />
        Show Quantity
        </label>
    </div>
  )
}
