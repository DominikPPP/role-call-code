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

  // 🔄 MERGE – NIE NADPISUJEMY CAŁEGO "variables", tylko dokładamy swoje pola
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

  // 🔁 PRZEJŚCIA MIĘDZY ZADANIAMI – dokładnie wg scenariusza

  switch (task) {
    case "head-approval":
      // Head of O.U. → PD
      // extra.head_ou_decision = "Approved" / "Rejected"
      update.currentTask = "pd-review";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-review":
      // PD sprawdza uprawnienia
      // extra.pd_review_status = "Entitlement Confirmed" / ...
      // extra.is_academic_teacher = true/false
      if (extra.is_academic_teacher) {
        update.currentTask = "prk-review";
        update.currentAssigneeRole = "PRK";
      } else {
        // ścieżka nieakademicka – dla bezpieczeństwa puszczamy od razu do Rektora
        update.currentTask = "rector-decision";
        update.currentAssigneeRole = "RKR";
      }
      break;

    case "prk-review":
      // PRK → PRN
      // extra.prk_review_status = "Approved" / ...
      update.currentTask = "prn-review";
      update.currentAssigneeRole = "PRN";
      break;

    case "prn-review":
      // PRN → Rektor
      // extra.prn_review_status = "Approved" / ...
      update.currentTask = "rector-decision";
      update.currentAssigneeRole = "RKR";
      break;

    case "rector-decision":
      // Rektor → PD (inform OU)
      // extra.final_decision = "Approved" / ...
      update.currentTask = "pd-inform-ou";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-inform-ou":
      // PD informuje kierownika OU → potem rejestracja
      // extra.pd_notified_head = true
      update.currentTask = "pd-register";
      update.currentAssigneeRole = "PD";
      break;

    case "pd-register":
      // PD rejestruje urlop w systemie HR
      // extra.registered = true
      update.currentTask = "completed";
      update.currentAssigneeRole = null;
      update.status = "Completed";
      break;

    default:
      break;
  }

  await updateDoc(ref, update);
  return { success: true };
}
