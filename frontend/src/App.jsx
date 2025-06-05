import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import SignUpPage from './pages/signing/SignUpPage';
import LoginPage from './pages/signing/LoginPage';
import EmailVerificationPage from './pages/signing/EmailVerificationPage';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import ForgotPasswordPage from './pages/signing/ForgotPasswordPage';
import ResetPasswordPage from './pages/signing/ResetPasswordPage';
import LeftMenu from "./components/LeftMenu";
import { Menu } from "lucide-react";
import Booking from './pages/booking/Booking';
import CashFlow from './pages/CashFlow';
import Experiences from './pages/experience/Experiences';
import SetProducts from './pages/settings/SetProducts';
import SetRooms from './pages/settings/SetRooms';
import SetStore from './pages/settings/SetStore';
import SetUsers from './pages/settings/SetUsers';
import AssignStaff from './pages/experience/AssignStaff';
import SetStaff from './pages/settings/SetStaff';
import NewQuote from './pages/quotes/NewQuote';
import NewIncome from './pages/cashflow/NewIncome';
import OpenQuote from './pages/quotes/OpenQuote';
import ConfirmedQuote from './pages/quotes/ConfirmedQuote';
import PendingServices from './pages/experience/PendingServices';
import NewExpense from './pages/cashflow/NewExpense';
import SetStaffFee from './pages/settings/SetStaffFee';
import PRCalculator from './pages/payroll/PRCalculator';
import CreateService from './pages/experience/CreateService';
import SetPartner from './pages/settings/SetPartner';
import BookingSchedule from './pages/booking/BookingSchedule';
import SetCustomer from './pages/settings/SetCustomer';
import AddItemsExperience from './pages/experience/AddItemsExperience';
import OpenTabs from './pages/experience/OpenTabs';
import CreateReservation from './pages/booking/CreateReservation';
import CashFlowSummary from './pages/cashflow/CashFlowSummary';
import SetSupplier from './pages/settings/SetSupplier';
import Reports from './pages/reports/Reports';
import SetRoles from './pages/settings/SetRoles';
import SetUsers2 from './pages/settings/SetUsers2';
import DeleteServices from './pages/experience/DeleteServices';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
}
const MenuAvailable = () => {
    const { isAuthenticated } = useAuthStore();
    const [showMenu, setShowMenu] = useState(false);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex">
            <LeftMenu show={showMenu} setShow={setShowMenu} />
        </div>
    );
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  //console.log("Redirecting user: ", user)
  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {

  const { isCheckingAuth, checkAuth } = useAuthStore();
  const basepage = true;

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;


  return (
    <div
      className='bg-blue-950 flex overflow-hidden'
    >
      <MenuAvailable />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-calendar"
          element={
            <ProtectedRoute>
              <Experiences />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-create-service"
          element={
            <ProtectedRoute>
              <CreateService />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-add-items"
          element={
            <ProtectedRoute>
              <AddItemsExperience />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-open-tabs"
          element={
            <ProtectedRoute>
              <OpenTabs />
            </ProtectedRoute>}
        />
        <Route
          path="/delete-services"
          element={
            <ProtectedRoute>
              <DeleteServices />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-staff"
          element={
            <ProtectedRoute>
              <AssignStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-dates"
          element={
            <ProtectedRoute>
              <PendingServices />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff-rates"
          element={
            <ProtectedRoute>
              <SetStaffFee />
            </ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>}
        />
        <Route
          path="/booking-calendar"
          element={
            <ProtectedRoute>
              <BookingSchedule />
            </ProtectedRoute>}
        />
        <Route
          path="/create-reservation"
          element={
            <ProtectedRoute>
              <CreateReservation />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote"
          element={
            <ProtectedRoute>
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote/:quoteId"
          element={
            <ProtectedRoute>
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/past-quote"
          element={
            <ProtectedRoute>
              <OpenQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/confirmed-quote"
          element={
            <ProtectedRoute>
              <ConfirmedQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow"
          element={
            <ProtectedRoute>
              <CashFlow />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow-summary"
          element={
            <ProtectedRoute>
              <CashFlowSummary />
            </ProtectedRoute>}
        />
        <Route
          path="/new-income"
          element={
            <ProtectedRoute>
              <NewIncome />
            </ProtectedRoute>}
        />
        <Route
          path="/new-expense"
          element={
            <ProtectedRoute>
              <NewExpense />
            </ProtectedRoute>}
        />
        <Route
          path="/payroll-calculator"
          element={
            <ProtectedRoute>
              <PRCalculator />
            </ProtectedRoute>}
        />
        <Route
          path="/report-incomes"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>}
        />
        <Route
          path="/set-products"
          element={
            <ProtectedRoute>
              <SetProducts />
            </ProtectedRoute>}
        />
        <Route
          path="/set-rooms"
          element={
            <ProtectedRoute>
              <SetRooms />
            </ProtectedRoute>}
        />
        <Route
          path="/set-roles"
          element={
            <ProtectedRoute>
              <SetRoles />
            </ProtectedRoute>}
        />
        <Route
          path="/set-supplier"
          element={
            <ProtectedRoute>
              <SetSupplier />
            </ProtectedRoute>}
        />
        <Route
          path="/set-store"
          element={
            <ProtectedRoute>
              <SetStore />
            </ProtectedRoute>}
        />
        <Route
          path="/set-users"
          element={
            <ProtectedRoute>
              <SetUsers2 />
            </ProtectedRoute>}
        />
        <Route
          path="/set-customer"
          element={
            <ProtectedRoute>
              <SetCustomer />
            </ProtectedRoute>}
        />
        <Route
          path="/set-partner"
          element={
            <ProtectedRoute>
              <SetPartner />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff"
          element={
            <ProtectedRoute>
              <SetStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={
          <RedirectAuthenticatedUser>
            <ForgotPasswordPage />
          </RedirectAuthenticatedUser>
        } />
        <Route path="/reset-password/:token" element={
          <RedirectAuthenticatedUser>
            <ResetPasswordPage />
          </RedirectAuthenticatedUser>
        } />
        {/*catch all not determined above routes*/}
        <Route path="*" element={
          <Navigate to="/" replace />
        } />

      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

