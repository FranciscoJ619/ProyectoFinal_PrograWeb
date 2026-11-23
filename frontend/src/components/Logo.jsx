import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="brand" aria-label="Replay Club, inicio">
      <img src="/logo.svg" alt="" />
      <span>Replay Club</span>
    </Link>
  );
}
