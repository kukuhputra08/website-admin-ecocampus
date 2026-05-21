import { Bell, Search } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { currentAdmin } = useAuth();

  const initial = currentAdmin?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">
          EcoCampus Admin
        </h2>
        <p className="text-xs text-slate-500">
          Manage your department sustainability data
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            {initial}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800">
              {currentAdmin?.name || "Admin"}
            </p>
            <p className="text-xs text-slate-500">
              {currentAdmin?.departmentName} •{" "}
              {currentAdmin?.universityShortName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;