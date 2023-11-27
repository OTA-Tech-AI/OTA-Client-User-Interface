import styles from "./generalKnowledge.module.scss";
import { IconButton } from "../../button";
import { userAuthStore } from "../../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { KnowledgeSet } from "../../../store/record-helper";
import { List, ListItem, Modal } from "../../ui-lib";
import Locale from "../../../locales";
import ConfirmIcon from "../../../icons/confirm.svg";
import CancelIcon from "../../../icons/cancel.svg";
import DeleteIcon from "../../../icons/delete.svg";

export function GeneralKnowledgeModal(props: {
  onClose: () => void;
  data: KnowledgeSet;
  editHandler: (oldData: KnowledgeSet, newData: KnowledgeSet) => void;
  deleteHandler: (data: KnowledgeSet) => void;
}) {
  const originTitle = props.data.title;
  const originKnowledge = props.data.knowledge;
  const [inputData, setInputData] = useState({
    title: props.data.title,
    knowledge: props.data.knowledge,
  });

  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    if (inputData.title.trim() === "" || inputData.knowledge.trim() === "") {
      alert("Please fill in both title and knowledge.");
      return; // Stop the function from proceeding further
    }
    const newData = {
      index: props.data.index,
      title: inputData.title,
      knowledge: inputData.knowledge,
      status: 0,
    };
    props.editHandler(props.data, newData);
    props.onClose();
  };

  const handleDelete = () => {
    props.deleteHandler(props.data);
    props.onClose();
  };

  return (
    <div className="modal-mask">
      <Modal
        title="General Knowledge / Information"
        onClose={props.onClose}
        actions={
          inputData.title == originTitle &&
          inputData.knowledge == originKnowledge
            ? [
                <IconButton
                  type="danger"
                  text="Delete"
                  icon={<DeleteIcon />}
                  key="delete"
                  onClick={() => {
                    handleDelete();
                  }}
                />,
                <IconButton
                  text={Locale.UI.Cancel}
                  icon={<CancelIcon />}
                  key="cancel"
                  onClick={() => {
                    props.onClose();
                  }}
                />,
              ]
            : [
                <IconButton
                  type="danger"
                  text="Delete"
                  icon={<DeleteIcon />}
                  key="delete"
                  onClick={() => {
                    handleDelete();
                  }}
                />,
                <IconButton
                  text={Locale.UI.Cancel}
                  icon={<CancelIcon />}
                  key="cancel"
                  onClick={() => {
                    props.onClose();
                  }}
                />,
                <IconButton
                  type="primary"
                  text={Locale.UI.Confirm}
                  icon={<ConfirmIcon />}
                  key="ok"
                  onClick={() => {
                    handleEdit();
                  }}
                />,
              ]
        }
      >
        <List>
          <ListItem title="Title">
            <textarea
              name="title"
              className={styles["data-input"]}
              value={inputData.title}
              onChange={handleInputChange}
            />
          </ListItem>
          <ListItem title="Knowledge / Information">
            <textarea
              name="knowledge"
              className={`${styles["data-input"]} ${styles["knowledge-input"]}`}
              value={inputData.knowledge}
              onChange={handleInputChange}
            />
          </ListItem>
        </List>
      </Modal>
    </div>
  );
}

export function NewGeneralKnowledgeModal(props: {
  onClose: () => void;
  submitHandler: (data: { title: string; knowledge: string }) => void;
}) {
  const [inputData, setInputData] = useState({ title: "", knowledge: "" });
  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (inputData.title.trim() === "" || inputData.knowledge.trim() === "") {
      alert("Please fill in both title and knowledge fields.");
      return; // Stop the function from proceeding further
    }
    const newData = {
      title: inputData.title,
      knowledge: inputData.knowledge,
    };
    props.submitHandler(newData);
    props.onClose();
  };

  return (
    <div className="modal-mask">
      <Modal
        title="General library Knowledge / Information"
        onClose={props.onClose}
        actions={
          inputData.title == "" || inputData.knowledge == ""
            ? [
                <IconButton
                  text={Locale.UI.Cancel}
                  icon={<CancelIcon />}
                  key="cancel"
                  onClick={() => {
                    props.onClose();
                  }}
                />,
              ]
            : [
                <IconButton
                  text={Locale.UI.Cancel}
                  icon={<CancelIcon />}
                  key="cancel"
                  onClick={() => {
                    props.onClose();
                  }}
                />,
                <IconButton
                  type="primary"
                  text="Submit"
                  icon={<ConfirmIcon />}
                  key="ok"
                  onClick={() => {
                    handleSubmit();
                  }}
                />,
              ]
        }
      >
        <List>
          <ListItem title="Title">
            <textarea
              name="title"
              className={styles["data-input"]}
              placeholder="Your title"
              value={inputData.title}
              onChange={handleInputChange}
            />
          </ListItem>
          <ListItem title="Knowledge">
            <textarea
              name="knowledge"
              className={`${styles["data-input"]} ${styles["knowledge-input"]}`}
              placeholder="The knowledge you want OTA to learn"
              value={inputData.knowledge}
              onChange={handleInputChange}
            />
          </ListItem>
        </List>
      </Modal>
    </div>
  );
}
