import { CourseIcon } from '../utils/icons';
import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';
import ProgressBar from '../components/ProgressBar';
import StreakBadge from '../components/StreakBadge';

export default function ProgressPage() {
  const { progress, getCourseProgress } = useProgress();
  const { courses } = useCourses();

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
  const overallProgress = totalLessons > 0
    ? Math.round((progress.completedLessons.length / totalLessons) * 100)
    : 0;

  const stats = [
    { icon: 'star', color: '#fb923c', value: progress.totalXP, label: 'Total XP' },
    { icon: 'book', color: '#a78bfa', value: progress.completedLessons.length, label: 'Lessons' },
    { icon: 'layers', color: '#34d399', value: progress.masteredFlashcards.length, label: 'Flashcards' },
    { icon: 'help-circle', color: '#f9a8d4', value: Object.keys(progress.quizScores).length, label: 'Quizzes' },
  ];

  return (
    <div className="page page-scroll">
      <h1 className="h1 fade-in" style={{ marginBottom: 20 }}>Your Progress</h1>

      <div className="glass fade-in" style={{ borderRadius: 20, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="subtitle" style={{ fontWeight: 600 }}>Overall Progress</span>
          <StreakBadge streak={progress.streak} />
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#c4b5fd', marginBottom: 12 }}>{overallProgress}%</div>
        <ProgressBar progress={overallProgress} height={10} />
        <p className="text-muted" style={{ marginTop: 10 }}>
          {progress.completedLessons.length} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card glass fade-in" style={{ animationDelay: `${150 + i * 60}ms` }}>
            <CourseIcon name={stat.icon} size={28} color={stat.color} />
            <div className="stat-value" style={{ marginTop: 8 }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="h3" style={{ marginBottom: 14 }}>Course Progress</h2>
      {courses.map((course, index) => {
        const courseProgress = getCourseProgress(course.lessons.map((l) => l.id));
        const quizScore = progress.quizScores[course.id];
        return (
          <div key={course.id} className="glass fade-in" style={{ borderRadius: 14, padding: 16, marginBottom: 10, animationDelay: `${450 + index * 70}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${course.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CourseIcon name={course.icon} size={20} color={course.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{course.title}</div>
                <div className="text-muted">
                  {courseProgress}% lessons{quizScore !== undefined ? ` · Quiz: ${quizScore}%` : ''}
                </div>
              </div>
              <span style={{ fontWeight: 700, color: course.color }}>{courseProgress}%</span>
            </div>
            <ProgressBar progress={courseProgress} color={course.color} />
          </div>
        );
      })}
    </div>
  );
}
