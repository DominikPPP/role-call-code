"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// IMPORT NOWEGO WORKFLOW
import { createProcessInstanceChangeEmployment } from "@/lib/actions-change-employment";

export default function ChangeEmploymentStartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    employeeName: "",
    proposedConditions: "",
    changeJustification: "",
    changeEffectiveDate: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await createProcessInstanceChangeEmployment({
      employee_name: form.employeeName,
      proposed_conditions: form.proposedConditions,
      change_justification: form.changeJustification,
      change_effective_date: form.changeEffectiveDate,
    });

    alert("Change of Employment Conditions request submitted!");
    router.push("/dashboard");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit Change of Employment Conditions</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Employee Name</Label>
              <Input name="employeeName" onChange={handleChange} required />
            </div>

            <div>
              <Label>Proposed Conditions</Label>
              <Textarea name="proposedConditions" onChange={handleChange} required />
            </div>

            <div>
              <Label>Justification</Label>
              <Textarea name="changeJustification" onChange={handleChange} required />
            </div>

            <div>
              <Label>Effective Date</Label>
              <Input type="date" name="changeEffectiveDate" onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full">
              Submit Request
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
