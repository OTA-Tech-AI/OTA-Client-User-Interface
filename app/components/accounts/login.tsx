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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);

  const resetErrorStatus = () => {
    setError("");
    setcanResendVerification(false);
  };

  const handleLogin = async () => {
    resetErrorStatus();
    try {
      await access
        .signInWithFirebase(email, password)
        .then((loginStatus: number) => {
          if (loginStatus == 1) {
            console.log("Sign-in Success! email: ", email);
            goChat();
          } else if (loginStatus == 2) {
            setError(`${email} has not be verified. Please check your email.`);
            setcanResendVerification(true);
            return;
          }
        });
    } catch (err) {
      setError("Sign-in Failed. Please check your email and password.");
    }
  };

  const handleResend = async () => {
    await access
      .resendVerificationEmailFromFirebase(email, password)
      .then(() => {
        console.log("return from resendVerificationEmailFromFirebase");
      });
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    if (access.isAuthorized()) {
      navigate(Path.UserPage);
    }
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
          value={email}
          onChange={(e) => {
            resetErrorStatus();
            setEmail(e.currentTarget.value);
          }}
        />

        <div className={styles["auth-tips"]}>Password</div>
        <input
          className={styles["auth-input"]}
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => {
            resetErrorStatus();
            setPassword(e.currentTarget.value);
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
              goHome();
            }}
          />
        </div>
      </div>
    </>
  );
}
