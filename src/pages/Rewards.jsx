import { useEffect, useState } from "react";
import { Gift, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import {
  addReward,
  deleteReward,
  getRewardsByAdmin,
  updateReward,
} from "../services/rewardService";

const rewardStatusOptions = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];

function Rewards() {
  const { currentAdmin } = useAuth();

  const [rewards, setRewards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [selectedReward, setSelectedReward] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("active");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchRewards() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getRewardsByAdmin(currentAdmin);
        setRewards(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load rewards.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewards();
  }, [currentAdmin]);

  const filteredRewards = rewards.filter((reward) => {
    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      reward.title.toLowerCase().includes(keyword) ||
      reward.description.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatusFilter === "all" || reward.status === selectedStatusFilter;

    return matchSearch && matchStatus;
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setPointsRequired("");
    setStock("");
    setStatus("active");
    setSelectedReward(null);
    setFormMode("add");
  }

  function handleAddReward() {
    resetForm();
    setFormMode("add");
    setIsFormModalOpen(true);
  }

  function handleEditReward(reward) {
    setFormMode("edit");
    setSelectedReward(reward);

    setTitle(reward.title);
    setDescription(reward.description);
    setPointsRequired(reward.pointsRequired);
    setStock(reward.stock);
    setStatus(reward.status);

    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    resetForm();
    setIsFormModalOpen(false);
  }

  async function handleSubmitReward(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Reward title is required.");
      return;
    }

    if (!description.trim()) {
      alert("Reward description is required.");
      return;
    }

    if (!pointsRequired || Number(pointsRequired) <= 0) {
      alert("Points required must be greater than 0.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      alert("Stock cannot be empty or negative.");
      return;
    }

    try {
      setIsSaving(true);

      const rewardData = {
        title,
        description,
        pointsRequired: Number(pointsRequired),
        stock: Number(stock),
        status,
      };

      if (formMode === "edit") {
        await updateReward(selectedReward.id, rewardData);

        const updatedRewards = rewards.map((reward) => {
          if (reward.id === selectedReward.id) {
            return {
              ...reward,
              ...rewardData,
            };
          }

          return reward;
        });

        setRewards(updatedRewards);
        closeFormModal();
        return;
      }

      const newRewardId = await addReward(currentAdmin, rewardData);

      const newReward = {
        id: newRewardId,
        ...rewardData,

        universityId: currentAdmin.universityId,
        universityName: currentAdmin.universityName,
        universityShortName: currentAdmin.universityShortName,

        departmentId: currentAdmin.departmentId,
        departmentName: currentAdmin.departmentName,

        createdBy: currentAdmin.id,
        createdAt: new Date(),
      };

      setRewards([newReward, ...rewards]);
      closeFormModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save reward.");
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteModal(reward) {
    setSelectedReward(reward);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setSelectedReward(null);
    setIsDeleteModalOpen(false);
  }

  async function handleDeleteReward() {
    if (!selectedReward) return;

    try {
      await deleteReward(selectedReward.id);

      const updatedRewards = rewards.filter(
        (reward) => reward.id !== selectedReward.id
      );

      setRewards(updatedRewards);
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      alert("Failed to delete reward.");
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
        title="Rewards"
        description="Manage redeemable rewards for students based on EcoCampus points."
        actionLabel="Add Reward"
        onAction={handleAddReward}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Reward List</h2>
            <p className="text-sm text-slate-500">
              Showing rewards for {currentAdmin?.departmentName}.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search reward..."
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

              {rewardStatusOptions.map((statusOption) => (
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
            Loading rewards...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reward</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created At</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredRewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                          <Gift size={20} />
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {reward.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-semibold text-emerald-700">
                      {reward.pointsRequired} pts
                    </td>

                    <td className="px-4 py-4">
                      <p
                        className={`font-semibold ${
                          Number(reward.stock) <= 0
                            ? "text-red-600"
                            : "text-slate-700"
                        }`}
                      >
                        {reward.stock}
                      </p>
                      <p className="text-xs text-slate-500">
                        {Number(reward.stock) <= 0
                          ? "Out of stock"
                          : "Available"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={reward.status} />
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(reward.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditReward(reward)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(reward)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRewards.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No rewards found.
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800">
              {formMode === "edit" ? "Edit Reward" : "Add Reward"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formMode === "edit"
                ? "Update reward information."
                : `Create a redeemable reward for ${currentAdmin?.departmentName}.`}
            </p>

            <form onSubmit={handleSubmitReward} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Reward Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Air Mineral 1 Liter"
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
                  placeholder="Example: Tukar poin untuk mendapatkan air mineral 1 liter."
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Points Required
                  </label>

                  <input
                    type="number"
                    value={pointsRequired}
                    onChange={(event) => setPointsRequired(event.target.value)}
                    placeholder="1000"
                    min="1"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="50"
                    min="0"
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
                    {rewardStatusOptions.map((statusOption) => (
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
                <p className="font-semibold">Reward flow</p>
                <p className="mt-1">
                  Students will redeem this reward using their EcoCampus points.
                  A unique redeem code will be generated in the mobile app and
                  validated by the admin later.
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
                    ? "Update Reward"
                    : "Save Reward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Reward"
        message={`Are you sure you want to delete "${
          selectedReward?.title || "this reward"
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteReward}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default Rewards;