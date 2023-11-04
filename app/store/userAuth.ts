import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { DEFAULT_API_HOST, DEFAULT_MODELS, StoreKey } from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

const DEFAULT_ACCESS_STATE = {
  email: "",
  password: "",
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,

  openaiUrl: DEFAULT_OPENAI_URL,
};

export const userAuthStore = createPersistStore(
  { ...DEFAULT_ACCESS_STATE },

  (set, get) => ({
    async signInWithFirebase(email: string, password: string) {
      try {
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password);
        // User signed in successfully
        // You can update any other state here, if necessary
      } catch (error) {
        console.error("[Auth] Failed to sign in with Firebase, email: ", email);
        // Handle error (e.g., show an error message to the user)
        // You can update any error state here, if necessary
        throw error;
      }
    },

    enabledAccessControl() {
      this.fetch();

      return get().needCode;
    },
    updateCode(email: string) {
      set(() => ({ email: email?.trim() }));
    },
    updateToken(password: string) {
      set(() => ({ password: password?.trim() }));
    },
    updateOpenAiUrl(url: string) {
      set(() => ({ openaiUrl: url?.trim() }));
    },

    isAuthorized() {
      this.fetch();

      const auth = getAuth();
      const isFirebaseUserSignedIn = !!auth.currentUser;

      return (
        isFirebaseUserSignedIn ||
        !!get().email ||
        !!get().password ||
        !this.enabledAccessControl()
      );
    },

    fetch() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
      fetchState = 1;
      fetch("/api/config", {
        method: "post",
        body: null,
        headers: {
          ...getHeaders(),
        },
      })
        .then((res) => res.json())
        .then((res: DangerConfig) => {
          console.log("[Config] got config from server", res);
          set(() => ({ ...res }));

          if (res.disableGPT4) {
            DEFAULT_MODELS.forEach(
              (m: any) => (m.available = !m.name.startsWith("gpt-4")),
            );
          }
        })
        .catch(() => {
          console.error("[Config] failed to fetch config");
        })
        .finally(() => {
          fetchState = 2;
        });
    },
  }),
  {
    name: StoreKey.Access,
    version: 1,
  },
);
