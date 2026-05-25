import { useEffect, useState } from "react";
import { Database, Gift, Ticket } from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";

import { getRewardsByAdmin } from "../services/rewardService";
import { createDummyRewardRedemption } from "../services/rewardRedemptionService";

function DevTools() {
  const { currentAdmin } = useAuth();

  const [rewards, setRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchRewards() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getRewardsByAdmin(currentAdmin);
        setRewards(data);

        const firstAvailableReward =
          data.find(
            (reward) => reward.status === "active" && Number(reward.stock) > 0
          ) || data[0];

        if (firstAvailableReward) {
          setSelectedRewardId(firstAvailableReward.id);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load rewards.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRewards();
  }, [currentAdmin]);

  async function handleCreateDummyRedemption() {
    setErrorMessage("");
    setSuccessMessage("");
    setCreatedCode("");

    if (!selectedRewardId) {
      setErrorMessage("Please select a reward first.");
      return;
    }

    const selectedReward = rewards.find(
      (reward) => reward.id === selectedRewardId
    );

    if (!selectedReward) {
      setErrorMessage("Selected reward was not found.");
      return;
    }

    if (Number(selectedReward.stock) <= 0) {
      setErrorMessage("Selected reward is out of stock.");
      return;
    }

    try {
      setIsCreating(true);

      const newRedemption = await createDummyRewardRedemption(
        currentAdmin,
        selectedReward
      );

      setCreatedCode(newRedemption.redeemCode);

      const updatedRewards = rewards.map((reward) => {
        if (reward.id === selectedReward.id) {
          return {
            ...reward,
            stock: Number(reward.stock) - 1,
          };
        }

        return reward;
      });

      setRewards(updatedRewards);

      setSuccessMessage(
        `Dummy redemption created successfully with code ${newRedemption.redeemCode}.`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to create dummy redemption.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Dev Tools"
        description="Temporary tools for creating testing data during development."
      />

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-bold">Development Only</p>
        <p className="mt-1">
          This page is only for testing. Remove this route before final
          production release if it is no longer needed.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Database size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Generated Data
              </h2>
              <p className="text-sm text-slate-500">
                Result from testing tools.
              </p>
            </div>
          </div>

          {createdCode ? (
            <div className="mt-5 rounded-3xl border border-emerald-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Generated Redeem Code
              </p>

              <h3 className="mt-2 text-3xl font-bold tracking-wide text-emerald-700">
                {createdCode}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Use this code on the Redemptions page to test reward claiming.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No redeem code generated yet.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Ticket size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Create Dummy Reward Redemption
              </h2>
              <p className="text-sm text-slate-500">
                Create a pending redemption code for testing claim flow.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Loading rewards...
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Select Reward
                </label>

                <select
                  value={selectedRewardId}
                  onChange={(event) => setSelectedRewardId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                >
                  <option value="">Select reward</option>

                  {rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.title} - {reward.pointsRequired} pts - Stock{" "}
                      {reward.stock}
                    </option>
                  ))}
                </select>
              </div>

              {rewards.length === 0 && (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                  No rewards found. Please create at least one reward from the
                  Rewards page first.
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Gift size={18} className="mt-0.5 text-emerald-600" />

                  <div>
                    <p className="font-semibold text-slate-800">
                      Dummy Student Data
                    </p>
                    <p className="mt-1">
                      Student: Budi Santoso, Email: budi@student.its.ac.id
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateDummyRedemption}
                disabled={isCreating || rewards.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Ticket size={18} />
                {isCreating ? "Creating..." : "Create Dummy Redemption"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevTools;