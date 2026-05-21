import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  DoorOpen,
  FileText,
  Flag,
  Leaf,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import { getBuildingsByAdmin } from "../services/buildingService";
import { getRoomsByAdmin } from "../services/roomService";
import { getReportsByAdmin } from "../services/reportService";
import { getChallengesByAdmin } from "../services/challengeService";
import { getEventsByAdmin } from "../services/eventService";

function Dashboard() {
  const { currentAdmin } = useAuth();

  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reports, setReports] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [
          buildingsData,
          roomsData,
          reportsData,
          challengesData,
          eventsData,
        ] = await Promise.all([
          getBuildingsByAdmin(currentAdmin),
          getRoomsByAdmin(currentAdmin),
          getReportsByAdmin(currentAdmin),
          getChallengesByAdmin(currentAdmin),
          getEventsByAdmin(currentAdmin),
        ]);

        setBuildings(buildingsData);
        setRooms(roomsData);
        setReports(reportsData);
        setChallenges(challengesData);
        setEvents(eventsData);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentAdmin]);

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  ).length;

  const inProgressReports = reports.filter(
    (report) => report.status === "in_progress"
  ).length;

  const completedReports = reports.filter(
    (report) => report.status === "completed"
  ).length;

  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "active"
  ).length;

  const activeEvents = events.filter((event) => event.status === "active").length;

  const recentReports = reports.slice(0, 5);
  const recentEvents = events.slice(0, 5);

  function formatDate(value) {
    if (!value) return "-";

    if (value?.toDate) {
      return value.toDate().toLocaleDateString("id-ID");
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("id-ID");
    }

    return String(value);
  }

  const overviewCards = [
    {
      title: "Buildings",
      value: buildings.length,
      description: "Department buildings",
      icon: Building2,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      title: "Rooms",
      value: rooms.length,
      description: "Registered rooms",
      icon: DoorOpen,
      gradient: "from-sky-500 to-cyan-500",
      bg: "bg-sky-50",
      text: "text-sky-700",
    },
    {
      title: "Reports",
      value: reports.length,
      description: `${pendingReports} pending reports`,
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      title: "Events",
      value: events.length,
      description: `${activeEvents} active events`,
      icon: CalendarDays,
      gradient: "from-violet-500 to-fuchsia-500",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ];

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-sm">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute bottom-[-70px] right-28 h-44 w-44 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-emerald-50">
              <Leaf size={16} />
              EcoCampus Admin Dashboard
            </div>

            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome back, {currentAdmin?.name}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-emerald-50">
              Manage sustainability data for {currentAdmin?.departmentName} in{" "}
              {currentAdmin?.universityShortName}. Track reports, challenges,
              rooms, and campus-wide events from one place.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/20 p-3">
                <Sparkles size={24} />
              </div>

              <div>
                <p className="text-sm text-emerald-50">Active Challenges</p>
                <p className="text-3xl font-bold">{activeChallenges}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-emerald-50">
              Challenges currently visible to students.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Loading dashboard data...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-2xl ${card.bg} p-3 ${card.text}`}>
                        <Icon size={24} />
                      </div>

                      <p className="text-3xl font-bold text-slate-800">
                        {card.value}
                      </p>
                    </div>

                    <h3 className="mt-5 font-bold text-slate-800">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-amber-600 shadow-sm">
                  <TriangleAlert size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-amber-700">
                    Pending Reports
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800">
                    {pendingReports}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-amber-800">
                Reports that still need admin review.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                  <FileText size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    In Progress
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800">
                    {inProgressReports}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-blue-800">
                Reports currently being handled.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-100 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                  <Flag size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Completed Reports
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800">
                    {completedReports}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-emerald-800">
                Reports that have been resolved.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Recent Reports
                  </h2>
                  <p className="text-sm text-slate-500">
                    Latest student reports in your department.
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <FileText size={20} />
                </div>
              </div>

              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 transition hover:border-amber-200 hover:bg-amber-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {report.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {report.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {report.reportedBy} • {formatDate(report.createdAt)}
                        </p>
                      </div>

                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                ))}

                {recentReports.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No reports yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Campus Events
                  </h2>
                  <p className="text-sm text-slate-500">
                    Campus-wide sustainability events.
                  </p>
                </div>

                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <CalendarDays size={20} />
                </div>
              </div>

              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-slate-100 bg-gradient-to-r from-violet-50 to-white p-4 transition hover:border-violet-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {event.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {event.location}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {event.date} • Quota {event.quota}
                        </p>
                      </div>

                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                ))}

                {recentEvents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No events yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Access Scope Summary
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are managing{" "}
              <span className="font-semibold text-emerald-700">
                {currentAdmin?.departmentName}
              </span>{" "}
              in{" "}
              <span className="font-semibold text-emerald-700">
                {currentAdmin?.universityShortName}
              </span>
              . Buildings, rooms, reports, and challenges are scoped to your
              department. Events are scoped to the whole university.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;