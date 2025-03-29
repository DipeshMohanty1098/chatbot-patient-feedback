import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './chatbotstyles.css';
import { query } from '../services/sentimentAnalyzer';

const DoctorSurveyQuestions = [
  { text: "How would you rate the doctor's professionalism?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" },
  { text: "How satisfied are you with the doctor’s ability to explain your diagnosis and treatment options?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" },
  { text: "How would you rate the doctor’s attentiveness and willingness to listen to your concerns?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" },
  { text: "How would you rate your overall experience with this doctor?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'],  side: "left" },
]

const PrescriptionSurveyQuestions = [
  { text: "Was the prescribed medication explained to you clearly, including its purpose and how to take it?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" },
  { text: "How would you rate the effectiveness of the prescribed medication in treating your condition?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'],  side: "left" },
  { text: "How would you rate the convenience of the prescription process, including refills?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" }
]

const VisitSurveyQuestions = [
  { text: "How satisfied are you with the ease of scheduling your appointment?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'],  side: "left" },
  { text: "How would you rate the wait time before seeing the doctor?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'],  side: "left" },
  { text: "How well did the doctor explain your condition and treatment options?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'],  side: "left" },
  { text: "How would you rate the overall quality of care you received during your visit?", responses: ['Very Satisfied', 'Neutral', 'Dissatisifed'], side: "left" }
]


const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionType, setQuestionType] = useState("")
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optionClicked, setOptionClicked] = useState(false);
  const [sentiment, setSentiment] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [patientAnswer, setPatientAnswer] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [topic, setTopic] = useState(null);



  const handleSend = async () => {
    if (optionClicked) {
      if (currentQuestionIndex === questions.length) {
        query({ inputs: userInput + ' ' + patientAnswer }).then((response) => {
          console.log(response);
          getSentiment(response);
        });
        setCurrentQuestionIndex(0);
        setOptionClicked(false);
        const botMessage = {
          text: "Thank you so much for your feedback! Would you like to provide feeback for another topic?",
          options: ['Doctors', 'Visits', 'Prescriptions'],
        }
        setChatHistory([...chatHistory, { text: userInput, side: "right" }, botMessage])
        setUserInput("")
      } else {
        const userMessage = { text: userInput, side: "right" };
        const botMessage = { text: questions[currentQuestionIndex]?.text, responses: ['Very Satisfied', 'Neutral', 'Dissatisfied'], side: "left" };

        // Move to the next question
        setCurrentQuestionIndex((prev) => currentQuestionIndex !== questions.length ? prev + 1 : 0);

        if (userInput || patientAnswer) {
          query({ inputs: `${userInput || ''}` + ' ' + patientAnswer  }).then((response) => {
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
        const botMessage = { text: "Please select an item you want to review", side: "left" };
        setChatHistory([...chatHistory, { text: userInput, side: "right" }, botMessage])
        setUserInput("");
      }
    }
    try {
      const response = await fetch('https://e-react-node-backend-22ed6864d5f3.herokuapp.com/table/PatientSurveyResponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic_id: 'John Doe',
          topic: topic,
          rating: patientAnswer,
          additional_comments: userInput,
          patient_id: 132,
          sentiment: sentiment[sentiment.length - 1] ? sentiment[sentiment.length - 1] : null,
          question: questions[currentQuestionIndex].text ? sentiment[sentiment.length - 1] : null
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error:', error);
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
    const answers = ['Very Satisfied', 'Neutral', 'Dissatisfied']
    if (answers.includes(option)) {
      setPatientAnswer(option);
      console.log(patientAnswer)
      setChatHistory([...chatHistory, { text: `Feedback: ${option}` }])
      return
    }
    if (topics.includes(option)) {
      if (option === topics[0]) {
        setTopicId(1)
        setQuestions(DoctorSurveyQuestions)
        setTopic(topics[0])
        setQuestionType(option)
        fetchPatientItems(option)
      }
      if (option === topics[1]) {
        setTopicId(2)
        setQuestions(VisitSurveyQuestions)
        setQuestionType(option)
        fetchPatientItems(option)
        setTopic(topics[1])
      }
      if (option === topics[2]) {
        setTopicId(3)
        setQuestions(PrescriptionSurveyQuestions)
        setQuestionType(option)
        fetchPatientItems(option)
        setTopic(topics[2])
      }
    } else {
      const botMessage = { text: questions[currentQuestionIndex]?.text,responses: ['Very Satisfied', 'Neutral', 'Dissatisfied'], side: "left" };
      setChatHistory([...chatHistory, { text: `Selected to review ${option}` }, botMessage])
      const filteredOptions = options.filter((o) => o !== option)
      setOptions(filteredOptions);
      if (currentQuestionIndex < questions.length) {
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

  const getUniqueObjects = (arr, key) => {
    const seen = new Set();
    return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

  const fetchPatientItems = async (option) => {
    /*
    doctor_patient_visits
    */
   if (option === 'Visits') {
    try {
      const response = await fetch("https://e-react-node-backend-22ed6864d5f3.herokuapp.com/table/doctor_patient_visits"); // Replace with your API URL
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      const patientResults = result.filter((visit) => visit.patient_id === 132)
      console.log(patientResults)
      const options = patientResults.map((visit) => {
        return `${visit.visit_id || 'NA'} - ${visit.reason_for_visit || 'NA'} - ${new Date(visit.record_time).toLocaleDateString() || 'NA'}`
      })
      console.log(options)
      setOptions(options);
      setChatHistory([
        ...chatHistory,
        {
          text: `These are the recent visits that we found on your profile. Select which visit you want to review.`,
          options: options
        }
      ])
      
    } catch (err) {
      console.log("error")
    } finally {
      setLoading(false)
    }
  }
  else if (option === 'Prescriptions') {
    try {
      const response = await fetch("https://e-react-node-backend-22ed6864d5f3.herokuapp.com/table/prescription/"); // Replace with your API URL
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      const patientResults = result.filter((prescription) => prescription.patient_id === 132)
      console.log(patientResults)
      const options = patientResults.map((prescription) => {
        return `${prescription.id} - ${prescription.prescription_description || 'NA'} - ${prescription.quantity || 'NA'} - ${prescription.route || 'NA'}`
      })
      console.log(options)
      setOptions(options);
      setChatHistory([
        ...chatHistory,
        {
          text: `These are the prescriptions that we found on your profile. Select which visit you want to review.`,
          options: options
        }])
      
    } catch (err) {
      console.log("error")
    } finally {
      setLoading(false)
    }
  } else {
    try {
      const response = await fetch("https://e-react-node-backend-22ed6864d5f3.herokuapp.com/table/prescription/"); // Replace with your API URL
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      const patientResults = getUniqueObjects(result.filter((prescription) => prescription.patient_id === 132), "doctor_id")
      console.log(patientResults)
      const options = patientResults.map((prescription) => {
        return `${prescription.doctor_id} - ${prescription.doctor_FName || 'NA'} ${prescription.doctor_LName || 'NA'}`
      })
      console.log(options)
      setOptions(options);
      setChatHistory([
        ...chatHistory,
        {
          text: `These are the doctor(s) that that have been assigned to you in the past. Select which doctor you want to review.`,
          options: options
        }])
      
    } catch (err) {
      console.log("error")
    } finally {
      setLoading(false)
    }
  }
  };

  useEffect(() => {
    const fetchData = async () => {
      /*
      doctor_patient_visits

      */
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
          },])
        
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
            {entry.responses ? entry.responses.map((r) => (
            <div style={{ padding: '5px', display:'flex' }}><button onClick={() => handleOptionClick(r)} className="custom-button" >{r}</button></div>)) :
            <div />}
          </div>  
        ))}
      </div> : <div />}
      <br></br>
      {currentQuestionIndex <= questions.length && (<div className="input-box">
        <input
          type="text"
          className="custom-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Provide additional comments..."
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