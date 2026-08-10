import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoCheckmarkCircle } from 'react-icons/io5';
import AiTutorPanel from '../components/AiTutorPanel';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';

export default function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { getCourseById } = useCourses();
  const course = getCourseById(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const { completeLesson, isLessonComplete } = useProgress();
  const [completed, setCompleted] = useState(isLessonComplete(lessonId));

  if (!course || !lesson) {
    return (
      <div className="page">
        <p style={{ textAlign: 'center', marginTop: 40 }}>Lesson not found</p>
      </div>
    );
  }

  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = course.lessons[lessonIndex + 1];

  const handleComplete = () => {
    completeLesson(lessonId);
    setCompleted(true);
    const goNext = window.confirm('Lesson Complete! 🎉 You earned 25 XP!\n\nClick OK for next step, Cancel to stay.');
    if (!goNext) return;
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`, { replace: true });
    } else {
      navigate(`/courses/${courseId}/quiz`);
    }
  };

  return (
    <>
      <header className="stack-header">
        <Link to={`/courses/${courseId}`} className="back-btn" aria-label="Back to course">
          <IoArrowBack size={22} />
        </Link>
        <span className="stack-title">Lesson</span>
      </header>

      <div className="page page-scroll" style={{ paddingBottom: 120, maxWidth: 720 }}>
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: `${course.color}30`, color: course.color, fontSize: 12, fontWeight: 600 }}>{course.title}</span>
          <span className="text-muted">{lesson.duration} min read</span>
        </div>
        <h1 className="h1 fade-in" style={{ lineHeight: 1.3, marginBottom: 24 }}>{lesson.title}</h1>
        <div className="fade-in" style={{ fontSize: 16, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
        <AiTutorPanel courseTitle={course.title} lessonTitle={lesson.title} />
      </div>

      <div className="sticky-footer">
        {completed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, color: '#6ee7b7', fontWeight: 600 }}>
            <IoCheckmarkCircle size={24} />
            Lesson completed
          </div>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, background: course.color, color: '#fff', fontWeight: 700, fontSize: 16 }}
          >
            Mark as Complete
            <IoArrowForward size={20} />
          </button>
        )}
      </div>
    </>
  );
}
