import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { RequireAdminAuth } from "./components/admin/RequireAdminAuth";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const WorkPage = lazy(() => import("./pages/WorkPage").then((m) => ({ default: m.WorkPage })));
const BlogPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() =>
  import("./pages/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })),
);
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

const AdminLoginPage = lazy(() =>
  import("./pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminBlogEditorPage = lazy(() =>
  import("./pages/AdminBlogEditorPage").then((m) => ({ default: m.AdminBlogEditorPage })),
);

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
            <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
