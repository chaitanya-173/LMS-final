const Lecture = require("../../models/LectureModel");
const QuizResponse = require("../../models/QuizResponseModel");

/**
 * Submit Quiz
 * POST /api/student/quiz/:lectureId
 */
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const { lectureId } = req.params;
    const { userId, userName } = req.user;

    // ✅ Check if quiz already attempted
    const existingAttempt = await QuizResponse.findOne({ studentId: userId, lectureId });
    if (existingAttempt) {
      return res.status(400).json({
        message: "You have already submitted this quiz.",
        attemptId: existingAttempt._id
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.quiz || !lecture.quiz.questions) {
      return res.status(404).json({ message: "Quiz not found for this lecture" });
    }

    const { courseId, quiz } = lecture;
    const questions = quiz.questions;
    const totalQuestions = questions.length;

    let correctAnswers = 0;
    const detailedAnswers = [];

    questions.forEach((q) => {
      const userAnswer = answers.find((a) => a.question === q.question);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === q.correctAnswer;

      detailedAnswers.push({
        question: q.question,
        selectedAnswer: userAnswer?.selectedAnswer || "",
        correctAnswer: q.correctAnswer,
        isCorrect,
      });

      if (isCorrect) correctAnswers++;
    });

    const response = new QuizResponse({
      studentId: userId,
      studentName: userName,
      lectureId,
      courseId,
      answers: detailedAnswers,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      timeTaken,
    });

    await response.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      studentName: userName,
      score: correctAnswers,
      totalQuestions,
      percentage: ((correctAnswers / totalQuestions) * 100).toFixed(2),
      responseId: response._id,
      result: detailedAnswers,
    });
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Check Quiz Status (Attempted or Not)
 * GET /api/student/quiz/:lectureId/status
 */

const getQuizStatus = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.userId;

    // Check if attempted
    const attempt = await QuizResponse.findOne({
      studentId,
      lectureId: lectureId,
    });

    if (attempt) {
      return res.json({
        attempted: true,
        result: {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          submittedAt: attempt.submittedAt,
        },
      });
    }

    // If not attempted, return quiz meta info
    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.quiz || !lecture.quiz.questions) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json({
      attempted: false,
      questions: lecture.quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
      timeLimit: lecture.quiz.timeLimit || 900,
    });
  } catch (err) {
    console.error("Quiz status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getQuizResult = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.userId; // ✅ Important fix

    const result = await QuizResponse.findOne({ lectureId, studentId });

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    res.json({
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      timeTaken: result.timeTaken,
      submittedAt: result.submittedAt,
      answers: result.answers, // full breakdown
    });
  } catch (err) {
    console.error("Quiz result fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitQuiz, getQuizStatus, getQuizResult };
