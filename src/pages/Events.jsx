import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import {
  addEvent,
  deleteEvent,
  getEventsByAdmin,
  updateEvent,
} from "../services/eventService";

import { getEventParticipantsByAdmin } from "../services/eventParticipantService";

const eventStatusOptions = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

function Events() {
  const { currentAdmin } = useAuth();

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [quota, setQuota] = useState("");
  const [status, setStatus] = useState("active");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [eventsData, participantsData] = await Promise.all([
          getEventsByAdmin(currentAdmin),
          getEventParticipantsByAdmin(currentAdmin),
        ]);

        setEvents(eventsData);
        setParticipants(participantsData);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load events.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentAdmin]);

  const filteredEvents = events.filter((event) => {
    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      event.title.toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatusFilter === "all" || event.status === selectedStatusFilter;

    return matchSearch && matchStatus;
  });

  function getEventParticipants(eventId) {
    return participants.filter((participant) => participant.eventId === eventId);
  }

  function getRegisteredCount(eventId) {
    return getEventParticipants(eventId).length;
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setQuota("");
    setStatus("active");
    setSelectedEvent(null);
    setFormMode("add");
  }

  function handleAddEvent() {
    resetForm();
    setFormMode("add");
    setIsFormModalOpen(true);
  }

  function handleEditEvent(event) {
    setFormMode("edit");
    setSelectedEvent(event);

    setTitle(event.title);
    setDescription(event.description);
    setLocation(event.location);
    setDate(event.date);
    setQuota(event.quota);
    setStatus(event.status);

    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    resetForm();
    setIsFormModalOpen(false);
  }

  async function handleSubmitEvent(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Event title is required");
      return;
    }

    if (!description.trim()) {
      alert("Event description is required");
      return;
    }

    if (!location.trim()) {
      alert("Event location is required");
      return;
    }

    if (!date) {
      alert("Event date is required");
      return;
    }

    if (!quota || Number(quota) <= 0) {
      alert("Quota must be greater than 0");
      return;
    }

    try {
      setIsSaving(true);

      const eventData = {
        title,
        description,
        location,
        date,
        quota: Number(quota),
        status,
      };

      if (formMode === "edit") {
        await updateEvent(selectedEvent.id, eventData);

        const updatedEvents = events.map((eventItem) => {
          if (eventItem.id === selectedEvent.id) {
            return {
              ...eventItem,
              ...eventData,
            };
          }

          return eventItem;
        });

        setEvents(updatedEvents);
        closeFormModal();
        return;
      }

      const newEventId = await addEvent(currentAdmin, eventData);

      const newEvent = {
        id: newEventId,
        ...eventData,
        registeredCount: 0,
        universityId: currentAdmin.universityId,
        universityName: currentAdmin.universityName,
        universityShortName: currentAdmin.universityShortName,
        scope: "university",
        createdBy: currentAdmin.id,
        createdByDepartmentId: currentAdmin.departmentId,
        createdByDepartmentName: currentAdmin.departmentName,
        createdAt: new Date(),
      };

      setEvents([newEvent, ...events]);
      closeFormModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  }

  function openDetailModal(event) {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  }

  function closeDetailModal() {
    setSelectedEvent(null);
    setIsDetailModalOpen(false);
  }

  function openDeleteModal(event) {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setSelectedEvent(null);
    setIsDeleteModalOpen(false);
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return;

    try {
      await deleteEvent(selectedEvent.id);

      const updatedEvents = events.filter(
        (event) => event.id !== selectedEvent.id
      );

      setEvents(updatedEvents);
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete event.");
    }
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

  return (
    <div>
      <PageHeader
        title="Events"
        description="Create campus-wide volunteer events and monitor registered participants."
        actionLabel="Add Event"
        onAction={handleAddEvent}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Event List</h2>
            <p className="text-sm text-slate-500">
              Showing campus-wide events for {currentAdmin?.universityShortName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search event..."
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

              {eventStatusOptions.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
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
            Loading events...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Volunteers</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredEvents.map((event) => {
                  const registeredCount = getRegisteredCount(event.id);
                  const isFull = registeredCount >= event.quota;

                  return (
                    <tr key={event.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {event.title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {event.description}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {event.location}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {event.date}
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">
                            {registeredCount}/{event.quota}
                          </p>
                          <p
                            className={`text-xs ${
                              isFull ? "text-red-500" : "text-slate-500"
                            }`}
                          >
                            {isFull ? "Quota full" : "Available"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={event.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        Campus-wide
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailModal(event)}
                            className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Detail
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditEvent(event)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(event)}
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Event Detail
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View event information and registered volunteers.
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

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h3 className="font-bold text-slate-800">
                  {selectedEvent.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedEvent.description}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedEvent.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedEvent.date}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Volunteers
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getRegisteredCount(selectedEvent.id)} /{" "}
                      {selectedEvent.quota} registered
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={selectedEvent.status} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Scope
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Campus-wide event for {currentAdmin?.universityShortName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Created By Department
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedEvent.createdByDepartmentName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Registered Volunteers
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Students from any department in the same university can
                      register for this event.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {getRegisteredCount(selectedEvent.id)} volunteers
                  </span>
                </div>

                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-3xl border border-slate-200 p-4">
                  {getEventParticipants(selectedEvent.id).map(
                    (participant) => (
                      <div
                        key={participant.id}
                        className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {participant.studentName}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {participant.studentEmail}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            {participant.departmentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Registered at {formatDate(participant.registeredAt)}
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  {getEventParticipants(selectedEvent.id).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                      <p className="font-semibold text-slate-700">
                        No volunteers registered yet.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Volunteer registrations from the mobile app will appear
                        here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800">
              {formMode === "edit" ? "Edit Event" : "Add Event"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formMode === "edit"
                ? "Update campus-wide event information."
                : `Create a campus-wide event for ${currentAdmin?.universityShortName}.`}
            </p>

            <form onSubmit={handleSubmitEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Event Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Clean Up Campus ITS"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain the event purpose and activity."
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Example: Taman Alumni ITS"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Quota
                  </label>

                  <input
                    type="number"
                    value={quota}
                    onChange={(event) => setQuota(event.target.value)}
                    placeholder="100"
                    min="1"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  >
                    {eventStatusOptions.map((statusOption) => (
                      <option
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                <p className="font-semibold">Event scope</p>
                <p className="mt-1">
                  Events are campus-wide. Students from all departments in{" "}
                  {currentAdmin?.universityShortName} can view and register for
                  this event.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
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
                  {isSaving
                    ? "Saving..."
                    : formMode === "edit"
                    ? "Update Event"
                    : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${
          selectedEvent?.title || "this event"
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteEvent}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default Events;