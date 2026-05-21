import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

import { dummyDepartments, dummyUniversitas } from "../data/dummyData";
import { registerAdmin } from "../services/authService";

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [universityName, setUniversityName] = useState("");
  const [universityShortName, setUniversityShortName] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function findMatchingUniversity(nameInput, shortNameInput) {
    return dummyUniversitas.find((university) => {
      const matchName =
        university.name.toLowerCase() === nameInput.toLowerCase().trim();

      const matchShortName =
        university.shortName.toLowerCase() ===
        shortNameInput.toLowerCase().trim();

      return matchName || matchShortName;
    });
  }

  function findMatchingDepartment(departmentInput, universityId) {
    return dummyDepartments.find((department) => {
      const matchDepartment =
        department.name.toLowerCase() === departmentInput.toLowerCase().trim();

      const matchUniversity = department.universityId === universityId;

      return matchDepartment && matchUniversity;
    });
  }

  function buildUniversityData() {
    const matchedUniversity = findMatchingUniversity(
      universityName,
      universityShortName
    );

    if (matchedUniversity) {
      return matchedUniversity;
    }

    return {
      id: createSlug(universityShortName || universityName),
      name: universityName.trim(),
      shortName: universityShortName.trim().toUpperCase(),
      city: "",
      status: "active",
    };
  }

  function buildDepartmentData(universityId) {
    const matchedDepartment = findMatchingDepartment(
      departmentName,
      universityId
    );

    if (matchedDepartment) {
      return matchedDepartment;
    }

    return {
      id: createSlug(departmentName),
      universityId,
      name: departmentName.trim(),
      adminId: null,
      status: "active",
    };
  }

  function handleUniversityNameChange(value) {
    setUniversityName(value);

    const matchedUniversity = dummyUniversitas.find(
      (university) => university.name.toLowerCase() === value.toLowerCase()
    );

    if (matchedUniversity) {
      setUniversityShortName(matchedUniversity.shortName);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (!universityName.trim()) {
      setErrorMessage("University name is required.");
      return;
    }

    if (!universityShortName.trim()) {
      setErrorMessage("University short name is required. Example: ITS.");
      return;
    }

    if (!departmentName.trim()) {
      setErrorMessage("Department name is required.");
      return;
    }

    const university = buildUniversityData();
    const department = buildDepartmentData(university.id);

    if (department.adminId) {
      setErrorMessage("This department already has an admin.");
      return;
    }

    try {
      setIsLoading(true);

      await registerAdmin({
        name,
        email,
        password,
        university,
        department,
      });

      navigate("/verify-email");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Password is too weak.");
      } else {
        setErrorMessage(error.message || "Failed to register admin.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Leaf size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">EcoCampus</h1>
            <p className="text-sm text-slate-500">Admin Registration</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-slate-800">Register Admin</h2>
        <p className="mt-2 text-slate-500">
          Type your university and department. One department can only have one
          admin account.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Admin Teknik Elektro"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@its.ac.id"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              University Name
            </label>

            <input
              type="text"
              value={universityName}
              onChange={(event) =>
                handleUniversityNameChange(event.target.value)
              }
              list="university-options"
              placeholder="Example: Institut Teknologi Sepuluh Nopember"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
            />

            <datalist id="university-options">
              {dummyUniversitas.map((university) => (
                <option key={university.id} value={university.name} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                University Short Name
              </label>

              <input
                type="text"
                value={universityShortName}
                onChange={(event) =>
                  setUniversityShortName(event.target.value.toUpperCase())
                }
                placeholder="Example: ITS"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Department Name
              </label>

              <input
                type="text"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                list="department-options"
                placeholder="Example: Teknik Elektro"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />

              <datalist id="department-options">
                {dummyDepartments.map((department) => (
                  <option key={department.id} value={department.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Firebase will send a verification email after registration. Admin
            can access the dashboard after the email is verified.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? "Registering..." : "Register & Send Verification Email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;