import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TwoPartMold from './pages/TwoPartMold';
import AdaptiveMold from './pages/AdaptiveMold';
import BaseMold from './pages/BaseMold';
import PlanterMold from './pages/PlanterMold';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/two-part" replace />} />
          <Route path="/two-part" element={<TwoPartMold />} />
          <Route path="/adaptive" element={<AdaptiveMold />} />
          <Route path="/base" element={<BaseMold />} />
          <Route path="/planter" element={<PlanterMold />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}