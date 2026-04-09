import { Routes,Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import Explore from './Pages/Explore';
import Register from './Pages/Register';
import VerifyEmail from './Pages/RegisterVerification';
import ForgotPassword from './Pages/ResetPass';
import Profile from './Pages/Profile';

export default function App() {
  return (
    <>
      <Navbar/>
      <main className='pt-20'>
        <Routes>
          <Route path='/' element={<Explore/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/email-verification' element={<VerifyEmail/>}/>
          <Route path='/reset-password' element={<ForgotPassword/>}/>
          <Route path='/user-profile' element={<Profile/>}/>

      </Routes>
      </main>

    </>      
  );
}




