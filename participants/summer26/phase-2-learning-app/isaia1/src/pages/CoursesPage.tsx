import { useCourses } from '../context/CoursesContext';
import { useProgress } from '../context/ProgressContext';
import CourseCard from '../components/CourseCard';

export default function CoursesPage() {
  const { courses } = useCourses();
  const { getCourseProgress } = useProgress();

  return (
    <div className="page page-scroll">
      <h1 className="h1 fade-in" style={{ marginBottom: 6 }}>All Courses</h1>
      <p className="subtitle fade-in" style={{ marginBottom: 24 }}>Pick a subject and start learning</p>
      {courses.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={getCourseProgress(course.lessons.map((l) => l.id))}
          to={`/courses/${course.id}`}
          delay={index * 80}
        />
      ))}
    </div>
  );
}
