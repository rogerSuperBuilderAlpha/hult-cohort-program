import { IoSchool } from '../utils/icons';

export default function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={`logo ${size}`}>
      <div className="logo-icon">
        <IoSchool size={size === 'sm' ? 28 : 36} color="#fff" />
      </div>
      <div className="logo-title">LearnHub</div>
      {size === 'lg' && <div className="logo-tagline">Learn smarter, every day</div>}
    </div>
  );
}
