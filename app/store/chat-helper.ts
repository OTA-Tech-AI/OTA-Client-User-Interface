import { ChatControllerPool } from "../client/controller";
import { LAST_INPUT_KEY } from "../constant";
import { useChatStore, ChatMessage, createMessage } from "../store";
import { ModelConfig, ModelType, useAppConfig } from "./config";

export const doLocalSubmit = async (userInput: string) => {
  if (userInput.trim() === "") return;
  await useChatStore.getState().onUserInput(userInput);
  localStorage.setItem(LAST_INPUT_KEY, userInput);
};

function updateStat(message: ChatMessage) {
  useChatStore.getState().updateCurrentSession((session) => {
    session.stat.charCount += message.content.length;
    // TODO: should update chat count and word count
  });
  console.log(
    "firebase helper current session: ",
    useChatStore.getState().currentSession().messages,
  );
}
function onNewMessage(message: ChatMessage) {
  useChatStore.getState().updateCurrentSession((session) => {
    session.messages = session.messages.concat();
    session.lastUpdate = Date.now();
  });
  updateStat(message);
  //summarizeSession();
}

export function LocalOnFinish(message: string) {
  const session = useChatStore.getState().currentSession();
  let botMessageId = "";
  let botMessage = createMessage({
    role: "assistant",
    content: "error",
  });
  useChatStore.getState().updateCurrentSession((session) => {
    session.messages[session.messages.length - 1].content = message;
    session.messages[session.messages.length - 1].streaming = false;
    botMessage = session.messages[session.messages.length - 1];
  });
  onNewMessage(botMessage);
  ChatControllerPool.remove(session.id, botMessageId);
}

export function waitMillisecond(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
