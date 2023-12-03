import styles from "../auth.module.scss";
import { IconButton } from "../button";

import { useNavigate, Link } from "react-router-dom";
import { Path } from "../../constant";
import Locale from "../../locales";

import BotIcon from "../../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../../config/client";
import { userAuthStore } from "../../store/userAuth";
import { ResendCodeButton } from "./resendButton";

export function LoginPage() {
  const navigate = useNavigate();
  const access = userAuthStore();

  const [error, setError] = useState("");
  const [canResendVerification, setcanResendVerification] = useState(false);

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);
  const resetAccessCode = () => {
    access.updateEmail("");
    access.updatePassword("");
  }; // Reset

  const resetErrorStatus = () => {
    setError("");
    setcanResendVerification(false);
  };

  const handleLogin = async () => {
    resetErrorStatus();
    try {
      const loginStatus = await access.signInWithFirebase(
        access.email,
        access.password,
      );
      if (loginStatus == 1) {
        console.log("Sign-in Success! email: ", access.email);
        goChat();
      } else if (loginStatus == 2) {
        setError(
          `${access.email} has not be verified. Please check your email.`,
        );
        setcanResendVerification(true);
        // resetAccessCode();
        return;
      }
    } catch (err) {
      setError("Sign-in Failed. Please check your email and password.");
    }
  };

  const handleResend = async () => {
    await access
      .resendVerificationEmailFromFirebase(access.email, access.password)
      .then(() => {
        console.log("return from resendVerificationEmailFromFirebase");
      });
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }

    const listenerTimer = setTimeout(() => {
      if (access.isAuthorized()) {
        navigate(Path.UserPage);
      }
    }, 1000);
    return () => clearTimeout(listenerTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles["auth-page"]}>
        <div className={`no-dark ${styles["auth-logo"]}`}>
          <BotIcon />
        </div>

        <div className={styles["auth-title"]}>Sign in</div>
        <div className={styles["auth-tips"]}>Use Your Email</div>
        {error && (
          <div className={styles["auth-error"]}>
            <span>{error}</span>
            {canResendVerification && (
              <ResendCodeButton onResend={handleResend} waitTime={60} />
            )}
          </div>
        )}

        <input
          className={styles["auth-input"]}
          type="text"
          placeholder="email"
          value={access.email}
          onChange={(e) => {
            resetErrorStatus();
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
            resetErrorStatus();
            access.updatePassword(e.currentTarget.value);
          }}
        />

        <div className={styles["auth-subtips"]}>
          <span>
            <Link to={Path.RegisterAccounts} className={styles["link"]}>
              Register an account
            </Link>
          </span>
          <span>•</span>
          <span>
            <Link to={Path.PasswordRecovery} className={styles["link"]}>
              Forget password?
            </Link>
          </span>
        </div>

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
