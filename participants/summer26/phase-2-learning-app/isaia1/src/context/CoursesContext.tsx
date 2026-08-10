import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Course } from '../types';
import { courses as mockCourses } from '../data/mockData';
import { fetchCourses } from '../services/coursesService';

interface CoursesContextType {
  courses: Course[];
  loading: boolean;
  getCourseById: (id: string) => Course | undefined;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  return (
    <CoursesContext.Provider value={{ courses, loading, getCourseById }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) throw new Error('useCourses must be used within CoursesProvider');
  return context;
}
