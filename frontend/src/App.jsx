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
import { BookUser, Menu } from "lucide-react";
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
import ViewExperiences from './pages/experience/ViewExperiences';
import SetTypes from './pages/settings/SetTypes';
import SetCustomerView from './pages/settings/SetCustomerView';
import UserAddressBookModal from './components/UserAddressBookModal';
import CashflowReports from './pages/reports/CashflowReports';
import SetFacilities from './pages/settings/SetFacilities';
import ServicesByStaffReport from './pages/reports/ServicesByStaffReport';
import ServicesFacility from './pages/experience/ServicesFacility';
import FacilitySchedule from './pages/experience/FacilitySchedule';
import QuoteDashboard from './pages/quotes/QuoteDashboard';

const ProtectedRoute = ({ children, requiredPermission, storePermission }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getRoleById } = useRoleServices();
  const { getStoreById } = useStoreServices();
  const [permissions, setPermissions] = useState([]);
  const [storePlan, setStorePlan] = useState("");
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
      const auxStore = await getStoreById(storeId)
      setStorePlan(auxStore.store.plan)
      const perms = await getUserPermissions(user, storeId, getRoleById, auxStore.store.mainEmail);
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

  if (storePermission && !storePermission.includes(storePlan)) {
    return <Navigate to="/" replace state={{ unauthorized: true }} />;
  }

  return children;
};

const getUserPermissions = async (user, storeId, getRoleById, mainEmail) => {
  if (!user || !Array.isArray(user.role)) return [];
  //console.log("getStoreById: ", store);

  // Si es el mainEmail, devolver permisos completos
  if (user.email === mainEmail) {
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
    '/view-experience',
    '/update-customer-view',
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
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
  const [showAddressBook, setShowAddressBook] = useState(false);
  const basepage = true;

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;


  return (
    <div
      className='bg-[#18394C] flex overflow-hidden'
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
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <Experiences />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-create-service"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <CreateService />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-add-items"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <AddItemsExperience />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-open-tabs"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <OpenTabs />
            </ProtectedRoute>}
        />
        <Route
          path="/delete-services"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <DeleteServices />
            </ProtectedRoute>}
        />
        <Route
          path="/experience-list"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["MED", "PRO"]}>
              <ExperienceList />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-staff"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <AssignStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/set-service-dates"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <PendingServices />
            </ProtectedRoute>}
        />
        <Route
          path="/service-facility"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <ServicesFacility />
            </ProtectedRoute>}
        />
        <Route
          path="/facility-schedule"
          element={
            <ProtectedRoute requiredPermission="VIEW_EXPERIENCES" storePermission={["BAS", "MED", "PRO"]}>
              <FacilitySchedule />
            </ProtectedRoute>}
        />
        <Route
          path="/view-experience"
          element={
            <ViewExperiences />}
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS" storePermission={["MED", "PRO"]}>
              <Booking />
            </ProtectedRoute>}
        />
        <Route
          path="/booking-calendar"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS" storePermission={["MED", "PRO"]}>
              <BookingSchedule />
            </ProtectedRoute>}
        />
        <Route
          path="/create-reservation"
          element={
            <ProtectedRoute requiredPermission="VIEW_BOOKINGS" storePermission={["MED", "PRO"]}>
              <CreateReservation />
            </ProtectedRoute>}
        />
        <Route
          path="/quote-dashboard"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES" storePermission={["BAS", "MED", "PRO"]}>
              <QuoteDashboard />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES" storePermission={["BAS", "MED", "PRO"]}>
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/new-quote/:quoteId"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES" storePermission={["BAS", "MED", "PRO"]}>
              <NewQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/past-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES" storePermission={["BAS", "MED", "PRO"]}>
              <OpenQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/confirmed-quote"
          element={
            <ProtectedRoute requiredPermission="VIEW_QUOTES" storePermission={["BAS", "MED", "PRO"]}>
              <ConfirmedQuote />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW" storePermission={["BAS", "MED", "PRO"]}>
              <CashFlow />
            </ProtectedRoute>}
        />
        <Route
          path="/cashflow-summary"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW" storePermission={["BAS", "MED", "PRO"]}>
              <CashFlowSummary />
            </ProtectedRoute>}
        />
        <Route
          path="/new-income"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW" storePermission={["BAS", "MED", "PRO"]}>
              <NewIncome />
            </ProtectedRoute>}
        />
        <Route
          path="/new-expense"
          element={
            <ProtectedRoute requiredPermission="VIEW_CASHFLOW" storePermission={["BAS", "MED", "PRO"]}>
              <NewExpense />
            </ProtectedRoute>}
        />
        <Route
          path="/payroll-calculator"
          element={
            <ProtectedRoute requiredPermission="VIEW_PAYROLL" storePermission={["MED", "PRO"]}>
              <PRCalculator />
            </ProtectedRoute>}
        />
        <Route
          path="/set-products"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetProducts />
            </ProtectedRoute>}
        />
        <Route
          path="/set-rooms"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetRooms />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff-rates"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetStaffFee />
            </ProtectedRoute>}
        />
        <Route
          path="/set-roles"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetRoles />
            </ProtectedRoute>}
        />
        <Route
          path="/set-supplier"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetSupplier />
            </ProtectedRoute>}
        />
        <Route
          path="/set-store"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetStore />
            </ProtectedRoute>}
        />
        <Route
          path="/set-users"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetUsers2 />
            </ProtectedRoute>}
        />
        <Route
          path="/set-customer"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetCustomer />
            </ProtectedRoute>}
        />
        <Route
          path="/set-partner"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetPartner />
            </ProtectedRoute>}
        />
        <Route
          path="/set-staff"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetStaff />
            </ProtectedRoute>}
        />
        <Route
          path="/update-customer-view"
          element={
            <SetCustomerView />}
        />
        <Route
          path="/set-types"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetTypes />
            </ProtectedRoute>}
        />
        <Route
          path="/set-facility"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS" storePermission={["BAS", "MED", "PRO"]}>
              <SetFacilities />
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
            <ProtectedRoute requiredPermission="VIEW_REPORTS" storePermission={["BAS", "MED", "PRO"]}>
              <Reports />
            </ProtectedRoute>}
        />
        <Route
          path="/report-cashflow"
          element={
            <ProtectedRoute requiredPermission="VIEW_REPORTS" storePermission={["BAS", "MED", "PRO"]}>
              <MonthlyCashFlow />
            </ProtectedRoute>}
        />
        <Route
          path="/report-cashflow-detail"
          element={
            <ProtectedRoute requiredPermission="VIEW_REPORTS" storePermission={["BAS", "MED", "PRO"]}>
              <CashflowReports />
            </ProtectedRoute>}
        />
        <Route
          path="/report-services-staff"
          element={
            <ProtectedRoute requiredPermission="VIEW_REPORTS" storePermission={["BAS", "MED", "PRO"]}>
              <ServicesByStaffReport />
            </ProtectedRoute>}
        />
        {/*catch all not determined above routes*/}
        <Route path="*" element={
          <Navigate to="/" replace />
        } />

      </Routes>
      <Toaster />
      {isAuthenticated && (
        <>
          <button
            onClick={() => setShowAddressBook(true)}
            className="fixed bottom-4 right-4 z-50 bg-[#3BA0AC] hover:bg-[#0d6c77] text-cyan-50 p-4 rounded-full shadow-lg"
            title="Open user address book"
          >
            <BookUser className="w-6 h-6" />
          </button>

          {showAddressBook && (
            <UserAddressBookModal onClose={() => setShowAddressBook(false)} />
          )}
        </>
      )}
    </div>
  );
}

export default App;

