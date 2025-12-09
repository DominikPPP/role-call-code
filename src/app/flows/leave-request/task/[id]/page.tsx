"use client";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import { completeLeaveTask } from "@/lib/actions-leave";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeaveTaskPageProps {
  params: {
    id: string;
  };
}

export default async function LeaveTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const router = useRouter();
  const { user } = useAuth();

  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [decisionValue, setDecisionValue] = useState("Approved");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "processInstances", id));
      if (snap.exists()) setTaskData(snap.data());
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleComplete() {
    if (!taskData) return;

    const task = taskData.currentTask;
    const extra: any = {};

    if (task === "head-approval") {
      extra.manager_decision = decisionValue;
    }

    if (task === "pd-review") {
      extra.pd_notes = notes;
      extra.pd_decision = decisionValue;
      extra.is_academic_teacher = true;
    }

    if (task === "prk-review") {
      extra.prk_review = decisionValue;
    }

    if (task === "prn-review") {
      extra.prn_review = decisionValue;
    }

    if (task === "rkr-decision") {
      extra.final_decision = decisionValue;
    }

    if (task === "hr-register") {
      extra.registered = true;
    }

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
      <h2 className="text-2xl font-bold capitalize">{task}</h2>

      <div className="border p-4 rounded-lg space-y-1">
        <p><b>Employee:</b> {v.employee_name}</p>
        <p><b>Leave Type:</b> {v.leaveType}</p>
        <p><b>Start:</b> {v.startDate}</p>
        <p><b>End:</b> {v.endDate}</p>
        <p><b>Duration:</b> {v.duration} days</p>
      </div>

      {/* HEAD APPROVAL */}
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

      {/* PD REVIEW */}
      {task === "pd-review" && (
        <>
          <Label>PD Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

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

      {/* PRK REVIEW */}
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

      {/* PRN REVIEW */}
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

      {/* RKR FINAL DECISION */}
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

      {/* HR REGISTER */}
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
