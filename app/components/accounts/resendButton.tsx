import { IconButton } from "../button";
import { useEffect, useState } from "react";
import styles from "./resendButton.module.scss";

interface ResendCodeButtonProps {
  onResend: () => void; // Callback function when the resend button is clicked
  waitTime: number; // Custom wait time
  // Add other props as needed
}

// const waitTime = 5;
export function ResendCodeButton(props: ResendCodeButtonProps) {
  const { onResend, waitTime } = props;
  const [timeLeft, setTimeLeft] = useState<number>(waitTime);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  useEffect(() => {
    // Exit early when we reach 0
    if (!timeLeft) {
      setIsButtonDisabled(false);
      return;
    }

    // Save intervalId to clear the interval when the component unmounts
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleResendClick = async () => {
    // Reset timer and disable button again
    await onResend();
    setTimeLeft(waitTime);
    setIsButtonDisabled(true);
  };

  return (
    <div className={styles["resend-button"]}>
      {isButtonDisabled ? (
        <p>Resend in {timeLeft} seconds</p>
      ) : (
        <IconButton
          // className={styles["resend-button"]}
          text="Resend"
          onClick={handleResendClick}
        />
      )}
    </div>
  );
}
