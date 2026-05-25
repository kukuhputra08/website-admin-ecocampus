import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  DoorOpen,
  FileText,
  Trophy,
  CalendarDays,
  UserCircle,
  Gift,
  Leaf,
  Ticket,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Buildings",
    path: "/buildings",
    icon: Building2,
  },
  {
    name: "Rooms",
    path: "/rooms",
    icon: DoorOpen,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Challenges",
    path: "/challenges",
    icon: Trophy,
  },
  {
    name: "Events",
    path: "/events",
    icon: CalendarDays,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
  {
    label: "Rewards",
    path: "/rewards",
    icon: Gift,
  },
  {
    label: "Redemptions",
    path: "/redemtion",
    icon: Ticket,
  },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <Leaf size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-800">EcoCampus</h1>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
