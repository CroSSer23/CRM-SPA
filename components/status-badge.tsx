import { RequisitionStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types"

interface StatusBadgeProps {
  status: RequisitionStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
}

