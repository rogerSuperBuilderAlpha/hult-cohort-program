import {
  IoBookOutline,
  IoCalculatorOutline,
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronForward,
  IoCloseCircle,
  IoCodeSlash,
  IoFlaskOutline,
  IoGlobeOutline,
  IoHelpCircle,
  IoHelpCircleOutline,
  IoHome,
  IoHomeOutline,
  IoLayers,
  IoLibrary,
  IoLibraryOutline,
  IoLogOutOutline,
  IoNotificationsOutline,
  IoPerson,
  IoPersonOutline,
  IoRefresh,
  IoRibbon,
  IoSchool,
  IoSettingsOutline,
  IoStar,
  IoStatsChart,
  IoStatsChartOutline,
  IoTrophy,
} from 'react-icons/io5';
import { IconType } from 'react-icons';

const ICON_MAP: Record<string, IconType> = {
  'calculator-outline': IoCalculatorOutline,
  'flask-outline': IoFlaskOutline,
  'code-slash': IoCodeSlash,
  'globe-outline': IoGlobeOutline,
  book: IoBookOutline,
  'help-circle': IoHelpCircle,
  'help-circle-outline': IoHelpCircleOutline,
  layers: IoLayers,
  star: IoStar,
  trophy: IoTrophy,
  ribbon: IoRibbon,
  'notifications-outline': IoNotificationsOutline,
  'settings-outline': IoSettingsOutline,
  'log-out-outline': IoLogOutOutline,
  checkmark: IoCheckmark,
  'checkmark-circle': IoCheckmarkCircle,
  'close-circle': IoCloseCircle,
  'chevron-forward': IoChevronForward,
  refresh: IoRefresh,
  home: IoHome,
  'home-outline': IoHomeOutline,
  library: IoLibrary,
  'library-outline': IoLibraryOutline,
  'stats-chart': IoStatsChart,
  'stats-chart-outline': IoStatsChartOutline,
  person: IoPerson,
  'person-outline': IoPersonOutline,
  school: IoSchool,
};

export function CourseIcon({ name, size = 24, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const Icon = ICON_MAP[name] ?? IoBookOutline;
  return <Icon size={size} color={color} />;
}

export { IoChevronForward, IoCheckmark, IoCheckmarkCircle, IoCloseCircle, IoRefresh, IoStar, IoTrophy, IoRibbon, IoLogOutOutline, IoHelpCircle, IoLayers, IoHome, IoHomeOutline, IoLibrary, IoLibraryOutline, IoStatsChart, IoStatsChartOutline, IoPerson, IoPersonOutline, IoSchool, IoNotificationsOutline, IoSettingsOutline, IoHelpCircleOutline };
