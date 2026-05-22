import type { Route } from '../App';
interface Props { selected: string | null; setSelected: (id: string | null) => void; setRoute: (r: Route) => void; pushToast: (msg: string) => void; }
export default function Dashboard(_props: Props) { return <div className="empty"><p>Dashboard loading…</p></div>; }
