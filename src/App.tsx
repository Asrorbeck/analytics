import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { DataProvider } from "@/lib/data-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import UploadPage from "./pages/UploadPage";
import PreviewPage from "./pages/PreviewPage";
import StatisticsPage from "./pages/StatisticsPage";
import VisualizationPage from "./pages/VisualizationPage";
import AIPage from "./pages/AIPage";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/upload" replace />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="preview" element={<PreviewPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="visualization" element={<VisualizationPage />} />
                <Route path="ai" element={<AIPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
