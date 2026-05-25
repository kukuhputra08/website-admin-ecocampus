import { useEffect, useState } from "react";
import { CheckCircle2, Search, Ticket, XCircle } from "lucide-react";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import {
  claimRewardRedemption,
  createDummyRewardRedemption,
  getRewardRedemptionByCode,
  getRewardRedemptionsByAdmin,
} from "../services/rewardRedemptionService";

const redemptionStatusOptions = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "claimed",
    label: "Claimed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "expired",
    label: "Expired",
  },
];

function Redemptions() {
  const { currentAdmin } = useAuth();

  const [redemptions, setRedemptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [foundRedemption, setFoundRedemption] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchRedemptions() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getRewardRedemptionsByAdmin(currentAdmin);
        setRedemptions(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load redemptions.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRedemptions();
  }, [currentAdmin]);

  const filteredRedemptions = redemptions.filter((redemption) => {
    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      redemption.redeemCode?.toLowerCase().includes(keyword) ||
      redemption.rewardTitle?.toLowerCase().includes(keyword) ||
      redemption.studentName?.toLowerCase().includes(keyword) ||
      redemption.studentEmail?.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatusFilter === "all" ||
      redemption.status === selectedStatusFilter;

    return matchSearch && matchStatus;
  });

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

  async function handleSearchCode(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setFoundRedemption(null);

    if (!redeemCodeInput.trim()) {
      setErrorMessage("Redeem code is required.");
      return;
    }

    try {
      setIsSearching(true);

      const redemption = await getRewardRedemptionByCode(
        currentAdmin,
        redeemCodeInput
      );

      if (!redemption) {
        setErrorMessage("Redeem code not found.");
        return;
      }

      setFoundRedemption(redemption);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to search redeem code.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleClaimRedemption(redemption) {
    if (!redemption) return;

    if (redemption.status !== "pending") {
      setErrorMessage("Only pending redemption can be claimed.");
      return;
    }

    try {
      setIsClaiming(true);
      setErrorMessage("");
      setSuccessMessage("");

      await claimRewardRedemption(redemption.id, currentAdmin.id);

      const updatedRedemption = {
        ...redemption,
        status: "claimed",
        claimedBy: currentAdmin.id,
        claimedAt: new Date(),
      };

      setFoundRedemption(updatedRedemption);

      const updatedRedemptions = redemptions.map((item) => {
        if (item.id === redemption.id) {
          return updatedRedemption;
        }

        return item;
      });

      setRedemptions(updatedRedemptions);
      setSuccessMessage("Reward has been claimed successfully.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to claim reward.");
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Redemptions"
        description="Validate student redeem codes and mark rewards as claimed."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Ticket size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Verify Redeem Code
              </h2>
              <p className="text-sm text-slate-500">
                Input code shown by student.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchCode} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Redeem Code
              </label>

              <input
                type="text"
                value={redeemCodeInput}
                onChange={(event) =>
                  setRedeemCodeInput(event.target.value.toUpperCase())
                }
                placeholder="Example: ECO-8F2K9P"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Search size={18} />
              {isSearching ? "Searching..." : "Search Code"}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {foundRedemption && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Redeem Code
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-800">
                    {foundRedemption.redeemCode}
                  </h3>
                </div>

                <StatusBadge status={foundRedemption.status} />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Reward
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {foundRedemption.rewardTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {foundRedemption.pointsUsed} points
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Student
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {foundRedemption.studentName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {foundRedemption.studentEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Created At
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(foundRedemption.createdAt)}
                  </p>
                </div>

                {foundRedemption.status === "claimed" && (
                  <div className="rounded-2xl bg-emerald-100 p-4 text-sm text-emerald-700">
                    This reward has already been claimed.
                  </div>
                )}

                {foundRedemption.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleClaimRedemption(foundRedemption)}
                    disabled={isClaiming}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <CheckCircle2 size={18} />
                    {isClaiming ? "Claiming..." : "Mark as Claimed"}
                  </button>
                )}

                {foundRedemption.status !== "pending" &&
                  foundRedemption.status !== "claimed" && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                      This redemption cannot be claimed because its status is{" "}
                      {foundRedemption.status}.
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Redemption History
              </h2>
              <p className="text-sm text-slate-500">
                Showing reward redemptions for {currentAdmin?.departmentName}.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-400" />

                <input
                  type="text"
                  placeholder="Search redemption..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-56"
                />
              </div>

              <select
                value={selectedStatusFilter}
                onChange={(event) =>
                  setSelectedStatusFilter(event.target.value)
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 outline-none transition focus:border-emerald-500"
              >
                <option value="all">All Status</option>

                {redemptionStatusOptions.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Loading redemptions...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[950px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Reward</th>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Points</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created At</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredRedemptions.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800">
                          {redemption.redeemCode}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {redemption.rewardTitle}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">
                          {redemption.studentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {redemption.studentEmail}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold text-emerald-700">
                        {redemption.pointsUsed} pts
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={redemption.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(redemption.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        {redemption.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleClaimRedemption(redemption)
                            }
                            disabled={isClaiming}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
                          >
                            Claim
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <XCircle size={14} />
                            No action
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredRedemptions.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No redemptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Redemptions;