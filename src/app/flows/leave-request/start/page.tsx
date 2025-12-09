"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LeaveStart() {
  const { user } = useAuth();
  const router = useRouter();

  // FORM STATE
  const [position, setPosition] = useState(""); 
  const [leaveType, setLeaveType] = useState("Recreational");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [requestDate] = useState(new Date().toISOString().split("T")[0]);

  // AUTO CALCULATE DURATION
  useEffect(() => {
    if (startDate && endDate) {
      const diff =
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24);

      setDuration(diff > 0 ? `${diff}` : "0");
    }
  }, [startDate, endDate]);

  async function handleSubmit() {
    if (!user) return;

    await addDoc(collection(db, "processInstances"), {
      processType: "leave-request",
      status: "In Progress",
      createdAt: serverTimestamp(),

      // FIRST TASK
      currentTask: "head-approval", 
      currentAssigneeRole: "Head of O.U.",

      variables: {
        employee_name: user.name,
        employee_position: position,
        employee_id: user.id,

        leaveType,
        reason,
        startDate,
        endDate,
        duration,
        substitute,
        requestDate,
      },
    });

    alert("Leave Request submitted successfully!");
    router.push("/tasks");
  }

  if (!user) return null;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Leave Request</h2>

      {/* EMPLOYEE NAME */}
      <div>
        <Label>Employee Name</Label>
        <Input value={user.name} disabled />
      </div>

      {/* POSITION */}
      <div>
        <Label>Employee Position</Label>
        <Input
          placeholder="e.g. Professor"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
      </div>

      {/* TYPE */}
      <div>
        <Label>Leave Type</Label>
        <select
          className="border p-2 w-full rounded"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
        >
          <option>Recreational</option>
          <option>Sick</option>
          <option>Unpaid</option>
        </select>
      </div>

      {/* REASON */}
      <div>
        <Label>Justification</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the reason for leave..."
        />
      </div>

      {/* START DATE */}
      <div>
        <Label>Leave Start Date</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* END DATE */}
      <div>
        <Label>Leave End Date</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* DURATION */}
      <div>
        <Label>Leave Duration Days</Label>
        <Input value={duration} disabled />
      </div>

      {/* SUBSTITUTE */}
      <div>
        <Label>Leave Substitute (optional)</Label>
        <Input
          value={substitute}
          onChange={(e) => setSubstitute(e.target.value)}
        />
      </div>

      {/* REQUEST DATE */}
      <div>
        <Label>Request Date</Label>
        <Input value={requestDate} disabled />
      </div>

      <Button onClick={handleSubmit} className="w-full mt-4">
        Submit Leave Request
      </Button>
    </div>
  );
}
