import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import { getBuildingsByAdmin } from "../services/buildingService";
import { getRoomsByAdmin } from "../services/roomService";
import {
  getReportsByAdmin,
  updateReportStatus,
} from "../services/reportService";

const reportStatusOptions = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

function Reports() {
  const { currentAdmin } = useAuth();

  const [reports, setReports] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [statusInput, setStatusInput] = useState("pending");
  const [adminNoteInput, setAdminNoteInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [reportsData, buildingsData, roomsData] = await Promise.all([
          getReportsByAdmin(currentAdmin),
          getBuildingsByAdmin(currentAdmin),
          getRoomsByAdmin(currentAdmin),
        ]);

        setReports(reportsData);
        setBuildings(buildingsData);
        setRooms(roomsData);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentAdmin]);

  const filteredReports = reports.filter((report) => {
    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      report.title.toLowerCase().includes(keyword) ||
      report.category.toLowerCase().includes(keyword) ||
      report.reportedBy.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatusFilter === "all" ||
      report.status === selectedStatusFilter;

    return matchSearch && matchStatus;
  });

  function getBuildingName(buildingId) {
    const building = buildings.find((building) => building.id === buildingId);

    return building ? building.name : "Unknown Building";
  }

  function getRoomName(roomId) {
    if (!roomId) {
      return "Area umum";
    }

    const room = rooms.find((room) => room.id === roomId);

    return room ? room.name : "Unknown Room";
  }

  function getReportLocation(report) {
    const buildingName = getBuildingName(report.buildingId);
    const roomName = getRoomName(report.roomId);

    return `${buildingName} / ${roomName}`;
  }

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

  function openDetailModal(report) {
    setSelectedReport(report);
    setStatusInput(report.status);
    setAdminNoteInput(report.adminNote || "");
    setIsDetailModalOpen(true);
  }

  function closeDetailModal() {
    setSelectedReport(null);
    setStatusInput("pending");
    setAdminNoteInput("");
    setIsDetailModalOpen(false);
  }

  async function handleSaveReportStatus(event) {
    event.preventDefault();

    if (!selectedReport) return;

    try {
      setIsSaving(true);

      await updateReportStatus(
        selectedReport.id,
        statusInput,
        adminNoteInput
      );

      const updatedReports = reports.map((report) => {
        if (report.id === selectedReport.id) {
          return {
            ...report,
            status: statusInput,
            adminNote: adminNoteInput,
          };
        }

        return report;
      });

      setReports(updatedReports);
      closeDetailModal();
    } catch (error) {
      console.error(error);
      alert("Failed to update report status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review student reports, check evidence photos, and manage report status."
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Report List</h2>
            <p className="text-sm text-slate-500">
              Showing reports for {currentAdmin?.departmentName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search report..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-56"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(event) => setSelectedStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All Status</option>

              {reportStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Loading reports...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Photo</th>
                  <th className="px-4 py-3 font-semibold">Report Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Reported By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          className="h-14 w-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
                          No photo
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">
                        {report.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {report.description}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {report.category}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {getReportLocation(report)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {report.reportedBy}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(report.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openDetailModal(report)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReports.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Report Detail
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review evidence and update report status.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {selectedReport.imageUrl ? (
              <img
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                className="h-64 w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                No evidence photo
              </div>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-500">
                  Report Information
                </h3>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Title
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedReport.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Description
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {selectedReport.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedReport.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {getReportLocation(selectedReport)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Reported By
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedReport.reportedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveReportStatus}
                className="rounded-3xl border border-slate-200 p-5"
              >
                <h3 className="text-sm font-semibold text-slate-500">
                  Manage Status
                </h3>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700">
                    Current Status
                  </label>

                  <div className="mt-2">
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700">
                    Update Status
                  </label>

                  <select
                    value={statusInput}
                    onChange={(event) => setStatusInput(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  >
                    {reportStatusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700">
                    Admin Note
                  </label>

                  <textarea
                    value={adminNoteInput}
                    onChange={(event) => setAdminNoteInput(event.target.value)}
                    placeholder="Example: Sedang diteruskan ke petugas fasilitas."
                    rows="5"
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    disabled={isSaving}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;