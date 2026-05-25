import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Flag,
  Gift,
  GraduationCap,
  Ticket,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

const DUMMY_STUDENT_ID = "student_001";

function generateRedeemCode() {
  return `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function StudentSimulator() {
  const { currentAdmin } = useAuth();

  const [student, setStudent] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState([]);
  const [rewardRedemptions, setRewardRedemptions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [isRedeemingReward, setIsRedeemingReward] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [latestRedeemCode, setLatestRedeemCode] = useState("");

  useEffect(() => {
    async function fetchSimulatorData() {
      if (!currentAdmin) return;

      try {
        setIsLoading(true);
        setMessage("");
        setErrorMessage("");

        const studentRef = doc(db, "users", DUMMY_STUDENT_ID);
        const studentSnapshot = await getDoc(studentRef);

        if (!studentSnapshot.exists()) {
          setErrorMessage(
            "Dummy student not found. Please create users/student_001 first.",
          );
          return;
        }

        const studentData = {
          id: studentSnapshot.id,
          ...studentSnapshot.data(),
        };

        const challengesQuery = query(
          collection(db, "challenges"),
          where("universityId", "==", currentAdmin.universityId),
          where("departmentId", "==", currentAdmin.departmentId),
          where("status", "==", "active"),
        );

        const rewardsQuery = query(
          collection(db, "rewards"),
          where("universityId", "==", currentAdmin.universityId),
          where("departmentId", "==", currentAdmin.departmentId),
          where("status", "==", "active"),
        );

        const submissionsQuery = query(
          collection(db, "challengeSubmissions"),
          where("studentId", "==", DUMMY_STUDENT_ID),
          where("universityId", "==", currentAdmin.universityId),
          where("departmentId", "==", currentAdmin.departmentId),
        );

        const redemptionsQuery = query(
          collection(db, "rewardRedemptions"),
          where("studentId", "==", DUMMY_STUDENT_ID),
          where("universityId", "==", currentAdmin.universityId),
          where("departmentId", "==", currentAdmin.departmentId),
        );

        const [
          challengesSnapshot,
          rewardsSnapshot,
          submissionsSnapshot,
          redemptionsSnapshot,
        ] = await Promise.all([
          getDocs(challengesQuery),
          getDocs(rewardsQuery),
          getDocs(submissionsQuery),
          getDocs(redemptionsQuery),
        ]);

        setStudent(studentData);

        setChallenges(
          challengesSnapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );

        setRewards(
          rewardsSnapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );

        setChallengeSubmissions(
          submissionsSnapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );

        setRewardRedemptions(
          redemptionsSnapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Failed to load simulator data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSimulatorData();
  }, [currentAdmin]);

  function hasSubmittedChallenge(challengeId) {
    return challengeSubmissions.some(
      (submission) =>
        submission.challengeId === challengeId &&
        submission.status !== "rejected",
    );
  }

  function getSubmissionStatus(challengeId) {
    const submission = challengeSubmissions.find(
      (item) => item.challengeId === challengeId,
    );

    return submission?.status || null;
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

  async function handleSubmitChallenge(challenge) {
    setMessage("");
    setErrorMessage("");

    if (hasSubmittedChallenge(challenge.id)) {
      setErrorMessage("This student has already submitted this challenge.");
      return;
    }

    try {
      setIsSubmittingChallenge(true);

      const submissionRef = doc(collection(db, "challengeSubmissions"));

      await runTransaction(db, async (transaction) => {
        transaction.set(submissionRef, {
          challengeId: challenge.id,

          studentId: DUMMY_STUDENT_ID,
          studentName: student.name,
          studentEmail: student.email,

          proofImageUrl:
            "https://res.cloudinary.com/drwstiasl/image/upload/v1779742671/ecocampus/fqa3fceopcfuywoclyzo.png",

          submittedQuantity:
            challenge.proofType === "photo_quantity"
              ? Number(challenge.quantityRequired || 1)
              : null,

          note:
            challenge.proofType === "photo_quantity"
              ? `Saya sudah menyelesaikan challenge sebanyak ${challenge.quantityRequired} item.`
              : "Saya sudah menyelesaikan challenge ini dan mengunggah bukti foto.",

          status: "submitted",
          pointsAwarded: 0,
          adminNote: "",

          universityId: currentAdmin.universityId,
          universityName: currentAdmin.universityName,
          universityShortName: currentAdmin.universityShortName,

          departmentId: currentAdmin.departmentId,
          departmentName: currentAdmin.departmentName,

          submittedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      const newSubmission = {
        id: submissionRef.id,
        challengeId: challenge.id,

        studentId: DUMMY_STUDENT_ID,
        studentName: student.name,
        studentEmail: student.email,

        proofImageUrl:
          "https://res.cloudinary.com/drwstiasl/image/upload/v1779386494/ecocampus/kogojqimck0yljvn36j.png",

        submittedQuantity:
          challenge.proofType === "photo_quantity"
            ? Number(challenge.quantityRequired || 1)
            : null,

        note:
          challenge.proofType === "photo_quantity"
            ? `Saya sudah menyelesaikan challenge sebanyak ${challenge.quantityRequired} item.`
            : "Saya sudah menyelesaikan challenge ini dan mengunggah bukti foto.",

        status: "submitted",
        pointsAwarded: 0,
        adminNote: "",

        universityId: currentAdmin.universityId,
        departmentId: currentAdmin.departmentId,

        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setChallengeSubmissions([newSubmission, ...challengeSubmissions]);

      setMessage(
        `Challenge "${challenge.title}" submitted successfully. Open Challenges page to approve it.`,
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to submit challenge.");
    } finally {
      setIsSubmittingChallenge(false);
    }
  }

  async function handleRedeemReward(reward) {
    setMessage("");
    setErrorMessage("");
    setLatestRedeemCode("");

    if (!student) return;

    if (Number(student.points || 0) < Number(reward.pointsRequired)) {
      setErrorMessage("Student points are not enough to redeem this reward.");
      return;
    }

    if (Number(reward.stock || 0) <= 0) {
      setErrorMessage("Reward stock is empty.");
      return;
    }

    try {
      setIsRedeemingReward(true);

      const redeemCode = generateRedeemCode();

      const studentRef = doc(db, "users", DUMMY_STUDENT_ID);
      const rewardRef = doc(db, "rewards", reward.id);
      const redemptionRef = doc(collection(db, "rewardRedemptions"));

      await runTransaction(db, async (transaction) => {
        const studentSnapshot = await transaction.get(studentRef);
        const rewardSnapshot = await transaction.get(rewardRef);

        if (!studentSnapshot.exists()) {
          throw new Error("Student not found.");
        }

        if (!rewardSnapshot.exists()) {
          throw new Error("Reward not found.");
        }

        const studentData = studentSnapshot.data();
        const rewardData = rewardSnapshot.data();

        const currentPoints = Number(studentData.points || 0);
        const currentStock = Number(rewardData.stock || 0);
        const pointsRequired = Number(rewardData.pointsRequired || 0);

        if (currentPoints < pointsRequired) {
          throw new Error("Student points are not enough.");
        }

        if (currentStock <= 0) {
          throw new Error("Reward stock is empty.");
        }

        transaction.update(studentRef, {
          points: currentPoints - pointsRequired,
          updatedAt: serverTimestamp(),
        });

        transaction.update(rewardRef, {
          stock: currentStock - 1,
          updatedAt: serverTimestamp(),
        });

        transaction.set(redemptionRef, {
          rewardId: reward.id,
          rewardTitle: rewardData.title,

          studentId: DUMMY_STUDENT_ID,
          studentName: studentData.name,
          studentEmail: studentData.email,

          pointsUsed: pointsRequired,
          redeemCode,

          status: "pending",

          universityId: currentAdmin.universityId,
          universityName: currentAdmin.universityName,
          universityShortName: currentAdmin.universityShortName,

          departmentId: currentAdmin.departmentId,
          departmentName: currentAdmin.departmentName,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),

          claimedAt: null,
          claimedBy: null,
        });
      });

      const updatedStudent = {
        ...student,
        points: Number(student.points || 0) - Number(reward.pointsRequired),
      };

      const updatedRewards = rewards.map((item) => {
        if (item.id === reward.id) {
          return {
            ...item,
            stock: Number(item.stock) - 1,
          };
        }

        return item;
      });

      const newRedemption = {
        id: redemptionRef.id,
        rewardId: reward.id,
        rewardTitle: reward.title,

        studentId: DUMMY_STUDENT_ID,
        studentName: student.name,
        studentEmail: student.email,

        pointsUsed: Number(reward.pointsRequired),
        redeemCode,

        status: "pending",

        universityId: currentAdmin.universityId,
        departmentId: currentAdmin.departmentId,

        createdAt: new Date(),
        updatedAt: new Date(),

        claimedAt: null,
        claimedBy: null,
      };

      setStudent(updatedStudent);
      setRewards(updatedRewards);
      setRewardRedemptions([newRedemption, ...rewardRedemptions]);
      setLatestRedeemCode(redeemCode);

      setMessage(
        `Reward "${reward.title}" redeemed successfully. Use code ${redeemCode} in Redemptions page.`,
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to redeem reward.");
    } finally {
      setIsRedeemingReward(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Student Simulator"
        description="Simulate student actions before the Flutter mobile app is ready."
      />

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-bold">Development Only</p>
        <p className="mt-1">
          This page simulates the Flutter student app. Remove or hide this page
          before final production release.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Loading student simulator...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Dummy Student
                  </h2>
                  <p className="text-sm text-slate-500">
                    Simulated mobile user
                  </p>
                </div>
              </div>

              {student ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Name
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {student.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {student.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {student.departmentName}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-3 text-emerald-600">
                        <Coins size={24} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          Current Points
                        </p>
                        <h3 className="text-3xl font-bold text-slate-800">
                          {student.points || 0}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {latestRedeemCode && (
                    <div className="rounded-3xl border border-emerald-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Latest Redeem Code
                      </p>
                      <h3 className="mt-2 text-3xl font-bold tracking-wide text-emerald-700">
                        {latestRedeemCode}
                      </h3>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Student data not found.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Flag size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Available Challenges
                  </h2>
                  <p className="text-sm text-slate-500">
                    Submit challenge as dummy student.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {challenges.map((challenge) => {
                  const submitted = hasSubmittedChallenge(challenge.id);
                  const submissionStatus = getSubmissionStatus(challenge.id);

                  return (
                    <div
                      key={challenge.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {challenge.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {challenge.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                              {challenge.points} points
                            </span>

                            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">
                              {challenge.proofType === "photo_quantity"
                                ? `Photo + ${challenge.quantityRequired} items`
                                : "Photo Evidence"}
                            </span>
                          </div>

                          {submissionStatus && (
                            <div className="mt-3">
                              <StatusBadge status={submissionStatus} />
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSubmitChallenge(challenge)}
                          disabled={isSubmittingChallenge || submitted}
                          className="rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {submitted ? "Already Submitted" : "Submit Challenge"}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {challenges.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No active challenges found.Fpr
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <Gift size={24} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Reward Store
                </h2>
                <p className="text-sm text-slate-500">
                  Redeem rewards using dummy student points.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rewards.map((reward) => {
                const canRedeem =
                  Number(student?.points || 0) >=
                    Number(reward.pointsRequired) && Number(reward.stock) > 0;

                return (
                  <div
                    key={reward.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {reward.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {reward.description}
                        </p>
                      </div>

                      <Ticket size={22} className="text-violet-500" />
                    </div>

                    <div className="mt-5 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Required Points</span>
                        <span className="font-bold text-emerald-700">
                          {reward.pointsRequired} pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Stock</span>
                        <span
                          className={`font-bold ${
                            Number(reward.stock) <= 0
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {reward.stock}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status</span>
                        <StatusBadge status={reward.status} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeemReward(reward)}
                      disabled={isRedeemingReward || !canRedeem}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <BadgeCheck size={18} />
                      {canRedeem ? "Redeem Reward" : "Cannot Redeem"}
                    </button>
                  </div>
                );
              })}

              {rewards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                  No active rewards found.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Student Redemption History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest reward redemptions made by dummy student.
            </p>

            <div className="mt-5 space-y-3">
              {rewardRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {redemption.rewardTitle}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Code: {redemption.redeemCode} •{" "}
                      {formatDate(redemption.createdAt)}
                    </p>
                  </div>

                  <StatusBadge status={redemption.status} />
                </div>
              ))}

              {rewardRedemptions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  No redemptions yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentSimulator;
