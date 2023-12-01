import styles from "./userPromptEditor.module.scss";
import { IconButton } from "../button";
import { userAuthStore } from "../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { useEffect, useState } from "react";
import {
  editSystemPrompt,
  fetchCurrentSystemPrompt,
  resetSystemPrompt,
} from "../../store/record-helper";
import { ListPanel, showConfirm } from "../ui-lib";
import { LIBRARY_ROUTES, REMOTE_OTA_BRAIN_HOST } from "../../constant";
import ConfirmIcon from "../../../icons/confirm.svg";

const FETCH_PROMPT_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.getPrompt}`;
const EDIT_PROMPT_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.editPrompt}`;
const RESET_PROMPT_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.resetPrompt}`;

export const UserPromptEditor = () => {
  const access = userAuthStore();
  const navigate = useNavigate();
  const [originalPrompt, setOriginalPrompt] = useState({ prompt: "" });
  const [inputData, setInputData] = useState({ prompt: "" });

  const confirmEditMessage = "Do you confirm to save the change?";
  const confirmResetMessage =
    "The prompt will be reset to default, are you sure?";

  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    const data = await fetchCurrentSystemPrompt(FETCH_PROMPT_PATH);
    const originalData = { prompt: data };
    setOriginalPrompt(originalData);
    setInputData(originalData);
  };

  const handleEdit = () => {
    editSystemPrompt(inputData, EDIT_PROMPT_PATH)
      .then((response: Response) => {
        if (response.status === 200) {
          // Fetch the updated data
          fetchData();
        } else {
          console.error("Delete failed with status:", response.status);
        }
      })
      .catch((error: Error) => {
        console.error("Error during deletion:", error);
      });
  };

  const handleReset = () => {
    resetSystemPrompt(RESET_PROMPT_PATH)
      .then((response: Response) => {
        if (response.status === 200) {
          // Fetch the updated data
          fetchData();
        } else {
          console.error("Delete failed with status:", response.status);
        }
      })
      .catch((error: Error) => {
        console.error("Error during deletion:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ListPanel title="AI Prompt Editor" onClose={() => navigate(Path.UserPage)}>
      <div className={styles["button-section"]}>
        {inputData.prompt != originalPrompt.prompt ? (
          <div>
            <IconButton
              text="Save"
              type="danger"
              onClick={async () => {
                if (await showConfirm(confirmEditMessage)) {
                  handleEdit();
                }
              }}
            />
          </div>
        ) : (
          <></>
        )}
        <div>
          <IconButton
            text="Reset"
            type="primary"
            className={styles["reset-button"]}
            onClick={async () => {
              if (await showConfirm(confirmResetMessage)) {
                handleReset();
              }
            }}
          />
        </div>
      </div>
      <div className={styles["user-record"]}>
        <textarea
          name="prompt"
          className={styles["data-input"]}
          placeholder="System Prompt"
          value={inputData.prompt}
          onChange={handleInputChange}
        />
      </div>
    </ListPanel>
  );
};
