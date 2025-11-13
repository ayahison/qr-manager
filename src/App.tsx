import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { RedirectPage } from "./pages/RedirectPage";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 menit (dalam milidetik)

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const inactivityTimer = useRef<number | undefined>(undefined);

  // 🔹 Cek apakah sebelumnya sudah login
  useEffect(() => {
    const saved = localStorage.getItem("admin_logged_in");
    if (saved === "true") {
      setLoggedIn(true);
      startInactivityTimer();
    }
  }, []);

  // 🔹 Fungsi login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_logged_in", "true");
      setLoggedIn(true);
      startInactivityTimer();
    } else {
      alert("Password salah!");
    }
  };

  // 🔹 Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    setLoggedIn(false);
    stopInactivityTimer();
  };

  // 🔹 Mulai timer auto logout
  const startInactivityTimer = () => {
    stopInactivityTimer();
    inactivityTimer.current = window.setTimeout(() => {
      alert("Sesi berakhir karena tidak ada aktivitas selama 30 menit.");
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  // 🔹 Hentikan timer
  const stopInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  };

  // 🔹 Reset timer setiap ada aktivitas user
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const resetTimer = () => {
      if (loggedIn) startInactivityTimer();
    };

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [loggedIn]);

  const LoginPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Login Dashboard</h1>
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-3 bg-white p-6 rounded-lg shadow-md"
      >
        <input
          type="password"
          placeholder="Masukkan Password"
          className="border border-gray-300 px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public: QR Redirect */}
        <Route path="/q/:code" element={<RedirectPage />} />

        {/* Private: Dashboard */}
        <Route
          path="/"
          element={loggedIn ? <Dashboard onLogout={handleLogout} /> : <LoginPage />}
        />

        {/* Redirect semua rute tak dikenal ke "/" */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
