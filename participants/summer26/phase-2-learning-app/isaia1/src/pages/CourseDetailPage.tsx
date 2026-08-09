import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { CourseIcon, IoCheckmark, IoChevronForward, IoHelpCircle, IoLayers } from '../utils/icons';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';
import ProgressBar from '../components/ProgressBar';

export default function CourseDetailPage() {
  const { courseId = '' } = useParams();
  const { getCourseById } = useCourses();
  const course = getCourseById(courseId);
  const { isLessonComplete, getCourseProgress, progress } = useProgress();

  if (!course) {
    return (
      <div className="page">
        <p style={{ textAlign: 'center', marginTop: 40 }}>Course not found</p>
      </div>
    );
  }

  const courseProgress = getCourseProgress(course.lessons.map((l) => l.id));
  const quizScore = progress.quizScores[course.id];

  return (
    <>
      <header className="stack-header">
        <Link to="/courses" className="back-btn" aria-label="Back to courses">
          <IoArrowBack size={22} />
        </Link>
        <span className="stack-title">Course</span>
      </header>
      <div className="page page-scroll" style={{ paddingTop: 8, paddingBottom: 40 }}>
      <div className="glass fade-in" style={{ marginBottom: 8, padding: 24, borderRadius: 24, borderColor: `${course.color}60` }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CourseIcon name={course.icon} size={40} color="#fff" />
        </div>
        <h1 className="h1" style={{ marginBottom: 8 }}>{course.title}</h1>
        <p className="subtitle" style={{ lineHeight: 1.5, marginBottom: 20 }}>{course.description}</p>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="subtitle">Course Progress</span>
            <span style={{ fontWeight: 700 }}>{courseProgress}%</span>
          </div>
          <ProgressBar progress={courseProgress} />
        </div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h3" style={{ marginBottom: 14 }}>Lessons</h2>
        {course.lessons.map((lesson, index) => {
          const complete = isLessonComplete(lesson.id);
          return (
            <Link key={lesson.id} to={`/courses/${courseId}/lessons/${lesson.id}`} className="list-item glass fade-in" style={{ animationDelay: `${150 + index * 60}ms` }}>
              <div className={`lesson-num${complete ? ' done' : ''}`}>
                {complete ? <IoCheckmark size={18} color="#6ee7b7" /> : index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                <div className="text-muted">{lesson.duration} min</div>
              </div>
              <IoChevronForward size={20} color="rgba(255,255,255,0.55)" />
            </Link>
          );
        })}
      </section>

      <section>
        <h2 className="h3" style={{ marginBottom: 14 }}>Practice</h2>
        <Link to={`/courses/${courseId}/quiz`} className="list-item glass fade-in" style={{ padding: 16, borderRadius: 14, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IoHelpCircle size={28} color="#a78bfa" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Take Quiz</div>
            <div className="subtitle">
              {course.quizzes.length} questions{quizScore !== undefined ? ` · Best: ${quizScore}%` : ''}
            </div>
          </div>
          <IoChevronForward size={20} color="rgba(255,255,255,0.55)" />
        </Link>
        <Link to={`/courses/${courseId}/flashcards`} className="list-item glass fade-in" style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IoLayers size={28} color="#fb923c" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>Flashcards</div>
            <div className="subtitle">{course.flashcards.length} cards to review</div>
          </div>
          <IoChevronForward size={20} color="rgba(255,255,255,0.55)" />
        </Link>
      </section>
      </div>
    </>
  );
}
