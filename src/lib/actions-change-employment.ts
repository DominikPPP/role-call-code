import { db } from "@/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * 1) UTWORZENIE INSTANCJI PROCESU
 * GATEWAY domyślnie → is_academic_teacher = TRUE
 */
export async function createProcessInstanceChangeEmployment(variables: any) {
  const ref = await addDoc(collection(db, "processInstances"), {
    processType: "change-of-employment",
    status: "Running",
    createdAt: serverTimestamp(),

    // pierwszy task --> Head of O.U.
    currentTask: "head-approval",
    currentAssigneeRole: "Head of O.U.",

    variables: {
      ...variables,
      is_academic_teacher: variables.is_academic_teacher ?? true,

      head_of_ou_review_status: null,
      pd_review_status: null,
      kwe_financial_opinion: null,
      prk_opinion: null,
      prn_opinion: null,
      final_decision: null,
    }
  });

  return { id: ref.id };
}

/**
 * 2) OBSŁUGA WSZYSTKICH TASKÓW W PROCESIE
 */
export async function completeTaskChangeEmployment(
  processId: string,
  currentTask: string,
  extra?: any
) {
  const ref = doc(db, "processInstances", processId);

  switch (currentTask) {

    /**
     * KROK 1 → 2
     * Head of O.U. → PD
     */
    case "head-approval":
      await updateDoc(ref, {
        currentTask: "pd-review",
        currentAssigneeRole: "PD",
        "variables.head_of_ou_review_status": extra?.status ?? "Approved",
      });
      break;

    /**
     * KROK 2 → 3
     * PD → Quartermaster
     */
    case "pd-review":
      await updateDoc(ref, {
        currentTask: "kwe-review",
        currentAssigneeRole: "KWE",
        "variables.pd_review_status": extra?.pd_review_status ?? "Confirmed",
        "variables.is_academic_teacher":
          extra?.is_academic_teacher ?? true,
      });
      break;

    /**
     * KROK 3 → gateway
     * Quartermaster → PRK lub KAN
     */
    case "kwe-review": {
      const isAcademic = extra?.is_academic_teacher ?? true;

      await updateDoc(ref, {
        "variables.kwe_financial_opinion":
          extra?.kwe_financial_opinion ?? "Funds Available",
      });

      if (isAcademic) {
        await updateDoc(ref, {
          currentTask: "prk-review",
          currentAssigneeRole: "PRK",
        });
      } else {
        // Non-academic → Chancellor (KAN)
        await updateDoc(ref, {
          currentTask: "kan-decision",
          currentAssigneeRole: "KAN",
        });
      }
      break;
    }

    /**
     * Non-academic ścieżka
     */
    case "kan-decision":
      await updateDoc(ref, {
        currentTask: "pd-finalize",
        currentAssigneeRole: "PD",
        "variables.final_decision":
          extra?.final_decision ?? "Approved",
      });
      break;

    /**
     * PRK → PRN
     */
    case "prk-review":
      await updateDoc(ref, {
        currentTask: "prn-review",
        currentAssigneeRole: "PRN",
        "variables.prk_opinion": extra?.prk_opinion ?? "Approved",
      });
      break;

    /**
     * PRN → RKR
     */
    case "prn-review":
      await updateDoc(ref, {
        currentTask: "rector-decision",
        currentAssigneeRole: "RKR",
        "variables.prn_opinion": extra?.prn_opinion ?? "Approved",
      });
      break;

    /**
     * Rector → PD Finalization
     */
    case "rector-decision":
      await updateDoc(ref, {
        currentTask: "pd-finalize",
        currentAssigneeRole: "PD",
        "variables.final_decision":
          extra?.final_decision ?? "Approved",
      });
      break;

    /**
     * PD Finalize → PD Archive
     */
    case "pd-finalize":
      await updateDoc(ref, {
        currentTask: "pd-archive",
        currentAssigneeRole: "PD",
      });
      break;

    /**
     * Ostatni krok
     */
    case "pd-archive":
      await updateDoc(ref, {
        status: "Completed",
        currentTask: "completed",
        currentAssigneeRole: null,
      });
      break;

    default:
      throw new Error(`Unknown task type: ${currentTask}`);
  }

  return { success: true };
}
