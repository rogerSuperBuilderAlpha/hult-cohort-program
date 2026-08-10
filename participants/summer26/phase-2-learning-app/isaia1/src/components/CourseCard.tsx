import { Link } from 'react-router-dom';
import { Course } from '../types';
import { CourseIcon } from '../utils/icons';
import ProgressBar from './ProgressBar';

export default function CourseCard({
  course,
  progress,
  to,
  delay = 0,
}: {
  course: Course;
  progress: number;
  to: string;
  delay?: number;
}) {
  return (
    <Link
      to={to}
      className="course-card glass fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="course-icon" style={{ backgroundColor: `${course.color}30` }}>
        <CourseIcon name={course.icon} size={26} color={course.color} />
      </div>
      <div className="course-card-body">
        <div className="course-card-title">{course.title}</div>
        <div className="course-card-desc">{course.description}</div>
        <div className="course-card-meta">
          <span>{course.lessons.length} lessons</span>
          <span>{progress}%</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <ProgressBar progress={progress} color={course.color} height={6} />
        </div>
      </div>
    </Link>
  );
}
