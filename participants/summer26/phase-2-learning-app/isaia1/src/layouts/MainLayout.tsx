import { Outlet } from 'react-router-dom';
import AppBackground from '../components/AppBackground';
import TabBar from '../components/TabBar';

export default function MainLayout() {
  return (
    <>
      <AppBackground />
      <Outlet />
      <TabBar />
    </>
  );
}
