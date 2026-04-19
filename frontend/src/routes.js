import { useContext, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Eager imports for auth pages (most common entry points)
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";

// Lazy imports for everything else
const ConfirmationSent = lazy(() => import("./components/user/ConfirmationSent"));
const VerifyAccount = lazy(() => import("./components/user/VerifyAccount"));
const ForgotPassword = lazy(() => import("./components/user/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/user/ResetPassword"));
const DemoPartyDashboard = lazy(() => import("./components/DemoPartyDashboard"));
const Error404 = lazy(() => import("./components/Error404"));
const ComposList = lazy(() => import("./components/productions/ComposList"));
const ProductionForm = lazy(() => import("./components/productions/ProductionForm"));
const MyProductions = lazy(() => import("./components/productions/MyProductions"));
const ProductionDetail = lazy(() => import("./components/productions/ProductionDetail"));
const AdminRoute = lazy(() => import("./components/common/AdminRoute"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const EditionsPage = lazy(() => import("./pages/admin/EditionsPage"));
const EditionFormPage = lazy(() => import("./pages/admin/EditionFormPage"));
const EditionDetailPage = lazy(() => import("./pages/admin/EditionDetailPage"));
const ComposPage = lazy(() => import("./pages/admin/ComposPage"));
const CompoFormPage = lazy(() => import("./pages/admin/CompoFormPage"));
const CompoDetailPage = lazy(() => import("./pages/admin/CompoDetailPage"));
const ProductionsPage = lazy(() => import("./pages/admin/ProductionsPage"));
const ProductionDetailPage = lazy(() => import("./pages/admin/ProductionDetailPage"));
const VotingConfigPage = lazy(() => import("./pages/admin/VotingConfigPage"));
const VotingPeriodsPage = lazy(() => import("./pages/admin/VotingPeriodsPage"));
const AttendanceCodesPage = lazy(() => import("./pages/admin/AttendanceCodesPage"));
const JuryManagementPage = lazy(() => import("./pages/admin/JuryManagementPage"));
const SponsorsPage = lazy(() => import("./pages/admin/SponsorsPage"));
const SponsorFormPage = lazy(() => import("./pages/admin/SponsorFormPage"));
const StageRunnerPage = lazy(() => import("./pages/admin/stagerunner").then(m => ({ default: m.StageRunnerPage })));
const SlidesListPage = lazy(() => import("./pages/admin/stagerunner").then(m => ({ default: m.SlidesListPage })));
const SlideEditorPage = lazy(() => import("./pages/admin/stagerunner").then(m => ({ default: m.SlideEditorPage })));
const LiveControlPage = lazy(() => import("./pages/admin/stagerunner").then(m => ({ default: m.LiveControlPage })));
const StageRunnerViewer = lazy(() => import("./pages/stagerunner/StageRunnerViewer"));
const VotingPage = lazy(() => import("./pages/VotingPage"));
const AttendPage = lazy(() => import("./pages/AttendPage"));
const ProfilePage = lazy(() => import("./components/user/ProfilePage"));
const Gallery = lazy(() => import("./components/gallery/Gallery"));
const RulesPage = lazy(() => import("./pages/RulesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

const LazyFallback = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#121212">
    <CircularProgress sx={{ color: "#FFA500" }} />
  </Box>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LazyFallback />;
  }

  if (!isAuthenticated) {
    const target = `${location.pathname}${location.search}`;
    const suffix = target && target !== "/" ? `?next=${encodeURIComponent(target)}` : "";
    return <Navigate to={`/login${suffix}`} replace />;
  }
  return children;
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
      <Suspense fallback={<LazyFallback />}>
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
          path="/admin/voting-periods"
          element={
            <AdminRoute>
              <VotingPeriodsPage />
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
        <Route
          path="/admin/sponsors"
          element={
            <AdminRoute>
              <SponsorsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sponsors/new"
          element={
            <AdminRoute>
              <SponsorFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sponsors/:id/edit"
          element={
            <AdminRoute>
              <SponsorFormPage />
            </AdminRoute>
          }
        />
        {/* StageRunner Admin Routes */}
        <Route
          path="/admin/stagerunner"
          element={
            <AdminRoute>
              <StageRunnerPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stagerunner/slides"
          element={
            <AdminRoute>
              <SlidesListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stagerunner/slides/new"
          element={
            <AdminRoute>
              <SlideEditorPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stagerunner/slides/:id"
          element={
            <AdminRoute>
              <SlideEditorPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stagerunner/control"
          element={
            <AdminRoute>
              <LiveControlPage />
            </AdminRoute>
          }
        />
        {/* StageRunner Visualizer (public for projector laptop) */}
        <Route path="/stagerunner/:editionId" element={<StageRunnerViewer />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/voting"
          element={
            <PrivateRoute>
              <VotingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/attend"
          element={
            <PrivateRoute>
              <AttendPage />
            </PrivateRoute>
          }
        />
        <Route path="/compos" element={<ComposList />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/verify-account/:token" element={<VerifyAccount />} />
        <Route path="/confirmation-sent" element={<ConfirmationSent />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
