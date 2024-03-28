import { ReactNode } from "react"

export default function RightSidebarItem({
  children,
}: {
  children: ReactNode
}) {
  return <div className="right-sidebar-item">{children}</div>
}
