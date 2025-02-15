export const OWNER = "OTA";
export const REPO = "OTA_BETA";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_CORS_HOST = "https://ab.nextweb.fun";
export const DEFAULT_API_HOST = `${DEFAULT_CORS_HOST}/api/proxy`;

export const DEVICE_ID = 1;
export const IS_RECEIVER = false;
export const WAIT_SERVER_TIMEOUT = 120;

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  Login = "/login",
  UserPage = "/user",
  RegisterAccounts = "/registeraccount",
  PasswordRecovery = "/passwordrecovery",
}

export enum ApiPath {
  Cors = "/api/cors",
}

export enum SlotID {
  AppBody = "app-body",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "OTA";

export const REQUEST_TIMEOUT_MS = 180 * 1000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by OpenAI.
Knowledge cutoff: 2021-09
Current model: {{model}}
Current time: {{time}}`;

export const SUMMARIZE_MODEL = "CHAT";

export const DEFAULT_MODELS = [
  {
    name: "ACTION MODE",
    available: true,
  },
  {
    name: "CHAT MODE",
    available: true,
  },
] as const;

export const CHAT_MODE_URL = "https://api.endpoints.anyscale.com";
export const CHAT_MODE_ANYSCALE_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";
export const ACTION_MODE_PORT = "http://localhost:5000";

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

export const firebaseConfig = {
  apiKey: "AIzaSyBu_QBFvmZ6n2AYzIgBsqB7-942R6BjEmw",
  authDomain: "ota-user-system.firebaseapp.com",
  projectId: "ota-user-system",
  storageBucket: "ota-user-system.appspot.com",
  messagingSenderId: "1080297856968",
  appId: "1:1080297856968:web:ad1493d6755a03eb892afd",
};
