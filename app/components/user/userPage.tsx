import styles from "./userPage.module.scss";
import { IconButton, LargeIconButton } from "../button";
import { userAuthStore } from "../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { useEffect } from "react";
import { UserRecord } from "./userRecord";

export const UserPage = () => {
  const access = userAuthStore();
  const userEmail = access.email;
  const navigate = useNavigate();
  const goChat = () => navigate(Path.Chat);

  // Dummy data for registered devices
  const registeredDevices = [
    { id: 1, name: "Device 1" },
    { id: 2, name: "Device 2" },
    // Add more devices here
  ];

  const handleSignOut = async () => {
    try {
      await access.signOutFromFirebase();
      // back to sign in page
      navigate(Path.Login);
    } catch (err) {
      console.error("Sign-out Failed: ", err);
    }
  };

  useEffect(() => {
    const listenerTimer = setTimeout(() => {
      if (!access.isAuthorized()) {
        navigate(Path.Login);
      }
    }, 5000);
    return () => clearTimeout(listenerTimer);
  }, []);

  return (
    <div className={styles["user-page"]}>
      <div className={styles["user-email"]}>
        <span>User: </span> {userEmail}
      </div>
      <h2>Administrator Panels</h2>
      <div className={styles["database-section"]}>
        <div className={styles["database-button"]}>
          <LargeIconButton
            className={styles["database-button-faq"]}
            text="FAQ Database"
            type="primary"
            // icon={<FAQIcon />}  // Replace <FAQIcon /> with your actual icon component
            onClick={() => navigate(Path.SingleFAQ)} // Replace with your actual URL
          />
        </div>
        <div className={styles["database-button"]}>
          <LargeIconButton
            className={styles["database-button-knowledge"]}
            text="Knowledge Database"
            type="primary"
            // icon={<KnowledgeIcon />}  // Replace <KnowledgeIcon /> with your actual icon component
            onClick={() => navigate(Path.LibKnowledge)} // Replace with your actual URL
          />
        </div>
      </div>
      <div className={styles["sign-out-button-section"]}>
        <IconButton
          className={styles["go-back-button-bottom"]}
          text="Back to Chat"
          type="primary"
          onClick={() => {
            goChat();
          }}
        />
        <IconButton
          className={styles["sign-out-button-bottom"]}
          text="Sign out"
          type="primary"
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
};
