import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { MyTickets } from './pages/MyTicketsPage';
import CheckoutPage from './pages/CheckoutPage';
import EventDetaiPage from './pages/EventDetaiPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import VerifyEmail from './pages/VerifyEmail';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyTransactionsPage from './pages/MyTransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import Navbar from './components/Navbar';
import { Footer } from './components/footer';
import { Toast } from './components/ui/Toast';
import { useAuthStore } from './stores/useAuthStore';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import PointsHistoryPage from './pages/PointsHistoryPage';

const App = () => {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/my-tickets' element={<MyTickets />} />
          <Route path='/checkout/:id' element={<CheckoutPage />} />
          <Route path='/events/:id' element={<EventDetaiPage />} />
          <Route path='/transactions' element={<TransactionsPage />} />
          <Route path='/transactions/organizer' element={<TransactionsPage />} />
          <Route path='/transactions/:id' element={<TransactionDetailPage />} />
          <Route path='/my-transactions' element={<MyTransactionsPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/organizer/:id' element={<OrganizerProfilePage />} />
          <Route path='/events/create' element={<CreateEventPage />} />
          <Route path='/events/:id/edit' element={<EditEventPage />} />
          <Route path='/profile/points' element={<PointsHistoryPage />} />
        </Routes>
      </main>

      <Footer />
      <Toast />
    </div>
  );
};

export default App;