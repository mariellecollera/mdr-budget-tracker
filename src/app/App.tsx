import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Dashboard from "../features/dashboard/Dashboard";
import AddTransaction from "../features/transactions/AddTransaction";
import TransactionDetail from "../features/transactions/TransactionDetail";
import Summary from "../features/summary/Summary";

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg-app)" }}
    >
      <div className="mx-auto max-w-5xl px-2 py-6 sm:px-6">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/transaction/:id" element={<TransactionDetail />} />
        </Routes>
      </div>
    </div>
  );
}
