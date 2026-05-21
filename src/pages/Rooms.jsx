import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";

import { useAuth } from "../contexts/AuthContext";

import { getBuildingsByAdmin } from "../services/buildingService";
import {
  addRoom,
  deleteRoom,
  getRoomsByAdmin,
  updateRoom,
} from "../services/roomService";

const roomTypes = [
  "Ruang Kelas",
  "Laboratorium",
  "Ruang Dosen",
  "Aula",
  "Ruang Rapat",
  "Lainnya",
];

function Rooms() {
  const { currentAdmin } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState("all");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  const [roomName, setRoomName] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [floor, setFloor] = useState("");
  const [roomType, setRoomType] = useState("Ruang Kelas");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [buildingsData, roomsData] = await Promise.all([
          getBuildingsByAdmin(currentAdmin),
          getRoomsByAdmin(currentAdmin),
        ]);

        setBuildings(buildingsData);
        setRooms(roomsData);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load rooms.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentAdmin]);

  const filteredRooms = rooms.filter((room) => {
    const matchSearch = room.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchBuilding =
      selectedBuildingFilter === "all" ||
      room.buildingId === selectedBuildingFilter;

    return matchSearch && matchBuilding;
  });

  function getBuildingName(roomBuildingId) {
    const building = buildings.find(
      (building) => building.id === roomBuildingId
    );

    return building ? building.name : "Unknown Building";
  }

  function resetForm() {
    setRoomName("");
    setBuildingId("");
    setFloor("");
    setRoomType("Ruang Kelas");
    setSelectedRoom(null);
    setFormMode("add");
  }

  function handleAddRoom() {
    resetForm();
    setFormMode("add");
    setBuildingId(buildings[0]?.id || "");
    setIsFormModalOpen(true);
  }

  function handleEditRoom(room) {
    setFormMode("edit");
    setSelectedRoom(room);

    setRoomName(room.name);
    setBuildingId(room.buildingId);
    setFloor(room.floor);
    setRoomType(room.type);

    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    resetForm();
    setIsFormModalOpen(false);
  }

  async function handleSubmitRoom(event) {
    event.preventDefault();

    if (!roomName.trim()) {
      alert("Room name is required");
      return;
    }

    if (!buildingId) {
      alert("Building is required");
      return;
    }

    if (!floor) {
      alert("Floor is required");
      return;
    }

    try {
      setIsSaving(true);

      const roomData = {
        name: roomName,
        buildingId,
        floor: Number(floor),
        type: roomType,
      };

      if (formMode === "edit") {
        await updateRoom(selectedRoom.id, roomData);

        const updatedRooms = rooms.map((room) => {
          if (room.id === selectedRoom.id) {
            return {
              ...room,
              ...roomData,
            };
          }

          return room;
        });

        setRooms(updatedRooms);
        closeFormModal();
        return;
      }

      const newRoomId = await addRoom(currentAdmin, roomData);

      const newRoom = {
        id: newRoomId,
        ...roomData,
        universityId: currentAdmin.universityId,
        universityName: currentAdmin.universityName,
        universityShortName: currentAdmin.universityShortName,
        departmentId: currentAdmin.departmentId,
        departmentName: currentAdmin.departmentName,
        createdAt: new Date(),
      };

      setRooms([newRoom, ...rooms]);
      closeFormModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save room.");
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteModal(room) {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setSelectedRoom(null);
    setIsDeleteModalOpen(false);
  }

  async function handleDeleteRoom() {
    if (!selectedRoom) return;

    try {
      await deleteRoom(selectedRoom.id);

      const updatedRooms = rooms.filter((room) => room.id !== selectedRoom.id);

      setRooms(updatedRooms);
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete room.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        description="Manage rooms based on buildings in your department."
        actionLabel="Add Room"
        onAction={handleAddRoom}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Room List</h2>
            <p className="text-sm text-slate-500">
              Showing rooms for {currentAdmin?.departmentName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search room..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-56"
              />
            </div>

            <select
              value={selectedBuildingFilter}
              onChange={(event) => setSelectedBuildingFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All Buildings</option>

              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
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
            Loading rooms...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Room Name</th>
                  <th className="px-4 py-3 font-semibold">Building</th>
                  <th className="px-4 py-3 font-semibold">Floor</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {room.name}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {getBuildingName(room.buildingId)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      Floor {room.floor}
                    </td>

                    <td className="px-4 py-4 text-slate-600">{room.type}</td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditRoom(room)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(room)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRooms.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No rooms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800">
              {formMode === "edit" ? "Edit Room" : "Add Room"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formMode === "edit"
                ? "Update room information."
                : `Add a new room for ${currentAdmin?.departmentName}.`}
            </p>

            {buildings.length === 0 && (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                You need to create a building first before adding rooms.
              </div>
            )}

            <form onSubmit={handleSubmitRoom} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Room Name
                </label>

                <input
                  type="text"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder="Example: IF-105"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Building
                </label>

                <select
                  value={buildingId}
                  onChange={(event) => setBuildingId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                >
                  <option value="">Select building</option>

                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Floor
                  </label>

                  <input
                    type="number"
                    value={floor}
                    onChange={(event) => setFloor(event.target.value)}
                    placeholder="Example: 2"
                    min="1"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Type
                  </label>

                  <select
                    value={roomType}
                    onChange={(event) => setRoomType(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
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
                  disabled={isSaving || buildings.length === 0}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving
                    ? "Saving..."
                    : formMode === "edit"
                    ? "Update Room"
                    : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Room"
        message={`Are you sure you want to delete "${
          selectedRoom?.name || "this room"
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteRoom}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default Rooms;