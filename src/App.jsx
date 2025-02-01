import React, { useState, useEffect } from 'react';

const App = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answersRevealed, setAnswersRevealed] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.allorigins.win/raw?url=https://api.jsonserve.com/Uw5CrX');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOptionSelect = (questionId, option) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [questionId]: option
    }));
    if (!answersRevealed[questionId] && option.is_correct === false) {
      setAnswersRevealed(prevState => ({
        ...prevState,
        [questionId]: true
      }));
    }
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;

    for (const question of data.questions) {
      const selectedOption = selectedOptions[question.id];
      const correctOption = question.options.find(option => option.is_correct);

      if (selectedOption) {
        if (selectedOption.id === correctOption.id) {
          correct++;
        } else {
          wrong++;
        }
      }
    }

    setCorrectCount(correct);
    setWrongCount(wrong);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleFinishQuiz = () => {
    calculateResults();
    setShowResults(true);
  };

  const closeModal = () => {
    setShowResults(false);
  };


  if (loading) {
    return <div><div id="loading-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">

      <svg class="animate-spin h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>

      <span class="text-blue-500 text-3xl font-bold">Loading...</span>

    </div></div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">Error: {error}</div>;
  }

  const { title, description, questions } = data;

  return (
    <>
      <h1 class="text-4xl pb-3 md:text-5xl lg:text-6xl font-bold mx-auto text-center  p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white  shadow-xl ">
        Quiz
      </h1>


      <div className="App p-4 mx-auto my-2 max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl ">
        <h1 className="text-center text-blue-500 text-3xl font-bold">{title}</h1>
        <p className="mt-4 text-xl">{description}</p>

        {questions && questions.length > 0 ? (
          <div className="mt-6">
            {/* Display the current question card */}
            <div className="p-6 mb-4 border rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold">
                {currentQuestionIndex + 1}. {questions[currentQuestionIndex].description}
              </h2>
              <div className="mt-4">
                {questions[currentQuestionIndex].options.map((option) => {
                  let backgroundColor = '';
                  const selectedOption = selectedOptions[questions[currentQuestionIndex].id];
                  if (selectedOption) {
                    if (selectedOption.id === option.id) {
                      backgroundColor = option.is_correct ? 'bg-green-500' : 'bg-red-500';
                    }
                  }
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center mt-2 p-2 rounded ${backgroundColor}`}
                      onClick={() => handleOptionSelect(questions[currentQuestionIndex].id, option)}
                    >
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name={`question-${questions[currentQuestionIndex].id}`}
                        value={option.description}
                        checked={selectedOption && selectedOption.id === option.id}
                        readOnly
                        className="mr-2"
                      />
                      <label htmlFor={`option-${option.id}`} className="text-lg">{option.description}</label>
                    </div>
                  );
                })}
                {selectedOptions[questions[currentQuestionIndex].id] && !selectedOptions[questions[currentQuestionIndex].id].is_correct && (
                  <p className="mt-4 text-lg font-semibold">
                    Correct Answer: {questions[currentQuestionIndex].options.find(option => option.is_correct).description}
                  </p>
                )}
              </div>
            </div>

            {/* Prev and Next Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Next
              </button>
            </div>

            {/* Show Results Button */}
            {currentQuestionIndex === questions.length - 1 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleFinishQuiz}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Finish Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>No questions available.</p>
        )}

        {/* Display Results Only After the Last Question */}
        {showResults && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white w-4/5 h-4/5 p-6 rounded-lg shadow-lg text-center relative flex flex-col justify-center">
      <button onClick={closeModal} className="absolute top-4 right-4 text-2xl font-bold">
        ✖
      </button>
      <h2 className="text-6xl text-blue-500 underline font-bold mb-6">Quiz Results</h2>
      <p className="text-xl">Total Questions: {data.questions.length}</p>
      <p className="text-xl text-green-500">Correct Answers: {correctCount}</p>
      <p className="text-xl text-red-500">Wrong Answers: {wrongCount}</p>
      <p className="text-2xl my-5 font-bold text-gray-500">Percentage: {((correctCount / data.questions.length) * 100).toFixed(2)}%</p>
    </div>
  </div>
)}


      </div>
    </>
  );
};

export default App;
