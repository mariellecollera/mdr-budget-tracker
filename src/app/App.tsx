import { Routes, Route } from "react-router-dom";
import BackToTop from "../components/BackToTop";
import BottomNav from "../components/BottomNav";
import FolderTabs from "../components/FolderTabs";
import Header from "../components/Header";
import Account from "../features/profile/Account";
import Bills from "../features/bills/Bills";
import Dashboard from "../features/dashboard/Dashboard";
import AddTransaction from "../features/transactions/AddTransaction";
import TransactionDetail from "../features/transactions/TransactionDetail";
import Transactions from "../features/transactions/Transactions";
import Summary from "../features/summary/Summary";

export default function App() {
  return (
    <div
      // The bottom padding keeps content clear of the phone bottom nav.
      className="min-h-screen pb-20 md:p-5"
      style={{ backgroundColor: "var(--color-bg-app)" }}
    >
      <Header />
      <div className="mx-auto max-w-[1016px] px-4 md:mt-5 md:px-5">
        <FolderTabs />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/account" element={<Account />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/transaction/:id" element={<TransactionDetail />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
      <BackToTop />
    </div>
  );
}
