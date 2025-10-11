import { Badge } from "@/components/ui/badge"
import { RequisitionStatus } from "@prisma/client"

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  EDITED: "bg-yellow-100 text-yellow-800",
  ORDERED: "bg-purple-100 text-purple-800",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-800",
  RECEIVED: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-100 text-slate-800",
}

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  EDITED: "Edited",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CLOSED: "Closed",
}

export function StatusBadge({ status }: { status: RequisitionStatus }) {
  return (
    <Badge className={STATUS_STYLES[status]} variant="secondary">
      {STATUS_LABELS[status]}
    </Badge>
  )
}
