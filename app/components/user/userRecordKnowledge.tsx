import styles from "./userRecordKnowledge.module.scss";
import { IconButton } from "../button";
import { userAuthStore } from "../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { useEffect, useState } from "react";
import {
  KnowledgeSet,
  fetchCurrentRecord,
  submitNewRecord,
  editRecord,
  deleteRecord,
} from "../../store/record-helper";
import { ListPanel } from "../ui-lib";
import {
  GeneralKnowledgeModal,
  NewGeneralKnowledgeModal,
} from "./knowledgeConfig/generalKnowledge";
import { LIBRARY_ROUTES, REMOTE_OTA_BRAIN_HOST } from "../../constant";

const FETCH_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.getKnowledgeData}`;
const SUBMIT_NEW_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.submitNewKnowledgeData}`;
const EDIT_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.editKnowledgeData}`;
const DEELTE_RECORD_PATH = `${REMOTE_OTA_BRAIN_HOST}/${LIBRARY_ROUTES.deleteKnowledgeData}`;

export const UserRecordKnowledge = () => {
  const access = userAuthStore();
  const navigate = useNavigate();
  const [knowledges, setKnowledges] = useState<KnowledgeSet[]>([]);
  const [FAQModalIndex, setFAQModalIndex] = useState(-1);
  const [showNewFAQModal, setshowNewFAQModal] = useState(false);

  const fetchData = async () => {
    const data = await fetchCurrentRecord<KnowledgeSet>(FETCH_RECORD_PATH);
    setKnowledges(data);
  };

  // Handle form submission
  const handleSubmit = (newData: { title: string; knowledge: string }) => {
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

  const handleEdit = (oldData: KnowledgeSet, newData: KnowledgeSet) => {
    editRecord<KnowledgeSet>(oldData, newData, EDIT_RECORD_PATH)
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

  const handleDelete = (data: KnowledgeSet) => {
    deleteRecord<KnowledgeSet>(data, DEELTE_RECORD_PATH)
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
    <ListPanel
      title="Knowledge Admin Panel"
      onClose={() => navigate(Path.UserPage)}
    >
      <IconButton
        text="Add New"
        type="primary"
        onClick={() => {
          setshowNewFAQModal(true);
        }}
      />
      {showNewFAQModal && (
        <NewGeneralKnowledgeModal
          onClose={() => setshowNewFAQModal(false)}
          submitHandler={handleSubmit}
        />
      )}
      <div className={styles["user-record"]}>
        <table>
          <thead>
            <tr>
              <th className="record-title">Title</th>
              <th className="record-knowledge">Knowledge / Information</th>
              <th className="record-status">Status</th>
              <th className="record-operation"></th>
            </tr>
          </thead>
          <tbody>
            {knowledges.map((knowledge, index) => (
              <tr key={index}>
                <td className="record-title">
                  <b>{knowledge.title}</b>
                </td>
                <td className={styles["record-knowledge"]}>
                  {knowledge.knowledge}
                </td>
                <td className={styles["record-status"]}>
                  <span
                    className={`${styles["status-box"]} ${
                      styles[
                        knowledge.status === 1
                          ? "status-added"
                          : "status-pending"
                      ]
                    }`}
                  >
                    {knowledge.status == 1 ? "Added" : "Pending"}
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
                    <GeneralKnowledgeModal
                      onClose={() => setFAQModalIndex(-1)}
                      data={knowledge}
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
