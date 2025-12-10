"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

import { completeTask } from "@/lib/actions"; // decorations
import { completeTaskChangeEmployment } from "@/lib/actions-change-employment"; // new

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProcessTimeline({
  currentTask,
  process,
}: {
  currentTask: string;
  process: string;
}) {
  const steps =
    process === "change-of-employment"
      ? [
          { id: "head-approval", label: "Head of O.U." },
          { id: "pd-review", label: "PD" },
          { id: "kwe-review", label: "Quartermaster" },
          { id: "prk-review", label: "PRK" },
          { id: "prn-review", label: "PRN" },
          { id: "rector-decision", label: "Rector (RKR)" },
          { id: "pd-finalize", label: "PD finalize" },
          { id: "pd-archive", label: "PD archive" },
        ]
      : [
          { id: "present-to-prk", label: "PD → PRK" },
          { id: "review-and-forward", label: "PRK Review" },
          { id: "present-reviewed-to-rkr", label: "PD → RKR" },
          { id: "make-decision", label: "Rector Decision" },
          { id: "forward-accepted-to-mpd", label: "PD → MPD" },
          { id: "handle-external-transfer", label: "MPD" },
          { id: "receive-decision", label: "PD receives" },
          { id: "enter-into-register", label: "PD Register" },
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

// ******************************************************************
//  ✔ POPRAWIONA SEKCJA — komponent NIE jest async, params NIE są Promise
// ******************************************************************

export default function TaskDetails() {
  // 🔥 Najważniejsza poprawka:
  const { id } = useParams() as { id: string };

  const router = useRouter();
  const { user } = useAuth();

  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [textValue, setTextValue] = useState("");
  const [decisionValue, setDecisionValue] = useState("Approved");

  // -------------------------------------------------------
  // LOAD TASK
  // -------------------------------------------------------
  useEffect(() => {
    async function loadTask() {
      const ref = doc(db, "processInstances", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setTaskData(snap.data());
      }

      setLoading(false);
    }

    loadTask();
  }, [id]);

  // -------------------------------------------------------
  // COMPLETE TASK HANDLER
  // -------------------------------------------------------
  async function handleComplete() {
    if (!taskData) return;

    const process = taskData.processType;
    const task = taskData.currentTask;

    const extra: any = {};

    // decorations
    if (process === "decorations-and-medals") {
      if (task === "review-and-forward") extra.reviewer_opinion = textValue;
      if (task === "make-decision") extra.rkr_decision = decisionValue;

      const result = await completeTask(id, task, extra);
      if (result.success) {
        alert("Task completed.");
        router.push("/tasks");
      }
      return;
    }

    // change-of-employment
    if (process === "change-of-employment") {
      if (task === "head-approval") extra.status = decisionValue;

      if (task === "pd-review") {
        extra.pd_review_status = decisionValue;
        extra.is_academic_teacher = true;
      }

      if (task === "kwe-review") extra.kwe_financial_opinion = decisionValue;

      if (task === "prk-review") extra.prk_opinion = textValue;

      if (task === "prn-review") extra.prn_opinion = textValue;

      if (task === "rector-decision") extra.final_decision = decisionValue;

      const result = await completeTaskChangeEmployment(id, task, extra);
      if (result.success) {
        alert("Task completed.");
        router.push("/tasks");
      }
      return;
    }
  }

  if (!user) return null;
  if (loading) return <p className="p-6">Loading...</p>;
  if (!taskData) return <p className="p-6">Task not found.</p>;

  const v = taskData.variables || {};
  const task = taskData.currentTask;
  const process = taskData.processType;

  // -------------------------------------------------------------------------------------
  // RENDER COMMON DATA
  // -------------------------------------------------------------------------------------
  function renderCommonData() {
    return (
      <div className="border p-4 rounded-lg mb-4">
        <p>
          <b>Employee Name:</b> {v.employee_name}
        </p>

        {process === "decorations-and-medals" && (
          <>
            <p>
              <b>Organizational Unit:</b> {v.organizational_unit}
            </p>
            <p>
              <b>Decoration Type:</b> {v.decoration_type}
            </p>
            <p>
              <b>Justification:</b> {v.application_justification}
            </p>
          </>
        )}

        {process === "change-of-employment" && (
          <>
            <p>
              <b>Proposed Conditions:</b> {v.proposed_conditions}
            </p>
            <p>
              <b>Justification:</b> {v.change_justification}
            </p>
            <p>
              <b>Effective Date:</b> {v.change_effective_date}
            </p>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------------------
  // RENDER TASK FORM
  // -------------------------------------------------------------------------------------
  function renderTaskForm() {
    if (process === "decorations-and-medals") {
      switch (task) {
        case "review-and-forward":
          return (
            <>
              <Label>Reviewer Opinion</Label>
              <Textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </>
          );

        case "make-decision":
          return (
            <>
              <Label>Decision</Label>
              <select
                value={decisionValue}
                onChange={(e) => setDecisionValue(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </>
          );

        default:
          return <p>No additional input required.</p>;
      }
    }

    if (process === "change-of-employment") {
      switch (task) {
        case "head-approval":
        case "pd-review":
        case "kwe-review":
        case "rector-decision":
          return (
            <>
              <Label>Status / Decision</Label>
              <select
                value={decisionValue}
                onChange={(e) => setDecisionValue(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </>
          );

        case "prk-review":
        case "prn-review":
          return (
            <>
              <Label>Opinion</Label>
              <Textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </>
          );

        default:
          return <p>No additional input required.</p>;
      }
    }

    return null;
  }

  // -------------------------------------------------------------------------------------

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <ProcessTimeline currentTask={task} process={process} />

      <Card>
        <CardHeader>
          <CardTitle>{task}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderCommonData()}
          {renderTaskForm()}

          <Button onClick={handleComplete} className="w-full mt-4">
            Complete Task
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="secondary"
        className="w-full mt-4"
        onClick={() => router.push("/tasks")}
      >
        Back to My Tasks
      </Button>
    </div>
  );
}
