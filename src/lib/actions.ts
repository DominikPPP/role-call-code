
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * UTWORZENIE INSTANCJI PROCESU (krok 1 – Head of O.U.)
 */
export async function createProcessInstance(type: string, variables: any) {
  const ref = await addDoc(collection(db, "processInstances"), {
    processType: type,                      // "decorations-and-medals"
    status: "Running",
    createdAt: serverTimestamp(),
    currentTask: "present-to-prk",          // pierwszy task dla PD
    currentAssigneeRole: "PD",              // Penny Personnel
    variables: {
      ...variables,
      reviewer_opinion: null,
      rkr_decision: null,
      award_grant_date: null,
      process_outcome: null,
    },
  });

  return { id: ref.id };
}

/**
 * ZAKOŃCZENIE TASKA + PRZEJŚCIE DO NASTĘPNEGO KROKU
 */
export async function completeTask(
  processId: string,
  currentTask: string,
  extra?: any
) {
  const ref = doc(db, "processInstances", processId);

  switch (currentTask) {
    // KROK 2 → 3  (PD -> PRK)
    case "present-to-prk":
      await updateDoc(ref, {
        currentTask: "review-and-forward",
        currentAssigneeRole: "PRK", // Paula VREdu
      });
      break;

    // KROK 3 → 4  (PRK -> PD, zapis opinii)
    case "review-and-forward": {
      const reviewerOpinion =
        extra?.reviewer_opinion ?? "Strongly support";

      await updateDoc(ref, {
        currentTask: "present-reviewed-to-rkr",
        currentAssigneeRole: "PD",
        "variables.reviewer_opinion": reviewerOpinion,
      });
      break;
    }

    // KROK 4 → 5  (PD -> RKR)
    case "present-reviewed-to-rkr":
      await updateDoc(ref, {
        currentTask: "make-decision",
        currentAssigneeRole: "RKR", // Adam Rector
      });
      break;

    // KROK 5 → 6 LUB KONIEC (RKR podejmuje decyzję)
    case "make-decision": {
      const decision = extra?.rkr_decision ?? "Accepted";

      if (decision === "Accepted") {
        await updateDoc(ref, {
          currentTask: "forward-accepted-to-mpd",
          currentAssigneeRole: "PD",
          "variables.rkr_decision": decision,
        });
      } else {
        // ścieżka odrzucona – kończymy proces
        await updateDoc(ref, {
          status: "Completed",
          currentTask: "ended-rejected",
          currentAssigneeRole: null,
          "variables.rkr_decision": decision,
          "variables.process_outcome": "Rejected",
        });
      }
      break;
    }

    // KROK 6 → 7  (PD -> MPD)
    case "forward-accepted-to-mpd":
      await updateDoc(ref, {
        currentTask: "handle-external-transfer",
        currentAssigneeRole: "MPD/WKW", // Mike MPD
      });
      break;

    // KROK 7 → 8  (MPD -> PD)
    case "handle-external-transfer":
      await updateDoc(ref, {
        currentTask: "receive-decision",
        currentAssigneeRole: "PD",
      });
      break;

    // KROK 8 → 9  (PD -> PD, przyjęcie decyzji)
    case "receive-decision":
      await updateDoc(ref, {
        currentTask: "enter-into-register",
        currentAssigneeRole: "PD",
      });
      break;

    // KROK 9 → KONIEC (PD wpisuje do rejestru)
    case "enter-into-register": {
      const awardDate = extra?.award_grant_date ?? new Date().toISOString();

      await updateDoc(ref, {
        status: "Completed",
        currentTask: "completed",
        currentAssigneeRole: null,
        "variables.award_grant_date": awardDate,
        "variables.process_outcome": "Completed",
      });
      break;
    }

    default:
      throw new Error(`Unknown task type: ${currentTask}`);
  }

  return { success: true };
}
