import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { RedirectPage } from './pages/RedirectPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/q/:code" element={<RedirectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
