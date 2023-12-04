import styles from "./passwordRecovery.module.scss";
import { IconButton } from "../button";

import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import Locale from "../../locales";

import BotIcon from "../../icons/bot.svg";
import { useState } from "react";
import { userAuthStore } from "../../store/userAuth";
import { ResendCodeButton } from "./resendButton";

export function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const access = userAuthStore();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [error, setError] = useState("");

  const goLogin = () => navigate(Path.Login);

  const handleSend = async () => {
    setError("");
    if (email.trim() === "") {
      setError("Email can't be empty.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }
    try {
      await access.passwordRecoveryEmailFromFirebase(email).then(() => {
        setEmailSent(true);
      });
    } catch (err) {
      setError("We can't identify your email. Please check it again.");
    }
  };

  return (
    <>
      {!emailSent ? (
        <div className={styles["register-page"]}>
          <div className={`no-dark ${styles["auth-logo"]}`}>
            <BotIcon />
          </div>

          <div className={styles["register-fields"]}>
            <div className={styles["auth-title"]}>Password Recovery</div>
            <div className={styles["auth-subtips"]}>
              <span>We will send a recovery email to:</span>
            </div>
            {error && <div className={styles["auth-error"]}>{error}</div>}
            <div className={styles["auth-tips"]}>
              <span>Your Email Address: </span>
              <input
                className={styles["auth-input"]}
                type="text"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles["auth-actions"]}>
            <IconButton
              className={styles["button"]}
              text="Back to Sign in"
              onClick={() => {
                goLogin();
              }}
            />
            <IconButton
              className={styles["button"]}
              text="Continue"
              type="primary"
              onClick={handleSend}
            />
          </div>
        </div>
      ) : (
        <div className={styles["register-page"]}>
          <div className={`no-dark ${styles["auth-logo"]}`}>
            <BotIcon />
          </div>
          <div className={styles["register-fields"]}>
            <div className={styles["auth-title"]}>
              A recovery email has been sent to:
            </div>
          </div>
          <div className={styles["auth-email"]}>
            <span>{email}</span>
          </div>

          <div className={styles["auth-actions"]}>
            <span className={styles["auth-tips"]}>
              Please verify your email inbox/spam
            </span>
            <IconButton
              className={styles["button"]}
              text="Back to Sign in"
              type="primary"
              onClick={() => {
                goLogin();
              }}
            />
            <ResendCodeButton onResend={handleSend} waitTime={60} />
          </div>
        </div>
      )}
    </>
  );
}
