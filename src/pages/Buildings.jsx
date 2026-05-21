import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";

import { dummyRooms } from "../data/dummyData";
import { useAuth } from "../contexts/AuthContext";

import {
  addBuilding,
  deleteBuilding,
  getBuildingsByAdmin,
  updateBuilding,
} from "../services/buildingService";

function Buildings() {
  const { currentAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [buildings, setBuildings] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [formMode, setFormMode] = useState("add");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchBuildings() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getBuildingsByAdmin(currentAdmin);
        setBuildings(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to load buildings.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuildings();
  }, [currentAdmin]);

  function handleAddBuilding() {
    setFormMode("add");
    setSelectedBuilding(null);
    setBuildingName("");
    setIsFormModalOpen(true);
  }

  function handleEditBuilding(building) {
    setFormMode("edit");
    setSelectedBuilding(building);
    setBuildingName(building.name);
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setFormMode("add");
    setSelectedBuilding(null);
    setBuildingName("");
    setIsFormModalOpen(false);
  }

  async function handleSubmitBuilding(event) {
    event.preventDefault();

    if (!buildingName.trim()) {
      alert("Building name is required");
      return;
    }

    try {
      setIsSaving(true);

      if (formMode === "edit") {
        await updateBuilding(selectedBuilding.id, buildingName);

        const updatedBuildings = buildings.map((building) => {
          if (building.id === selectedBuilding.id) {
            return {
              ...building,
              name: buildingName,
            };
          }

          return building;
        });

        setBuildings(updatedBuildings);
        closeFormModal();
        return;
      }

      const newBuildingId = await addBuilding(currentAdmin, buildingName);

      const newBuilding = {
        id: newBuildingId,
        name: buildingName,
        universityId: currentAdmin.universityId,
        universityName: currentAdmin.universityName,
        universityShortName: currentAdmin.universityShortName,
        departmentId: currentAdmin.departmentId,
        departmentName: currentAdmin.departmentName,
        createdAt: new Date(),
      };

      setBuildings([newBuilding, ...buildings]);
      closeFormModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save building.");
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteModal(building) {
    setSelectedBuilding(building);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setSelectedBuilding(null);
    setIsDeleteModalOpen(false);
  }

  async function handleDeleteBuilding() {
    if (!selectedBuilding) return;

    try {
      await deleteBuilding(selectedBuilding.id);

      const updatedBuildings = buildings.filter(
        (building) => building.id !== selectedBuilding.id
      );

      setBuildings(updatedBuildings);
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete building.");
    }
  }

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getRoomCount(buildingId) {
    return dummyRooms.filter((room) => room.buildingId === buildingId).length;
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
        title="Buildings"
        description="Manage buildings in your department."
        actionLabel="Add Building"
        onAction={handleAddBuilding}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Building List
            </h2>
            <p className="text-sm text-slate-500">
              Showing buildings for {currentAdmin?.departmentName}.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search building..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-56"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Loading buildings...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Building Name</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Rooms</th>
                  <th className="px-4 py-3 font-semibold">Created At</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredBuildings.map((building) => (
                  <tr key={building.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {building.name}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {currentAdmin?.departmentName}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {getRoomCount(building.id)} rooms
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(building.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditBuilding(building)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(building)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBuildings.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No buildings found.
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800">
              {formMode === "edit" ? "Edit Building" : "Add Building"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formMode === "edit"
                ? "Update building information."
                : `Add a new building for ${currentAdmin?.departmentName}.`}
            </p>

            <form onSubmit={handleSubmitBuilding} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Building Name
                </label>

                <input
                  type="text"
                  value={buildingName}
                  onChange={(event) => setBuildingName(event.target.value)}
                  placeholder="Example: Gedung Informatika"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
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
                    ? "Update Building"
                    : "Save Building"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Building"
        message={`Are you sure you want to delete "${
          selectedBuilding?.name || "this building"
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteBuilding}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default Buildings;