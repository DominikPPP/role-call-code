"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import { completeLeaveTask } from "@/lib/actions-leave";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ---------------- PROCESS TIMELINE ----------------

function ProcessTimeline({ currentTask }: { currentTask: string }) {
  const steps = [
    { id: "head-approval", label: "Head Approval" },
    { id: "pd-review", label: "PD Review" },
    { id: "prk-review", label: "PRK Review" },
    { id: "prn-review", label: "PRN Review" },
    { id: "rkr-decision", label: "Rector Decision" },
    { id: "hr-register", label: "HR Register" }
  ];

  const index = steps.findIndex((s) => s.id === currentTask);

  return (
    <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-semibold mb-3">Process Timeline</h3>

      <ul className="space-y-1">
        {steps.map((s, i) => {
          const isDone = i < index;
          const isCurrent = i === index;

          return (
            <li key={s.id} className="flex items-center">
              <span className="mr-2">{isDone ? "●" : "○"}</span>
              <span
                className={
                  isDone
                    ? "line-through opacity-60"
                    : isCurrent
                    ? "font-bold"
                    : "opacity-60"
                }
              >
                {s.label}
                {isCurrent && " (current)"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------- MAIN PAGE ----------------

export default function LeaveTaskPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const { user } = useAuth();

  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [decisionValue, setDecisionValue] = useState("Approved");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "processInstances", id));
      if (snap.exists()) {
        setTaskData(snap.data());
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleComplete() {
    if (!taskData) return;

    const task = taskData.currentTask;
    const extra: any = {};

    if (task === "head-approval") extra.manager_decision = decisionValue;

    if (task === "pd-review") {
      extra.pd_notes = notes;
      extra.pd_decision = decisionValue;
      extra.is_academic_teacher = true;
    }

    if (task === "prk-review") extra.prk_review = decisionValue;

    if (task === "prn-review") extra.prn_review = decisionValue;

    if (task === "rkr-decision") extra.final_decision = decisionValue;

    if (task === "hr-register") extra.registered = true;

    const result = await completeLeaveTask(id, task, extra);

    if (result.success) router.push("/tasks");
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!taskData) return <p className="p-6">Task not found.</p>;
  if (!user) return null;

  const v = taskData.variables;
  const task = taskData.currentTask;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* 🔥 NOWY ELEMENT — identyczny jak w innych procesach */}
      <ProcessTimeline currentTask={task} />

      <h2 className="text-2xl font-bold capitalize">{task}</h2>

      <div className="border p-4 rounded-lg space-y-1">
        <p><b>Employee:</b> {v.employee_name}</p>
        <p><b>Leave Type:</b> {v.leaveType}</p>
        <p><b>Start:</b> {v.startDate}</p>
        <p><b>End:</b> {v.endDate}</p>
        <p><b>Duration:</b> {v.duration} days</p>
      </div>

      {/* DYNAMIC TASK UI */}
      {task === "head-approval" && (
        <>
          <Label>Head Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </>
      )}

      {task === "pd-review" && (
        <>
          <Label>PD Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

          <Label>PD Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </>
      )}

      {task === "prk-review" && (
        <>
          <Label>PRK Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </>
      )}

      {task === "prn-review" && (
        <>
          <Label>PRN Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </>
      )}

      {task === "rkr-decision" && (
        <>
          <Label>Final Decision (RKR)</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </>
      )}

      {task === "hr-register" && (
        <p>This request is ready to be registered by HR.</p>
      )}

      <Button onClick={handleComplete} className="w-full">
        Complete Task
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => router.push("/tasks")}
      >
        Back
      </Button>
    </div>
  );
}
