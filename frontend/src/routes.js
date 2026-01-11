import { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import ConfirmationSent from "./components/user/ConfirmationSent";
import VerifyAccount from "./components/user/VerifyAccount";
import ForgotPassword from "./components/user/ForgotPassword";
import DemoPartyDashboard from "./components/DemoPartyDashboard";
import Error404 from "./components/Error404";
import ComposList from "./components/productions/ComposList";
import ProductionForm from "./components/productions/ProductionForm";
import MyProductions from "./components/productions/MyProductions";
import ProductionDetail from "./components/productions/ProductionDetail";
import AdminRoute from "./components/common/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EditionsPage from "./pages/admin/EditionsPage";
import EditionFormPage from "./pages/admin/EditionFormPage";
import EditionDetailPage from "./pages/admin/EditionDetailPage";
import ComposPage from "./pages/admin/ComposPage";
import CompoFormPage from "./pages/admin/CompoFormPage";
import CompoDetailPage from "./pages/admin/CompoDetailPage";
import ProductionsPage from "./pages/admin/ProductionsPage";
import ProductionDetailPage from "./pages/admin/ProductionDetailPage";
import VotingConfigPage from "./pages/admin/VotingConfigPage";
import AttendanceCodesPage from "./pages/admin/AttendanceCodesPage";
import JuryManagementPage from "./pages/admin/JuryManagementPage";
import Gallery from "./components/gallery/Gallery";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Puedes mostrar un spinner de carga aquí
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router
      basename="/app"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/demo-party/dashboard"
          element={
            <PrivateRoute>
              <DemoPartyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/editions"
          element={
            <AdminRoute>
              <EditionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/editions/new"
          element={
            <AdminRoute>
              <EditionFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/editions/:id/edit"
          element={
            <AdminRoute>
              <EditionFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/editions/:id"
          element={
            <AdminRoute>
              <EditionDetailPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/compos"
          element={
            <AdminRoute>
              <ComposPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/compos/new"
          element={
            <AdminRoute>
              <CompoFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/compos/:id/edit"
          element={
            <AdminRoute>
              <CompoFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/compos/:id"
          element={
            <AdminRoute>
              <CompoDetailPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/productions"
          element={
            <AdminRoute>
              <ProductionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/productions/:id"
          element={
            <AdminRoute>
              <ProductionDetailPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/voting-config"
          element={
            <AdminRoute>
              <VotingConfigPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/attendance-codes"
          element={
            <AdminRoute>
              <AttendanceCodesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/jury"
          element={
            <AdminRoute>
              <JuryManagementPage />
            </AdminRoute>
          }
        />
        <Route path="/compos" element={<ComposList />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/productions/new"
          element={
            <PrivateRoute>
              <ProductionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/productions/edit/:id"
          element={
            <PrivateRoute>
              <ProductionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-productions"
          element={
            <PrivateRoute>
              <MyProductions />
            </PrivateRoute>
          }
        />
        <Route path="/productions/:id" element={<ProductionDetail />} />
        <Route path="/" element={<Navigate to="/demo-party/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-account/:token" element={<VerifyAccount />} />
        <Route path="/confirmation-sent" element={<ConfirmationSent />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
