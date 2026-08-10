import { courses } from '../data/mockData';

export function fetchCourses() {
  return Promise.resolve(courses);
}
