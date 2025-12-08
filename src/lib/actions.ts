import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

// CREATE PROCESS INSTANCE
export async function createProcessInstance(type: string, variables: any) {
  return await addDoc(collection(db, "processInstances"), {
    processType: type,
    status: "Running",
    createdAt: serverTimestamp(),
    currentTask: "present-to-prk",
    currentAssigneeRole: "PD",
    variables: {
      ...variables,
      reviewer_opinion: null,
      rkr_decision: null,
      award_grant_date: null,
      process_outcome: null
    }
  });
}

// COMPLETE TASK
export async function completeTask(processId: string, currentTask: string) {
  const ref = doc(db, "processInstances", processId);

  switch (currentTask) {
    case "present-to-prk":
      await updateDoc(ref, {
        currentTask: "review-and-forward",
        currentAssigneeRole: "PRK"
      });
      break;
  }
}
