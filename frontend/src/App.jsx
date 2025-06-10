import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import Cookies from 'js-cookie';
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
import MonthlyCashFlow from './pages/reports/MonthlyCashFlow';
import { useRoleServices } from './store/rolesServices';
import { useStoreServices } from './store/storeServices';
import LiabilityEn from './pages/forms/FormLiabilityEn';
import Unauthorized from './pages/Unauthorized';
import LiabilityEs from './pages/forms/FormLiabilityEs';
import ExperienceList from './pages/experience/ExperienceList';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getRoleById } = useRoleServices();
  const { getStoreById } = useStoreServices();
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const storeId = Cookies.get('storeId');
  useEffect(() => {
    const fetchPermissions = async () => {
      //console.log("Entré a fetchPermissions")
      if (!isAuthenticated || !user || !user.isVerified) {
        setLoadingPermissions(false);
        return;
      }
      if (!storeId) {
        Cookies.remove('storeId');
        Cookies.remove('timezone');
        logout();
      }
      const perms = await getUserPermissions(user, storeId, getRoleById, getStoreById);
      //console.log("getUserPermissions: ", perms);
      setPermissions(perms);
      setLoadingPermissions(false);
    };

    fetchPermissions();
  }, [isAuthenticated, user, getRoleById, getStoreById]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (loadingPermissions) {
    return <LoadingSpinner />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/" replace state={{ unauthorized: true }} />;
  }

  return children;
};

const getUserPermissions = async (user, storeId, getRoleById, getStoreById) => {
  if (!user || !Array.isArray(user.role)) return [];
  //console.log("Entre a getUserPermissions USER: ", user)
  //console.log("Entre a getUserPermissions storeId: ", storeId)

  const store = await getStoreById(storeId); // necesitas esta función si no tienes ya el store cargado
  //console.log("getStoreById: ", store);
  // Si es el mainEmail, devolver permisos completos
  if (user.email === store.store.mainEmail) {
    return [
      "VIEW_REPORTS",
      "VIEW_SETTINGS",
      "VIEW_PAYROLL",
      "VIEW_BOOKINGS",
      "VIEW_CASHFLOW",
      "VIEW_EXPERIENCES",
      "VIEW_QUOTES",
      // puedes agregar todos los permisos existentes aquí o usar una constante global
    ];
  }

  const roleEntry = user.role.find(r => r.storeId.toUpperCase() === storeId.toUpperCase());
  //console.log("roleEntry: ", roleEntry)
  if (!roleEntry || !roleEntry.roleId) return [];
  try {
    const roleData = await getRoleById(roleEntry.roleId);
    //console.log("getRoleById: ", roleData)
    return roleData?.role?.permission || [];
  } catch (error) {
    //console.error("Error fetching role permissions:", error);
    return [];
  }
};
const MenuAvailable = () => {
  const { isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const hiddenRoutes = [
    '/login',
    '/signup',
    '/verify-email',
    '/unauthorized',
    '/forgot-password',
    '/reset-password',
    '/forms/liabilityEn',
    '/forms/liabilityEs',
  ];

  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
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
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <Experiences />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-create-service"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <CreateService />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-add-items"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <AddItemsExperience />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-open-tabs"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <OpenTabs />
            </ProtectedRoute>}
        />
        <Route
          path="/delete-services"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <DeleteServices />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-list"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <ExperienceList />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-staff"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <AssignStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-dates"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES">
              <PendingServices />
            </ProtectedRoute>}
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS">
              <Booking />
            </ProtectedRoute>}
        />
        <Route
          path="/booking-calendar"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS">
              <BookingSchedule />
            </ProtectedRoute>}
        />
        <Route
          path="/create-reservation"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS">
              <CreateReservation />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES">
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote/:quoteId"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES">
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/past-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES">
              <OpenQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/confirmed-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES">
              <ConfirmedQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW">
              <CashFlow />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow-summary"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW">
              <CashFlowSummary />
            </ProtectedRoute>}
        />
        <Route
          path="/new-income"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW">
              <NewIncome />
            </ProtectedRoute>}
        />
        <Route
          path="/new-expense"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW">
              <NewExpense />
            </ProtectedRoute>}
        />
        <Route
          path="/payroll-calculator"
          element={
            <ProtectedRoute requiredPermission="VIEW_PAYROLL">
              <PRCalculator />
            </ProtectedRoute>}
        />
        <Route
          path="/set-products"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetProducts />
            </ProtectedRoute>}
        />
        <Route
          path="/set-rooms"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetRooms />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff-rates"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetStaffFee />
            </ProtectedRoute>}
        />
        <Route
          path="/set-roles"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetRoles />
            </ProtectedRoute>}
        />
        <Route
          path="/set-supplier"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetSupplier />
            </ProtectedRoute>}
        />
        <Route
          path="/set-store"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetStore />
            </ProtectedRoute>}
        />
        <Route
          path="/set-users"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetUsers2 />
            </ProtectedRoute>}
        />
        <Route
          path="/set-customer"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetCustomer />
            </ProtectedRoute>}
        />
        <Route
          path="/set-partner"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetPartner />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <SetStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/forms/liabilityEn"
          element={
            <LiabilityEn />}
        />
        <Route
          path="/forms/liabilityEs"
          element={
            <LiabilityEs />}
        />
        <Route
          path="/unauthorized"
          element={
            <Unauthorized />}
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
        <Route
          path="/report-incomes"
          element={
            <ProtectedRoute requiredPermission="VIEW_REPORTS">
              <Reports />
            </ProtectedRoute>}
        />
        <Route
          path="/report-cashflow"
          element={
            <ProtectedRoute requiredPermission="VIEW_REPORTS">
              <MonthlyCashFlow />
            </ProtectedRoute>}
        />
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

