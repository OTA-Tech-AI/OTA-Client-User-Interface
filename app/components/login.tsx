import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import { userAuthStore } from "../store/userAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const access = userAuthStore();

  const [error, setError] = useState("");

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);
  const resetAccessCode = () => {
    access.updateEmail("");
    access.updatePassword("");
  }; // Reset

  const handleLogin = async () => {
    setError("");
    try {
      await access.signInWithFirebase(access.email, access.password);
      console.log("Sign-in Success! email: ", access.email);
      goChat();
    } catch (err) {
      setError("Sign-in Failed. Please check your email and password.");
    }
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    if (isLoggedIn) {
      navigate(Path.UserPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoggedIn = access.isAuthorized();
  return (
    <>
      <div className={styles["auth-page"]}>
        <div className={`no-dark ${styles["auth-logo"]}`}>
          <BotIcon />
        </div>

        <div className={styles["auth-title"]}>Sign in</div>
        <div className={styles["auth-tips"]}>Use your Email</div>
        {error && <div className={styles["auth-error"]}>{error}</div>}

        <input
          className={styles["auth-input"]}
          placeholder="email"
          value={access.email}
          onChange={(e) => {
            access.updateEmail(e.currentTarget.value);
          }}
        />

        <div className={styles["auth-tips"]}>Password</div>
        <input
          className={styles["auth-input"]}
          type="password"
          placeholder="password"
          value={access.password}
          onChange={(e) => {
            access.updatePassword(e.currentTarget.value);
          }}
        />

        <div className={styles["auth-actions"]}>
          <IconButton text="Sign in" type="primary" onClick={handleLogin} />
          <IconButton
            text={Locale.Auth.Later}
            onClick={() => {
              resetAccessCode();
              goHome();
            }}
          />
        </div>
      </div>
    </>
  );
}
