import React, {useState, useEffect} from 'react'
import CDSSwiper from '../components/CDSSwiper';
import { io } from "socket.io-client";
import CDSList from '../components/CDSList';
export default function Customer() {
  const [isOpen, setIsOpen] = useState(false);
  const [buns, setBuns] = useState([])
  const [socket, setSocket] = useState(null);
  const [showQuant, setShowQuant] = useState(false)
  useEffect(() => {
    const newSocket = io("https://coffeebun-inventory-b2a46451fe1f.herokuapp.com/");
    setSocket(newSocket);

    // set up event listeners for incoming messages
    newSocket.on("connect", () => console.log("Connected to WebSocket"));
    newSocket.on("disconnect", () =>
      console.log("Disconnected from WebSocket")
    );
    newSocket.on("message", (isOpen, showQuant, data) => {
      setIsOpen(isOpen);
      setShowQuant(showQuant);
      setBuns(data);
    });

    // clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  return (
    <div className='h-screen bg-orange-100'>
      {isOpen && (
        <CDSList buns={buns} showQuant={showQuant}/>)
      }
      <CDSSwiper isOpen={isOpen}/>
    </div>
  )
}
