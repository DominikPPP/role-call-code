// src/app/tasks/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { completeTask } from "@/lib/actions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 👇 TU JEST NAJWAŻNIEJSZA ZMIANA – params jako Promise + use()
export default function TaskDetails(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);

  const router = useRouter();
  const { user } = useAuth();

  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // pola formularzy
  const [reviewerOpinion, setReviewerOpinion] = useState("Strongly support");
  const [rkrDecision, setRkrDecision] = useState<"Accepted" | "Rejected">(
    "Accepted"
  );
  const [awardGrantDate, setAwardGrantDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // -------------------------------------------------------
  // LOAD TASK
  // -------------------------------------------------------
  useEffect(() => {
    async function loadTask() {
      const ref = doc(db, "processInstances", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setTaskData(data);

        const vars = (data as any).variables ?? {};
        if (vars.reviewer_opinion) setReviewerOpinion(vars.reviewer_opinion);
        if (vars.rkr_decision) setRkrDecision(vars.rkr_decision);
        if (vars.award_grant_date)
          setAwardGrantDate(String(vars.award_grant_date).slice(0, 10));
      }

      setLoading(false);
    }

    loadTask();
  }, [id]);

  // -------------------------------------------------------
  // COMPLETE TASK
  // -------------------------------------------------------
  async function handleComplete() {
    if (!taskData) return;

    const task = taskData.currentTask as string;
    const extra: any = {};

    if (task === "review-and-forward") {
      extra.reviewer_opinion = reviewerOpinion;
    }

    if (task === "make-decision") {
      extra.rkr_decision = rkrDecision;
    }

    if (task === "enter-into-register") {
      extra.award_grant_date = awardGrantDate;
    }

    const result = await completeTask(id, task, extra);

    if (result.success) {
      alert("Task completed.");
      router.push("/tasks");
    } else {
      alert("Error while completing task.");
    }
  }

  if (!user) return null;
  if (loading) return <p className="p-6">Loading...</p>;
  if (!taskData) return <p className="p-6">Task not found.</p>;

  const v = taskData.variables || {};
  const task = taskData.currentTask as string;

  const taskNameMap: Record<string, string> = {
    "present-to-prk": "Present applications for acceptance",
    "review-and-forward": "Review applications and forward",
    "present-reviewed-to-rkr": "Present reviewed applications",
    "make-decision": "Make decision",
    "forward-accepted-to-mpd": "Forward accepted applications",
    "handle-external-transfer": "Handle external transfer",
    "receive-decision": "Receive decision",
    "enter-into-register": "Enter decoration into register",
  };

  const title = taskNameMap[task] ?? task;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border p-4 rounded-lg">
            <p>
              <b>Employee Name:</b> {v.employee_name}
            </p>
            <p>
              <b>Organizational Unit:</b> {v.organizational_unit}
            </p>
            <p>
              <b>Decoration Type:</b> {v.decoration_type}
            </p>
            <p>
              <b>Justification:</b> {v.application_justification}
            </p>

            {v.reviewer_opinion && (
              <p>
                <b>Reviewer Opinion:</b> {v.reviewer_opinion}
              </p>
            )}
            {v.rkr_decision && (
              <p>
                <b>RKR Decision:</b> {v.rkr_decision}
              </p>
            )}
            {v.award_grant_date && (
              <p>
                <b>Award Grant Date:</b>{" "}
                {String(v.award_grant_date).slice(0, 10)}
              </p>
            )}
          </div>

          {/* PRK */}
          {task === "review-and-forward" && (
            <div className="space-y-2">
              <Label>Reviewer Opinion</Label>
              <Textarea
                value={reviewerOpinion}
                onChange={(e) => setReviewerOpinion(e.target.value)}
              />
            </div>
          )}

          {/* RKR */}
          {task === "make-decision" && (
            <div className="space-y-2">
              <Label>RKR Decision</Label>
              <select
                className="border rounded px-3 py-2"
                value={rkrDecision}
                onChange={(e) =>
                  setRkrDecision(e.target.value as "Accepted" | "Rejected")
                }
              >
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* PD */}
          {task === "enter-into-register" && (
            <div className="space-y-2">
              <Label>Award Grant Date</Label>
              <Input
                type="date"
                value={awardGrantDate}
                onChange={(e) => setAwardGrantDate(e.target.value)}
              />
            </div>
          )}

          <Button className="w-full mt-4" onClick={handleComplete}>
            Complete Task
          </Button>
        </CardContent>
      </Card>

      {/* guzik powrotu */}
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
