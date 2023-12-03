import styles from "./registerAccounts.module.scss";
import { IconButton } from "../button";

import { useNavigate, Link } from "react-router-dom";
import { Path } from "../../constant";
import Locale from "../../locales";

import BotIcon from "../../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../../config/client";
import { userAuthStore } from "../../store/userAuth";
import { ResendCodeButton } from "./resendButton";

export function RegisterAccountsPage() {
  const navigate = useNavigate();
  const access = userAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [registered, setRegistered] = useState(false);

  const [error, setError] = useState("");

  const goLogin = () => navigate(Path.Login);

  const handleSignUp = async () => {
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
    if (password.length < 6) {
      setError("Password: Minimum 6 characters required.");
      return;
    }
    if (password !== passwordAgain) {
      setError("Passwords do not match!");
      return;
    }
    if (invitationCode.length !== 9) {
      setError("9 digits inivation code required.");
      return;
    }
    try {
      await access.signUpWithFireBase(email, password).then(() => {
        setRegistered(true);
      });
      //   console.log("Sign-in Success! email: ", access.email);
      //   goChat();
    } catch (err: any) {
      if (err.code == "auth/email-already-in-use") {
        setError(`${email} already in use, please try another email address.`);
      } else {
        setError("Sign-up Failed. Please check your email and password.");
      }
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
      {!registered ? (
        <div className={styles["register-page"]}>
          <div className={`no-dark ${styles["auth-logo"]}`}>
            <BotIcon />
          </div>

          <div className={styles["register-fields"]}>
            <div className={styles["auth-title"]}>
              Register your OTA in just a Few Minutes
            </div>
            {error && <div className={styles["auth-error"]}>{error}</div>}
            <div className={styles["auth-tips"]}>
              <span>Use Your Email: </span>
              <input
                className={styles["auth-input"]}
                type="text"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles["auth-tips"]}>
              <span>Password: </span>
              <input
                className={styles["auth-input"]}
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={styles["auth-subtips"]}></div>

            <div className={styles["auth-tips"]}>
              <span>Password again: </span>
              <input
                className={styles["auth-input"]}
                type="password"
                placeholder=""
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
              />
            </div>

            <div className={styles["auth-tips"]}>
              <span>Invitation Code: </span>
              <input
                className={styles["auth-input"]}
                type="text"
                placeholder="9 digits"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </div>
          </div>

          <div className={styles["auth-actions"]}>
            <span className={styles["auth-tips"]}>
              Already have an account?{" "}
            </span>
            <IconButton
              className={styles["button"]}
              text="Sign in"
              onClick={() => {
                goLogin();
              }}
            />
            <IconButton
              className={styles["button"]}
              text="Continue"
              type="primary"
              onClick={handleSignUp}
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
              A verification has been sent to your email
            </div>
          </div>

          <div className={styles["auth-actions"]}>
            <span className={styles["auth-tips"]}>
              Please verify your email before signing in
            </span>
            <IconButton
              className={styles["button"]}
              text="Back to Sign in"
              type="primary"
              onClick={() => {
                goLogin();
              }}
            />
            <ResendCodeButton onResend={handleResend} waitTime={60} />
          </div>
        </div>
      )}
    </>
  );
}
