import { Link } from 'react-router-dom';
import { IoLibrary, IoTrophy } from '../utils/icons';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';
import CourseCard from '../components/CourseCard';
import StreakBadge from '../components/StreakBadge';

export default function HomePage() {
  const { profile, user } = useAuth();
  const { courses } = useCourses();
  const { progress, getCourseProgress } = useProgress();
  const featuredCourses = courses.slice(0, 3);
  const firstName = profile?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Learner';

  return (
    <div className="page page-scroll">
      <header style={{ paddingBottom: 8 }}>
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 className="h2" style={{ marginBottom: 4 }}>Welcome back, {firstName}! 👋</h1>
            <p className="subtitle">Ready to learn something new?</p>
          </div>
          <StreakBadge streak={progress.streak} />
        </div>

        <div className="stats-row glass fade-in" style={{ animationDelay: '100ms' }}>
          <div className="stat-item">
            <div className="stat-value">{progress.totalXP}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">{progress.completedLessons.length}</div>
            <div className="stat-label">Lessons Done</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">{Object.keys(progress.quizScores).length}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: 24 }}>
        <h2 className="h3 fade-in" style={{ animationDelay: '150ms', marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/progress" className="glass fade-in" style={{ flex: 1, padding: 16, borderRadius: 14, textAlign: 'center', animationDelay: '200ms' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <IoTrophy size={24} color="#34d399" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Progress</span>
          </Link>
          <Link to="/courses" className="glass fade-in" style={{ flex: 1, padding: 16, borderRadius: 14, textAlign: 'center', animationDelay: '280ms' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(251,146,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <IoLibrary size={24} color="#fb923c" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>All Courses</span>
          </Link>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="h3">Continue Learning</h2>
          <Link to="/courses" className="btn-link">See all</Link>
        </div>
        {featuredCourses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            progress={getCourseProgress(course.lessons.map((l) => l.id))}
            to={`/courses/${course.id}`}
            delay={(index + 4) * 80}
          />
        ))}
      </section>
    </div>
  );
}
