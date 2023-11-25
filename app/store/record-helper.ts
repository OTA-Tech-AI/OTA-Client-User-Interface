import { LIBRARY_ROUTES } from "../constant";
import { useChatStore, ChatMessage, createMessage } from ".";
import { REMOTE_OTA_BRAIN_HOST } from "../constant";

export interface FAQSet {
  index: number;
  question: string;
  answer: string;
  status: number;
}

export async function fetchCurrentRecord(): Promise<FAQSet[]> {
  try {
    const response = await fetch(
      `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.getData}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch User FAQ configuration.");
    }
    return response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return []; // Return an empty array in case of error
  }
}

export async function submitNewRecord(data: {
  question: string;
  answer: string;
}): Promise<Response> {
  try {
    const response = await fetch(
      `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.submitNewData}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Success:", response);
    return response;
  } catch (error) {
    console.error("Error submitting new record:", error);
    return Promise.reject(error);
  }
}

export async function editRecord(
  oldData: FAQSet,
  newData: FAQSet,
): Promise<Response> {
  try {
    const response = await fetch(
      `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.editData}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ old_data: oldData, new_data: newData }),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Success:", response);
    return response;
  } catch (error) {
    console.error("Error deleting record:", error);
    return Promise.reject(error);
  }
}

export async function deleteRecord(data: FAQSet): Promise<Response> {
  try {
    const response = await fetch(
      `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.deleteData}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Success:", response);
    return response;
  } catch (error) {
    console.error("Error deleting record:", error);
    return Promise.reject(error);
  }
}
