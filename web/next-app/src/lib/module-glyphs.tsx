/**
 * ModuleHeroGlyph — 每个模块专属的咖啡元素 SVG
 * 不只是色点，而是真正的咖啡领域图形（V60 滤杯、浓缩杯、奶泡、分层、证书徽章、杯测勺）。
 * 这些 SVG 用 lucide 不一定能精确表达，所以用 inline SVG 在 Hero 区右上角作为装饰锚点。
 * 所有 path 用 currentColor 让 accent 控制颜色。
 */

import type { ModuleId } from './modules'

interface Props {
  moduleId: ModuleId
  className?: string
}

export function ModuleHeroGlyph({ moduleId, className = 'w-32 h-32' }: Props) {
  switch (moduleId) {
    case 'pourover':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* V60 滤杯：锥形 + 把手 */}
          <path d="M30 22 L70 22 L60 88 L40 88 Z" />
          {/* 滤杯内的咖啡液 */}
          <path d="M34 50 L66 50 L62 84 L38 84 Z" fill="currentColor" opacity="0.15" />
          {/* 滤杯内的滤纸分割线 */}
          <line x1="38" y1="50" x2="62" y2="50" opacity="0.5" />
          {/* 把手 */}
          <path d="M70 36 Q86 36 86 50 Q86 60 75 60" />
          {/* 蒸汽 */}
          <path d="M42 14 Q40 8 44 4" opacity="0.5" />
          <path d="M52 16 Q54 10 50 4" opacity="0.5" />
          {/* 桌面线 */}
          <line x1="20" y1="92" x2="80" y2="92" opacity="0.3" strokeDasharray="2 3" />
        </svg>
      )

    case 'espresso':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 浓缩小杯（demitasse） */}
          <path d="M28 38 L66 38 Q72 38 72 44 Q72 50 66 50 L34 50 Q24 50 24 60 Q24 86 32 86 L62 86 Q70 86 70 60" />
          {/* 把手 */}
          <path d="M70 56 Q86 56 86 68 Q86 78 72 78" />
          {/* 浓缩液（双份） */}
          <rect x="32" y="46" width="34" height="22" fill="currentColor" opacity="0.18" />
          {/* 油脂 crema 圈 */}
          <ellipse cx="49" cy="50" rx="15" ry="2" fill="currentColor" opacity="0.4" />
          {/* 油脂上的心形（拉花） */}
          <path d="M49 48 Q47 46 45 47 Q44 49 49 52 Q54 49 53 47 Q51 46 49 48 Z" fill="currentColor" opacity="0.5" />
          {/* 桌面线 */}
          <line x1="16" y1="92" x2="80" y2="92" opacity="0.3" strokeDasharray="2 3" />
        </svg>
      )

    case 'milk':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 高玻璃杯（latte glass） */}
          <path d="M28 22 L72 22 L66 92 L34 92 Z" />
          {/* 咖啡基底（下半） */}
          <path d="M32 70 L68 70 L66 88 L34 88 Z" fill="currentColor" opacity="0.35" />
          {/* 奶泡（上半 + 拉花） */}
          <path d="M30 50 L70 50 L68 70 L32 70 Z" fill="currentColor" opacity="0.1" />
          {/* 奶泡上的心形拉花 */}
          <path d="M50 56 Q46 50 42 54 Q40 60 50 66 Q60 60 58 54 Q54 50 50 56 Z" fill="currentColor" opacity="0.45" />
          {/* 杯口 */}
          <line x1="28" y1="22" x2="72" y2="22" />
          {/* 蒸汽 */}
          <path d="M40 16 Q38 10 42 6" opacity="0.5" />
          <path d="M52 14 Q54 8 50 4" opacity="0.5" />
          <path d="M62 16 Q60 10 64 6" opacity="0.5" />
        </svg>
      )

    case 'craft':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 高脚分层鸡尾酒杯 */}
          <path d="M40 8 L60 8 L52 42 L52 92 L48 92 L48 42 Z" />
          {/* 杯口 */}
          <line x1="40" y1="8" x2="60" y2="8" />
          {/* 分层液体（从下到上 3 层） */}
          <rect x="48" y="78" width="4" height="14" fill="currentColor" opacity="0.7" />  {/* 底层：浓咖啡 */}
          <rect x="48" y="60" width="4" height="18" fill="currentColor" opacity="0.4" />  {/* 中层：牛奶 */}
          <rect x="48" y="42" width="4" height="18" fill="currentColor" opacity="0.1" />  {/* 顶层：奶泡 */}
          {/* 装饰吸管 */}
          <line x1="55" y1="42" x2="55" y2="6" />
          <line x1="58" y1="46" x2="58" y2="4" />
          {/* 樱桃装饰 */}
          <circle cx="52" cy="40" r="2" fill="currentColor" opacity="0.6" />
        </svg>
      )

    case 'sca':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 证书徽章：八角星 + 内圆 */}
          <path d="M50 8 L58 16 L70 14 L72 26 L82 32 L78 44 L86 54 L76 60 L74 72 L60 70 L50 78 L40 70 L26 72 L24 60 L14 54 L22 44 L18 32 L28 26 L30 14 L42 16 Z" />
          <circle cx="50" cy="44" r="18" />
          {/* Q 大字（Q-Grader） */}
          <text x="50" y="52" textAnchor="middle" fontSize="22" fontFamily="serif" fontWeight="bold" fill="currentColor">Q</text>
          {/* 缎带 */}
          <path d="M34 78 L34 92 L42 86 L50 92 L58 86 L66 92 L66 78" fill="currentColor" opacity="0.2" />
        </svg>
      )

    case 'sensory':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 杯测勺：长勺柄 + 椭圆形勺面 */}
          <line x1="20" y1="80" x2="60" y2="40" strokeWidth="3" />
          <ellipse cx="68" cy="32" rx="14" ry="9" fill="currentColor" opacity="0.25" />
          {/* 勺面内的咖啡液 */}
          <ellipse cx="68" cy="33" rx="11" ry="6" fill="currentColor" opacity="0.5" />
          {/* 4 个杯测杯阵列 */}
          <ellipse cx="22" cy="86" rx="8" ry="3" />
          <ellipse cx="42" cy="86" rx="8" ry="3" />
          <ellipse cx="62" cy="86" rx="8" ry="3" />
          <ellipse cx="82" cy="86" rx="8" ry="3" />
          {/* 杯中液体 */}
          <rect x="14" y="74" width="16" height="12" fill="currentColor" opacity="0.25" />
          <rect x="34" y="74" width="16" height="12" fill="currentColor" opacity="0.25" />
          <rect x="54" y="74" width="16" height="12" fill="currentColor" opacity="0.25" />
          <rect x="74" y="74" width="16" height="12" fill="currentColor" opacity="0.25" />
        </svg>
      )

    default:
      return null
  }
}