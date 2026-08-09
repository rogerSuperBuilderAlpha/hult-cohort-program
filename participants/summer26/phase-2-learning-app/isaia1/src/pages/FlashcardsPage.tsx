import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { IoCheckmark, IoRefresh, IoStar } from '../utils/icons';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';

export default function FlashcardsPage() {
  const { courseId = '' } = useParams();
  const { getCourseById } = useCourses();
  const course = getCourseById(courseId);
  const { masterFlashcard, progress } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!course || course.flashcards.length === 0) {
    return (
      <>
        <header className="stack-header">
          <Link to={`/courses/${courseId}`} className="back-btn"><IoArrowBack size={22} /></Link>
          <span className="stack-title">Flashcards</span>
        </header>
        <p style={{ textAlign: 'center', marginTop: 40, color: 'rgba(255,255,255,0.78)' }}>No flashcards available for this course.</p>
      </>
    );
  }

  const card = course.flashcards[currentIndex];
  const isMastered = progress.masteredFlashcards.includes(card.id);

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1 >= course.flashcards.length ? 0 : i + 1));
  };

  const handleKnow = () => {
    masterFlashcard(card.id);
    goNext();
  };

  return (
    <>
      <header className="stack-header">
        <Link to={`/courses/${courseId}`} className="back-btn"><IoArrowBack size={22} /></Link>
        <span className="stack-title">Flashcards</span>
      </header>

      <div className="page" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.78)' }}>{currentIndex + 1} / {course.flashcards.length}</span>
          {isMastered && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(251,146,60,0.15)', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#fb923c' }}>
              <IoStar size={14} /> Mastered
            </span>
          )}
        </div>

        <div className="flashcard-scene" onClick={() => setIsFlipped(!isFlipped)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}>
          <div className={`flashcard-inner${isFlipped ? ' flipped' : ''}`}>
            <div className="flashcard-face">
              <div className="flashcard-label">Question</div>
              <div className="flashcard-text">{card.front}</div>
              <div className="flashcard-hint">Tap to flip</div>
            </div>
            <div className="flashcard-face back">
              <div className="flashcard-label">Answer</div>
              <div className="flashcard-text">{card.back}</div>
              <div className="flashcard-hint">Tap to flip back</div>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={goNext} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>
              <IoRefresh size={20} /> Review Again
            </button>
            <button type="button" onClick={handleKnow} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, background: '#6ee7b7', color: '#fff', fontWeight: 700 }}>
              <IoCheckmark size={20} /> Got It!
            </button>
          </div>
        )}
      </div>
    </>
  );
}
