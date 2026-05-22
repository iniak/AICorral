interface Props { selected: string | null; setSelected: (id: string | null) => void; pushToast: (msg: string) => void; }
export default function Installed(_props: Props) { return <div className="empty"><p>Installed loading…</p></div>; }
