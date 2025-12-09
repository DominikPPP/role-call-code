"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import { completeLeaveTask } from "@/lib/actions-leave";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LeaveTask({ params }: { params: { id: string } }) {
  const { id } = params;
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

    if (task === "manager-approval") {
      extra.manager_decision = decisionValue;
    }

    if (task === "hr-approval") {
      extra.hr_notes = notes;
      extra.hr_decision = decisionValue;
    }

    if (task === "hr-register") {
      extra.registered = true;
    }

    const result = await completeLeaveTask(id, task, extra);
    if (result.success) router.push("/tasks");
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!taskData) return <p className="p-6">Task not found.</p>;

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

      {/* MANAGER APPROVAL */}
      {task === "manager-approval" && (
        <>
          <Label>Manager Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </>
      )}

      {/* HR APPROVAL */}
      {task === "hr-approval" && (
        <>
          <Label>HR Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Label>HR Decision</Label>
          <select
            className="border p-2 rounded w-full"
            value={decisionValue}
            onChange={(e) => setDecisionValue(e.target.value)}
          >
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </>
      )}

      {/* HR REGISTER / ARCHIVE */}
      {task === "hr-register" && (
        <p>This request is ready for HR registration.</p>
      )}

      <Button onClick={handleComplete} className="w-full">
        Complete Task
      </Button>

      <Button variant="secondary" className="w-full" onClick={() => router.push("/tasks")}>
        Back
      </Button>
    </div>
  );
}
