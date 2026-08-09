import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { IoCheckmarkCircle, IoCloseCircle, IoRibbon, IoTrophy } from '../utils/icons';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';
import ProgressBar from '../components/ProgressBar';

export default function QuizPage() {
  const { courseId = '' } = useParams();
  const { getCourseById } = useCourses();
  const course = getCourseById(courseId);
  const { saveQuizScore } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!course || course.quizzes.length === 0) {
    return (
      <>
        <header className="stack-header">
          <Link to={`/courses/${courseId}`} className="back-btn"><IoArrowBack size={22} /></Link>
          <span className="stack-title">Quiz</span>
        </header>
        <p style={{ textAlign: 'center', marginTop: 40, color: 'rgba(255,255,255,0.78)' }}>No quiz available for this course.</p>
      </>
    );
  }

  const question = course.quizzes[currentIndex];
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / course.quizzes.length) * 100;

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    setShowExplanation(true);
    if (index === question.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= course.quizzes.length) {
      const finalScore = Math.round((score / course.quizzes.length) * 100);
      saveQuizScore(courseId, finalScore);
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setShowExplanation(false);
  };

  if (finished) {
    const finalScore = Math.round((score / course.quizzes.length) * 100);
    return (
      <>
        <header className="stack-header">
          <Link to={`/courses/${courseId}`} className="back-btn"><IoArrowBack size={22} /></Link>
          <span className="stack-title">Quiz Results</span>
        </header>
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          {finalScore >= 70 ? <IoTrophy size={80} color="#fb923c" /> : <IoRibbon size={80} color="#a78bfa" />}
          <h1 className="h1" style={{ marginTop: 20 }}>Quiz Complete!</h1>
          <div style={{ fontSize: 56, fontWeight: 800, color: '#a78bfa', margin: '8px 0' }}>{finalScore}%</div>
          <p className="subtitle" style={{ marginBottom: 32 }}>{score} of {course.quizzes.length} correct</p>
          <Link to={`/courses/${courseId}`} className="btn-primary btn-solid" style={{ width: 'auto', padding: '16px 32px' }}>Back to Course</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="stack-header">
        <Link to={`/courses/${courseId}`} className="back-btn"><IoArrowBack size={22} /></Link>
        <span className="stack-title">Quiz</span>
      </header>

      <div className="page" style={{ paddingBottom: showExplanation ? 100 : 40 }}>
        <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.78)', marginBottom: 12 }}>
          Question {currentIndex + 1} of {course.quizzes.length}
        </p>
        <ProgressBar progress={progress} />
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, marginBottom: 28 }}>{question.question}</h2>

        {question.options.map((option, index) => {
          let className = 'quiz-option';
          if (selectedIndex !== null) {
            if (index === question.correctIndex) className += ' correct';
            else if (index === selectedIndex) className += ' wrong';
          }
          return (
            <button key={index} type="button" className={className} onClick={() => handleSelect(index)} disabled={selectedIndex !== null}>
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{option}</span>
              {selectedIndex !== null && index === question.correctIndex && <IoCheckmarkCircle size={22} color="#6ee7b7" />}
              {selectedIndex === index && index !== question.correctIndex && <IoCloseCircle size={22} color="#fca5a5" />}
            </button>
          );
        })}

        {showExplanation && (
          <div style={{ background: 'rgba(167,139,250,0.1)', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 6 }}>Explanation</div>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>

      {showExplanation && (
        <div className="sticky-footer">
          <button type="button" className="btn-primary btn-solid" onClick={handleNext}>
            {currentIndex + 1 >= course.quizzes.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </>
  );
}
