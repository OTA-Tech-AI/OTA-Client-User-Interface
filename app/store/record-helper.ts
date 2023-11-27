import { useChatStore, ChatMessage, createMessage } from ".";

export interface FAQSet {
  index: number;
  question: string;
  answer: string;
  status: number;
}

export interface KnowledgeSet {
  index: number;
  title: string;
  knowledge: string;
  status: number;
}

export async function fetchCurrentRecord<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error("Failed to fetch User FAQ configuration.");
    }
    return response.json() as Promise<T[]>;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return []; // Return an empty array in case of error
  }
}

export async function submitNewRecord(
  data: any,
  path: string,
): Promise<Response> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
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

export async function editRecord<T>(
  oldData: T,
  newData: T,
  path: string,
): Promise<Response> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ old_data: oldData, new_data: newData }),
    });
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

export async function deleteRecord<T>(
  data: T,
  path: string,
): Promise<Response> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
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
