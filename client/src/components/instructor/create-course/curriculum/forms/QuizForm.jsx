import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, Trash2, Clock } from "lucide-react";

const QuizForm = ({ lectureId, onSave, existingData = null }) => {
  const [questions, setQuestions] = useState(
    existingData?.questions || [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctIndex: null,
      },
    ]
  );
  const [timeLimit, setTimeLimit] = useState(existingData?.timeLimit || "");

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = optIndex;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctIndex: null },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      return toast.error("At least one question is required");
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!questions.length) {
      return toast.error("At least one question is required");
    }

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Question ${i + 1} text is required`);
      }
      if (q.options.some((opt) => !opt.trim())) {
        return toast.error(`All options for Question ${i + 1} must be filled`);
      }
      if (q.correctIndex === null) {
        return toast.error(`Please select correct answer for Question ${i + 1}`);
      }
    }

    // ✅ Pass data to parent component for local state management
    const quizData = {
      timeLimit: Number(timeLimit) || null,
      questions: questions.map((q, index) => ({
        id: index + 1,
        question: q.questionText.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: q.options[q.correctIndex].trim(),
        correctIndex: q.correctIndex,
      })),
    };

    onSave?.(quizData);
    toast.success("Quiz saved successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] border border-[#2a2826] rounded-xl p-4 space-y-6 text-white"
    >
      {/* Quiz Settings */}
      <div className="bg-[#2a2826] p-4 rounded-lg">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Clock size={18} /> Quiz Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-sm">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="e.g., 30"
              min="1"
              className="w-full p-2 bg-[#1e1e1e] rounded outline-none focus:ring-2 focus:ring-[#f35e33] transition"
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-400">
              Questions: {questions.length} | 
              Completed: {questions.filter(q => q.questionText.trim() && q.options.every(opt => opt.trim()) && q.correctIndex !== null).length}
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h4 className="font-medium">Questions</h4>
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="border border-[#3a3a3a] rounded-lg p-4 space-y-4 bg-[#252525]"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Question {qIndex + 1}</h5>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>

            {/* Question Text */}
            <div>
              <input
                type="text"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className="w-full p-3 bg-[#1e1e1e] rounded outline-none focus:ring-2 focus:ring-[#f35e33] transition"
                placeholder="Enter your question here..."
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">
                Options (select the correct one):
              </p>
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center gap-3 p-2 rounded transition ${
                    q.correctIndex === optIndex 
                      ? "bg-green-900/30 border border-green-500/50" 
                      : "bg-[#1e1e1e]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctIndex === optIndex}
                    onChange={() => setCorrectAnswer(qIndex, optIndex)}
                    className="text-[#f35e33] focus:ring-[#f35e33]"
                  />
                  <span className="text-sm font-medium min-w-[20px]">
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIndex, optIndex, e.target.value)
                    }
                    className="flex-1 p-2 bg-transparent border-b border-gray-600 outline-none focus:border-[#f35e33] transition"
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 text-[#f35e33] hover:text-[#ff6f45] mx-auto text-sm font-medium"
        >
          <PlusCircle size={18} /> Add Another Question
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-6 py-3 rounded w-full font-medium"
        >
          Save Quiz ({questions.length} question{questions.length !== 1 ? 's' : ''})
        </button>
      </div>
    </form>
  );
};

export default QuizForm;
