import { NavLink } from 'react-router-dom';
import {
  IoHome,
  IoHomeOutline,
  IoLibrary,
  IoLibraryOutline,
  IoPerson,
  IoPersonOutline,
  IoStatsChart,
  IoStatsChartOutline,
} from '../utils/icons';

const tabs = [
  { to: '/', label: 'Home', Icon: IoHomeOutline, ActiveIcon: IoHome },
  { to: '/courses', label: 'Courses', Icon: IoLibraryOutline, ActiveIcon: IoLibrary },
  { to: '/progress', label: 'Progress', Icon: IoStatsChartOutline, ActiveIcon: IoStatsChart },
  { to: '/profile', label: 'Profile', Icon: IoPersonOutline, ActiveIcon: IoPerson },
];

export default function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map(({ to, label, Icon, ActiveIcon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          {({ isActive }) => {
            const TabIcon = isActive ? ActiveIcon : Icon;
            return <TabIcon size={isActive ? 26 : 24} />;
          }}
        </NavLink>
      ))}
    </nav>
  );
}
