import React, { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
import { PlusCircle, Trash2 } from "lucide-react";

const QuizForm = ({ lectureId, onSave }) => {
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctIndex: null,
    },
  ]);
  const [timeLimit, setTimeLimit] = useState("");
  const [uploading, setUploading] = useState(false);

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
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questions.length) {
      return toast.error("At least one question is required");
    }

    for (const q of questions) {
      if (
        !q.questionText.trim() ||
        q.options.some((opt) => !opt.trim()) ||
        q.correctIndex === null
      ) {
        return toast.error("Please fill all questions properly and select correct answers");
      }
    }

    const quizData = {
      timeLimit,
      questions: questions.map((q) => ({
        question: q.questionText,
        options: q.options,
        correctAnswer: q.options[q.correctIndex],
      })),
    };

    try {
      setUploading(true);
      const res = await axiosInstance.post(
        `/api/instructor/quiz/upload/${lectureId}`,
        quizData
      );
      toast.success("Quiz uploaded successfully");
      onSave?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] border border-[#2a2826] rounded-xl p-4 space-y-6 text-white"
    >
      {/* Time Limit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Time Limit (in minutes)</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full p-2 bg-[#2a2826] rounded outline-none"
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="border border-[#3a3a3a] rounded-lg p-4 space-y-4"
        >
          {/* Question Text */}
          <div>
            <label className="block mb-1 font-medium">
              Question {qIndex + 1}
            </label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              className="w-full p-2 bg-[#2a2826] rounded outline-none"
              placeholder="Enter question"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-1">Select correct option</p>
            {q.options.map((opt, optIndex) => (
              <div
                key={optIndex}
                className={`flex items-center gap-2 p-1 rounded ${
                  q.correctIndex === optIndex ? "bg-green-600/20" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctIndex === optIndex}
                  onChange={() => setCorrectAnswer(qIndex, optIndex)}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(qIndex, optIndex, e.target.value)
                  }
                  className="flex-1 p-2 bg-[#2a2826] rounded outline-none"
                  placeholder={`Option ${optIndex + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Remove Question */}
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="text-red-500 hover:underline text-sm flex items-center gap-1"
            >
              <Trash2 size={16} /> Remove Question
            </button>
          )}
        </div>
      ))}

      {/* Add Question Button */}
      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-2 text-[#f35e33] hover:underline text-sm"
      >
        <PlusCircle size={18} /> Add Question
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full"
      >
        {uploading ? "Uploading..." : "Upload Quiz"}
      </button>
    </form>
  );
};

export default QuizForm;
