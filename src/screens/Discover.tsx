interface Props { selected: string | null; setSelected: (id: string | null) => void; pushToast: (msg: string) => void; }
export default function Discover(_props: Props) { return <div className="empty"><p>Discover loading…</p></div>; }
