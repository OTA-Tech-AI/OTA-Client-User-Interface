import styles from "./userRecord.module.scss";
import { IconButton } from "../button";
import { userAuthStore } from "../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { useEffect, useState } from "react";
import {
  FAQSet,
  fetchCurrentRecord,
  submitNewRecord,
  editRecord,
  deleteRecord,
} from "../../store/record-helper";
import { ListPanel } from "../ui-lib";
import { SingleFAQModal, NewSingleFAQModal } from "./knowledgeConfig/singleFAQ";
import { LIBRARY_ROUTES, REMOTE_OTA_BRAIN_HOST } from "../../constant";

const FETCH_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.getFAQData}`;
const SUBMIT_NEW_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.submitNewFAQData}`;
const EDIT_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.editFAQData}`;
const DEELTE_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.deleteFAQData}`;

export const UserRecord = () => {
  const access = userAuthStore();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQSet[]>([]);
  const [FAQModalIndex, setFAQModalIndex] = useState(-1);
  const [showNewFAQModal, setshowNewFAQModal] = useState(false);

  const fetchData = async () => {
    const data = await fetchCurrentRecord<FAQSet>(FETCH_RECORD_PATH);
    setFaqs(data);
  };

  // Handle form submission
  const handleSubmit = (newData: { question: string; answer: string }) => {
    // Add logic to handle submission here
    submitNewRecord(newData, SUBMIT_NEW_RECORD_PATH)
      .then((response: Response) => {
        // Check if the response status is 200
        if (response.status === 200) {
          // Fetch data
          fetchData();
        } else {
          // Handle non-200 responses if needed
          console.error("Submit failed with status:", response.status);
        }
      })
      .catch((error: Error) => {
        // Handle any errors that occurred during submitNewRecord
        console.error("Error during submission:", error);
      });
  };

  const handleEdit = (oldData: FAQSet, newData: FAQSet) => {
    editRecord<FAQSet>(oldData, newData, EDIT_RECORD_PATH)
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

  const handleDelete = (data: FAQSet) => {
    deleteRecord<FAQSet>(data, DEELTE_RECORD_PATH)
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
    <ListPanel title="FAQ Admin Panel" onClose={() => navigate(Path.UserPage)}>
      <IconButton
        text="Add New"
        type="primary"
        onClick={() => {
          setshowNewFAQModal(true);
        }}
      />
      {showNewFAQModal && (
        <NewSingleFAQModal
          onClose={() => setshowNewFAQModal(false)}
          submitHandler={handleSubmit}
        />
      )}
      <div className={styles["user-record"]}>
        <table>
          <thead>
            <tr>
              <th className="record-question">Question</th>
              <th className="record-answer">Answer</th>
              <th className="record-status">Status</th>
              <th className="record-operation"></th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq, index) => (
              <tr key={index}>
                <td className="record-question">{faq.question}</td>
                <td className="record-answer">{faq.answer}</td>
                <td className="record-status">
                  <span
                    className={`${styles["status-box"]} ${
                      styles[
                        faq.status === 1 ? "status-added" : "status-pending"
                      ]
                    }`}
                  >
                    {faq.status === 1 ? "Added" : "Pending"}
                  </span>
                </td>
                <td className="record-operation">
                  <IconButton
                    text="Edit"
                    type="primary"
                    onClick={() => {
                      setFAQModalIndex(index);
                    }}
                  />
                  {FAQModalIndex == index && (
                    <SingleFAQModal
                      onClose={() => setFAQModalIndex(-1)}
                      faq={faq}
                      editHandler={handleEdit}
                      deleteHandler={handleDelete}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPanel>
  );
};
