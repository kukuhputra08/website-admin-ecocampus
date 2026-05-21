import { useNavigate } from "react-router-dom";

import {
  Building2,
  GraduationCap,
  LogOut,
  Mail,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { logoutAdmin } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { currentAdmin } = useAuth();

  async function handleLogout() {
    try {
      await logoutAdmin();
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Failed to logout. Please try again.");
    }
  }

  if (!currentAdmin) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">
          Admin profile not found
        </h1>
        <p className="mt-2 text-slate-500">
          Your account is logged in, but admin data could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="View your admin account and EcoCampus access scope."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserCircle size={56} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              {currentAdmin.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {currentAdmin.email}
            </p>

            <span className="mt-4 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
              {currentAdmin.role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information for the logged-in admin.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <UserCircle size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Name
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {currentAdmin.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <Mail size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {currentAdmin.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {currentAdmin.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Admin ID
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {currentAdmin.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              EcoCampus Access Scope
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your access is limited based on your university and department.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <GraduationCap size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">
                      University Scope
                    </p>

                    <h3 className="mt-1 font-bold text-slate-800">
                      {currentAdmin.universityName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Events are campus-wide and visible to all departments in{" "}
                      {currentAdmin.universityShortName}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Department Scope
                    </p>

                    <h3 className="mt-1 font-bold text-slate-800">
                      {currentAdmin.departmentName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Buildings, rooms, reports, and challenges are managed only
                      for this department.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-5">
              <h3 className="font-bold text-emerald-800">
                Access Rule Summary
              </h3>

              <div className="mt-3 grid gap-3 text-sm text-emerald-700 md:grid-cols-2">
                <div>
                  <p className="font-semibold">Department Scope</p>
                  <p className="mt-1">
                    Buildings, rooms, reports, and challenges are filtered by
                    universityId and departmentId.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">University Scope</p>
                  <p className="mt-1">
                    Events are filtered only by universityId, so all departments
                    in the same campus can access them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Firebase Integration
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This page now reads admin profile data from Firestore through{" "}
              <span className="font-semibold text-slate-700">AuthContext</span>.
              The logout button uses Firebase Auth{" "}
              <span className="font-semibold text-slate-700">signOut()</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;