"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProcessInstance } from "@/lib/actions";

export default function DecorationsStartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    employeeName: "",
    organizationalUnit: "",
    decorationType: "",
    applicationJustification: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await createProcessInstance("decorations-and-medals", {
      employee_name: form.employeeName,
      organizational_unit: form.organizationalUnit,
      decoration_type: form.decorationType,
      application_justification: form.applicationJustification,
    });

    alert("Decoration request submitted!");
    router.push("/dashboard");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit Decoration Application</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Employee Name</Label>
              <Input name="employeeName" onChange={handleChange} required />
            </div>

            <div>
              <Label>Organizational Unit</Label>
              <Input name="organizationalUnit" onChange={handleChange} required />
            </div>

            <div>
              <Label>Decoration Type</Label>
              <Input name="decorationType" onChange={handleChange} required />
            </div>

            <div>
              <Label>Application Justification</Label>
              <Textarea name="applicationJustification" onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
