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
} from "../../store/record-helper";

export const UserRecord = () => {
  const access = userAuthStore();
  const navigate = useNavigate();
  const goChat = () => navigate(Path.Chat);
  const [faqs, setFaqs] = useState<FAQSet[]>([]);
  const [inputData, setInputData] = useState({ question: "", answer: "" });

  // Handle input change
  const handleInputChange = (e: any) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    const data = await fetchCurrentRecord();
    setFaqs(data);
  };

  // Handle form submission
  const handleSubmit = () => {
    // if (inputData.question.trim() === '' || inputData.answer.trim() === '') {
    //     alert('Please fill in both question and answer fields.');
    //     return; // Stop the function from proceeding further
    // }
    // Add logic to handle submission here
    submitNewRecord(inputData)
      .then((response: Response) => {
        // Check if the response status is 200
        if (response.status === 200) {
          // Reset the input fields
          setInputData({ question: "", answer: "" });
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles["user-record"]}>
      <table>
        <thead>
          <tr>
            <th className="record-question">Question</th>
            <th className="record-answer">Answer</th>
            <th className="record-status">Status</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq, index) => (
            <tr key={index}>
              <td className="record-question">{faq.question}</td>
              <td className="record-answer">{faq.answer}</td>
              <td className="record-status">
                {faq.status == 1 ? "Added" : "Pending"}
              </td>
            </tr>
          ))}
          <tr key={10}>
            <td className="record-question">
              <textarea
                name="question"
                value={inputData.question}
                onChange={handleInputChange}
              />
            </td>
            <td className="record-answer">
              <textarea
                name="answer"
                value={inputData.answer}
                onChange={handleInputChange}
              />
            </td>
            <td>
              <button onClick={handleSubmit}>Submit</button>
              {/* <button onClick={handleSubmit}>Delete</button> */}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
