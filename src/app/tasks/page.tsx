"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      const q = query(
        collection(db, "processInstances"),
        where("currentAssigneeRole", "==", user.roleCode)
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(items);
    };

    loadTasks();
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p>No tasks assigned to your role.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="border p-4 rounded-lg mb-4 shadow-sm"
              >
                <p><b>Process ID:</b> {task.id}</p>
                <p><b>Process Type:</b> {task.processType}</p>
                <p><b>Current Task:</b> {task.currentTask}</p>
                <p><b>Status:</b> {task.status}</p>

                <Button
                  className="mt-3"
                  onClick={() => {
                    if (task.processType === "leave-request") {
                      router.push(`/flows/leave-request/task/${task.id}`);
                    } else {
                      router.push(`/tasks/${task.id}`);
                    }
                  }}
                >
                  Open Task
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* POWRÓT DO DASHBOARD */}
      <Button variant="secondary" className="w-full mt-4" asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
