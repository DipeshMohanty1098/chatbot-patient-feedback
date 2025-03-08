import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './chatbotstyles.css';
import { query } from '../services/sentimentAnalyzer';

const DoctorSurveyQuestions = [
  { text: "How would you rate the doctor's professionalism?", side: "left" },
  { text: "How satisfied are you with the doctor’s ability to explain your diagnosis and treatment options?", side: "left" },
  { text: "How would you rate the doctor’s attentiveness and willingness to listen to your concerns?", side: "left" },
  { text: "How would you rate your overall experience with this doctor?", side: "left" },
]

const PrescriptionSurveyQuestions = [
  { text: "Was the prescribed medication explained to you clearly, including its purpose and how to take it?", side: "left" },
  { text: "How would you rate the effectiveness of the prescribed medication in treating your condition?", side: "left" },
  { text: "How would you rate the convenience of the prescription process, including refills?", side: "left" }
]

const VisitSurveyQuestions = [
  { text: "How satisfied are you with the ease of scheduling your appointment?", side: "left" },
  { text: "How would you rate the wait time before seeing the doctor?", side: "left" },
  { text: "How well did the doctor explain your condition and treatment options?", side: "left" },
  { text: "How would you rate the overall quality of care you received during your visit?", side: "left" }
]


const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [questions, setQuestions] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionType, setQuestionType] = useState("")
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optionClicked, setOptionClicked] = useState(false);
  const [sentiment, setSentiment] = useState([]);
  const [options, setOptions] = useState([]);



  const handleSend = () => {
    if (optionClicked) {
      if (currentQuestionIndex === PrescriptionSurveyQuestions.length) {
        query({ inputs: userInput }).then((response) => {
          console.log(response);
          getSentiment(response);
        });
        setCurrentQuestionIndex(0);
        setOptionClicked(false);
        const botMessage = {
          text: "Thank you so much for your feedback! Would you like to provide feeback for another prescription?",
          options: options,
        }
        setChatHistory([...chatHistory, { text: userInput, side: "right" }, botMessage])
        setUserInput("")
      } else {
        const userMessage = { text: userInput, side: "right" };
        const botMessage = { text: PrescriptionSurveyQuestions[currentQuestionIndex]?.text, side: "left" };

        // Move to the next question
        setCurrentQuestionIndex((prev) => currentQuestionIndex !== PrescriptionSurveyQuestions.length ? prev + 1 : 0);

        if (userInput) {
          query({ inputs: userInput }).then((response) => {
            console.log(response);
            getSentiment(response);
          });
          setChatHistory([...chatHistory, userMessage, botMessage])
        }
        if (!userInput && botMessage.text) {
          setChatHistory([...chatHistory, botMessage])
        }
        setUserInput("");
      }
    } else {
      if (userInput) {
        const botMessage = { text: "Please select a prescription you want to review", side: "left" };
        setChatHistory([...chatHistory, { text: userInput, side: "right" }, botMessage])
        setUserInput("");
      }
    }



  };

  const getSentiment = (data) => {
    const maxValue = Number(Math.max(...data[0].map(obj => obj.score)));
    console.log("MAX VALUE: " + Number(maxValue))
    const mostProbableSentiment = data[0].find(obj => obj.score === maxValue).label;
    setSentiment([...sentiment, mostProbableSentiment]);
  }

  const handleOptionClick = (option) => {
    const topics = ['Doctors', 'Visits', 'Prescriptions']
    if (topics.includes(option)) {
      if (option === topics[0]) {
        setQuestions(DoctorSurveyQuestions)
        return 
      }
      if (option === topics[1]) {
        setQuestions(VisitSurveyQuestions)
        return 
      }
      if (option === topics[2]) {
        setQuestions(PrescriptionSurveyQuestions)
        return 
      }
    } else {
      const botMessage = { text: PrescriptionSurveyQuestions[currentQuestionIndex]?.text, side: "left" };
      setChatHistory([...chatHistory, { text: `Selected to review ${option}` }, botMessage])
      const filteredOptions = options.filter((o) => o !== option)
      setOptions(filteredOptions);
      if (currentQuestionIndex < PrescriptionSurveyQuestions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      setOptionClicked(true)
    }
  }

  const mostFrequent = (arr) => {
    const freqMap = arr.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(freqMap).reduce((a, b) => (freqMap[a] > freqMap[b] ? a : b));
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://e-react-node-backend-22ed6864d5f3.herokuapp.com/table/prescription/"); // Replace with your API URL
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        const patientResults = result.filter((prescription) => prescription.patient_id === 132)
        console.log(patientResults)
        const options = patientResults.map((prescription) => {
          return `${prescription.prescription_description || 'NA'} - ${prescription.quantity || 'NA'} - ${prescription.route || 'NA'}`
        })
        console.log(options)
        setOptions(options);
        setChatHistory([
          {
            text: `Hey ${patientResults[0].patient_FName}! Help us improve the e-hospital platform by taking a short survey! Which topic would you like to choose?`,
            options: ['Doctors', 'Visits', 'Prescriptions']
          },
          {
            text: `These are the items that we found on your profile. Select which prescription you want to review.`,
            options: options
          }])
      } catch (err) {
        console.log("error")
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, []);


  return (
    <div className="chat-parent">
      <h2 className="">Patient Feedback</h2>
      {loading === false ? <div className="chat-container">
        {chatHistory.map((entry) => (
          entry.text && <div className={entry.side === "right" ? "userBox" : "botBox"}>
            <strong>{entry.side === "right" ? "You: " : "Assistant: "}</strong> {entry.text}
            <br></br>
            <br></br>
            {!loading && entry.options ? entry.options.map((option) => (
              <div style={{ padding: '5px' }}><button disabled={optionClicked} onClick={() => handleOptionClick(option)} className="custom-button" >{option}</button></div>)) :
              <div />}
          </div>
        ))}
      </div> : <div />}
      <br></br>
      {currentQuestionIndex <= PrescriptionSurveyQuestions.length && (<div className="input-box">
        <input
          type="text"
          className="custom-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Provide your feedback..."
        />
        <div style={{ paddingLeft: "5px" }}></div>
        <button
          className="custom-button"
          onClick={handleSend}
        >
          Send
        </button>
      </div>)}
      {sentiment.length > 0 && ("Current Sentiment: " + mostFrequent(sentiment))}
    </div>
  );
}

export default Chatbot;