import './App.css'
import {Link, Outlet} from 'react-router-dom'

function App() {
  const menu = ['Baker', 'Baristar', 'Customer']

  
  return (
    <div className='w-4/5 m-auto'>
      <h1 className="my-10">The Coffee Bun</h1>
      <ul className='flex flex-row gap-2 flex-col'>
      {menu.map((item, index) => (
        <li className='bg-blue-500 hover:bg-blue-700 text-white font-bold rounded' key={index}>
          <Link className='block w-full my-2' to={`${item.toLowerCase()}`}>{item}</Link>
        </li>
      ))}
      </ul>
    </div>
  )
}

export default App
