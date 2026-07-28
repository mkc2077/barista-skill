'use client'

import type { ToolCard } from '@/store'
import { CuppingScoreCard } from './CuppingScoreCard'
import { CvaScoreCard } from './CvaScoreCard'
import { TriangleProtocolCard } from './TriangleProtocolCard'
import { StudyPlanCard } from './StudyPlanCard'

export function ToolCardView({ card }: { card: ToolCard }) {
  switch (card.tool) {
    case 'calculate_cupping_score':
      return <CuppingScoreCard data={card.data as any} />
    case 'calculate_cva_score':
      return <CvaScoreCard data={card.data as any} />
    case 'get_triangle_protocol':
      return <TriangleProtocolCard data={card.data as any} />
    case 'get_qgrader_study_plan':
      return <StudyPlanCard data={card.data as any} />
    default:
      return null
  }
}
