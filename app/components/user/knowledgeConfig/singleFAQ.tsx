import styles from "./singleFAQ.module.scss";
import { IconButton } from "../../button";
import { userAuthStore } from "../../../store/userAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FAQSet } from "../../../store/record-helper";
import { List, ListItem, Modal } from "../../ui-lib";
import Locale from "../../../locales";
import ConfirmIcon from "../../../icons/confirm.svg";
import CancelIcon from "../../../icons/cancel.svg";
import DeleteIcon from "../../../icons/delete.svg";

export function SingleFAQModal(props: {
  onClose: () => void;
  faq: FAQSet;
  editHandler: (oldFaq: FAQSet, newFaq: FAQSet) => void;
  deleteHandler: (faq: FAQSet) => void;
}) {
  const originQuestion = props.faq.question;
  const originAnswer = props.faq.answer;
  const [inputData, setInputData] = useState({
    question: props.faq.question,
    answer: props.faq.answer,
  });

  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    if (inputData.question.trim() === "" || inputData.answer.trim() === "") {
      alert("Please fill in both question and answer fields.");
      return; // Stop the function from proceeding further
    }
    const newFaq = {
      index: props.faq.index,
      question: inputData.question,
      answer: inputData.answer,
      status: 0,
    };
    props.editHandler(props.faq, newFaq);
    props.onClose();
  };

  const handleDelete = () => {
    props.deleteHandler(props.faq);
    props.onClose();
  };

  return (
    <div className="modal-mask">
      <Modal
        title="Single FAQ"
        onClose={props.onClose}
        actions={
          inputData.question == originQuestion &&
          inputData.answer == originAnswer
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
          <ListItem title="Question">
            <textarea
              name="question"
              className={styles["faq-input"]}
              value={inputData.question}
              onChange={handleInputChange}
            />
          </ListItem>
          <ListItem title="Answer">
            <textarea
              name="answer"
              className={styles["faq-input"]}
              value={inputData.answer}
              onChange={handleInputChange}
            />
          </ListItem>
        </List>
      </Modal>
    </div>
  );
}

export function NewSingleFAQModal(props: {
  onClose: () => void;
  submitHandler: (faq: { question: string; answer: string }) => void;
}) {
  const [inputData, setInputData] = useState({ question: "", answer: "" });
  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (inputData.question.trim() === "" || inputData.answer.trim() === "") {
      alert("Please fill in both question and answer fields.");
      return; // Stop the function from proceeding further
    }
    const newFaq = {
      question: inputData.question,
      answer: inputData.answer,
    };
    props.submitHandler(newFaq);
    props.onClose();
  };

  return (
    <div className="modal-mask">
      <Modal
        title="Single FAQ"
        onClose={props.onClose}
        actions={
          inputData.question == "" || inputData.answer == ""
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
          <ListItem title="Question">
            <textarea
              name="question"
              className={styles["faq-input"]}
              placeholder="User's question to OTA"
              value={inputData.question}
              onChange={handleInputChange}
            />
          </ListItem>
          <ListItem title="Answer">
            <textarea
              name="answer"
              className={styles["faq-input"]}
              placeholder="The answer you want OTA to learn"
              value={inputData.answer}
              onChange={handleInputChange}
            />
          </ListItem>
        </List>
      </Modal>
    </div>
  );
}
