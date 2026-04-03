import { Routes,Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import Explore from './Pages/Explore';

export default function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Explore/>}/>
        <Route path='/Login' element={<Login/>}/>
      </Routes>
    </>      
  );
}

