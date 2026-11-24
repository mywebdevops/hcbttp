
import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Seo from "@/components/Seo";
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));
const Pro = lazy(() => import("./pages/Pro"));
const Join = lazy(() => import("./pages/Join"));

const App = () => (
  <ThemeProvider defaultTheme="light">
    <HashRouter>
      <Seo />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pros/:slug" element={<Pro />} />
          <Route path="/join" element={<Join />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </ThemeProvider>
);

export default App;
