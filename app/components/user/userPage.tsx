import styles from "./userPage.module.scss";
import { IconButton } from "../button";
import { userAuthStore } from "../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { useEffect } from "react";

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
      <div className={styles["go-back-button"]}>
        <IconButton
          text="Back to Chat"
          type="primary"
          onClick={() => {
            goChat();
          }}
        />
      </div>
      <div className={styles["devices-table"]}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Device Name</th>
            </tr>
          </thead>
          <tbody>
            {registeredDevices.map((device) => (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles["sign-out-button"]}>
        <IconButton text="Sign out" type="primary" onClick={handleSignOut} />
      </div>
    </div>
  );
};
