"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang, getLang } from "../locales";
import {
  initializeFirebase,
  listenForChildAdded,
  listenForChildChanged,
  listenForChildRemoved,
} from "../firebase-helper";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { LoginPage } from "./login";
import { UserPage } from "./user/userPage";
import { getClientConfig } from "../config/client";
import { api } from "../client/api";
import { useAccessStore } from "../store";
import { userAuthStore } from "../store/userAuth";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  enum AppState {
    LOGIN = "LOGIN",
    HOME = "HOME",
    CHAT = "CHAT",
    USERPAGE = "USERPAGE",
  }
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  //   const isAuth = location.pathname === Path.Auth;
  const isLogin = location.pathname === Path.Login;
  const isUserPage = location.pathname === Path.UserPage;
  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  let currentAppState = AppState.HOME;
  if (isLogin) {
    currentAppState = AppState.LOGIN;
  } else if (isUserPage) {
    currentAppState = AppState.USERPAGE;
  }

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : styles.container} ${
          getLang() === "ar" ? styles["rtl-screen"] : ""
        }`
      }
    >
      {(() => {
        switch (currentAppState) {
          case AppState.LOGIN:
            return <LoginPage />;
          case AppState.HOME:
            return (
              <>
                <SideBar className={isHome ? styles["sidebar-show"] : ""} />

                <div className={styles["window-content"]} id={SlotID.AppBody}>
                  <Routes>
                    <Route path={Path.Home} element={<Chat />} />
                    <Route path={Path.NewChat} element={<NewChat />} />
                    <Route path={Path.Masks} element={<MaskPage />} />
                    <Route path={Path.Chat} element={<Chat />} />
                    <Route path={Path.Settings} element={<Settings />} />
                  </Routes>
                </div>
              </>
            );
          case AppState.USERPAGE:
            return <UserPage />;
          // return <div></div>
          // ... Handle more cases as needed
          default:
            return null;
        }
      })()}
    </div>
  );

  //   return (
  //     <div
  //       className={
  //         styles.container +
  //         ` ${shouldTightBorder ? styles["tight-container"] : styles.container} ${
  //           getLang() === "ar" ? styles["rtl-screen"] : ""
  //         }`
  //       }
  //     >
  //       {isLogin ? (
  //         <>
  //           {/* <AuthPage /> */}
  //           <LoginPage />
  //         </>
  //       ) : (
  // <>
  //   <SideBar className={isHome ? styles["sidebar-show"] : ""} />

  //   <div className={styles["window-content"]} id={SlotID.AppBody}>
  //     <Routes>
  //       <Route path={Path.Home} element={<Chat />} />
  //       <Route path={Path.NewChat} element={<NewChat />} />
  //       <Route path={Path.Masks} element={<MaskPage />} />
  //       <Route path={Path.Chat} element={<Chat />} />
  //       <Route path={Path.Settings} element={<Settings />} />
  //     </Routes>
  //   </div>
  // </>
  //       )}
  //     </div>
  //   );
}

export function useLoadData() {
  const config = useAppConfig();

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function firebaseInitialization() {
  initializeFirebase();
  const userPath = "user_" + userAuthStore.getState().uid;

  // Define your callback for child added
  const handleChildAdded = (snapshot: any, prevChildKey?: string | null) => {
    console.log("Child added:", snapshot.key, snapshot.val(), prevChildKey);
    // Handle the new child data here...
  };

  // Define your callback for child changed
  const handleChildChanged = (snapshot: any) => {
    console.log("Child changed:", snapshot.key, snapshot.val());
    // Handle the updated child data here...
  };

  // Define your callback for child removed
  const handleChildRemoved = (snapshot: any) => {
    console.log("Child removed:", snapshot.key);
    // Handle the child removal here...
  };

  // Setting up the listeners
  // listenForChildAdded(userPath, handleChildAdded);
  // listenForChildChanged(userPath, handleChildChanged);
  // listenForChildRemoved(userPath, handleChildRemoved);
}

export function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();
  firebaseInitialization();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
