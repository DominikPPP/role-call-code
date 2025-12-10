import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function completeLeaveTask(id: string, task: string, extra: any) {
  const ref = doc(db, "processInstances", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { success: false, error: "not-found" };
  }

  const data = snap.data();
  const currentVars = data.variables || {};

  // 🔄 MERGE VARIABLES — dokładamy nowe zmienne
  const newVars = {
    ...currentVars,
    ...extra,
  };

  const update: any = {
    variables: newVars,
    statusHistory: arrayUnion({
      task,
      timestamp: new Date().toISOString(),
      data: extra,
    }),
  };

  // ----------------------------------------
  // 🔥 LOGIKA PRZEPŁYWU ZADAŃ
  // ----------------------------------------

  switch (task) {
    case "head-approval":
      // Head O.U. → PD
      update.currentTask = "pd-review";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-review":
      // PD weryfikuje czy nauczyciel akademicki
      if (extra.is_academic_teacher) {
        update.currentTask = "prk-review";
        update.currentAssigneeRole = "PRK";
      } else {
        // ścieżka dla pracowników nieakademickich
        update.currentTask = "rkr-decision";
        update.currentAssigneeRole = "RKR";
      }
      break;

    case "prk-review":
      // PRK → PRN
      update.currentTask = "prn-review";
      update.currentAssigneeRole = "PRN";
      break;

    case "prn-review":
      // PRN → Rektor
      update.currentTask = "rkr-decision";
      update.currentAssigneeRole = "RKR";
      break;

    case "rkr-decision":
      // 🔥 REKTOR ODMAWIA — KONIEC PROCESU
      if (extra.final_decision === "Rejected") {
        update.currentTask = "completed";
        update.currentAssigneeRole = null;
        update.status = "Rejected";
        break;
      }

      // 🔥 REKTOR ZATWIERDZA → PD informuje kierownika O.U.
      update.currentTask = "pd-inform-ou";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-inform-ou":
      // PD ostatecznie informuje Head of O.U. → przechodzi do rejestracji
      update.currentTask = "pd-register";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-register":
      // 🔥 KONIEC PROCESU (zatwierdzony urlop)
      update.currentTask = "completed";
      update.currentAssigneeRole = null;
      update.status = "Completed";
      break;

    default:
      break;
  }

  // ----------------------------------------
  // 📝 Zapis do Firestore
  // ----------------------------------------
  await updateDoc(ref, update);

  return { success: true };
}
