/**
 * ModuleHeroGlyph \u2014 \u6bcf\u4e2a\u6a21\u5757\u4e13\u5c5e\u7684\u5496\u5561\u5143\u7d20 SVG\uff08\u5c0f\u56fe\u6807 / Hero \u53f3\u4e0a\u89d2\uff09
 * ModuleHeroIllustration \u2014 \u6bcf\u4e2a\u6a21\u5757\u7684\u5370\u8c61\u6d3e\u5927\u80cc\u666f\u63d2\u753b\uff08Hero \u4e2d\u592e\uff0c\u4f7f\u7528 SVG turbulence \u8fc7\u6ee4\u5668\u5236\u9020\u7b14\u89e9\u611f\uff09
 *
 * \u6240\u6709 path \u7528 currentColor\uff0c\u7531 hero-bath \u63a7\u5236\u989c\u8272\u3002
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
          <path d="M30 22 L70 22 L60 88 L40 88 Z" />
          <path d="M34 50 L66 50 L62 84 L38 84 Z" fill="currentColor" opacity="0.15" />
          <line x1="38" y1="50" x2="62" y2="50" opacity="0.5" />
          <path d="M70 36 Q86 36 86 50 Q86 60 75 60" />
          <path d="M42 14 Q40 8 44 4" opacity="0.5" />
          <path d="M52 16 Q54 10 50 4" opacity="0.5" />
          <line x1="20" y1="92" x2="80" y2="92" opacity="0.3" strokeDasharray="2 3" />
        </svg>
      )
    case 'espresso':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 38 L66 38 Q72 38 72 44 Q72 50 66 50 L34 50 Q24 50 24 60 Q24 86 32 86 L62 86 Q70 86 70 60" />
          <line x1="28" y1="46" x2="66" y2="46" opacity="0.4" />
          <path d="M76 44 Q82 44 82 50" opacity="0.5" />
        </svg>
      )
    case 'milk':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 32 L72 32 L70 88 L30 88 Z" />
          <path d="M38 56 Q48 42 58 56 Q68 70 78 56" strokeWidth="1.2" />
          <path d="M40 66 Q50 54 60 66" strokeWidth="1.2" opacity="0.6" />
        </svg>
      )
    case 'craft':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 82 L28 36 L72 36 L72 82 Z" />
          <line x1="28" y1="50" x2="72" y2="50" opacity="0.4" />
          <line x1="28" y1="64" x2="72" y2="64" opacity="0.4" />
          <path d="M30 38 L70 38" opacity="0.3" />
        </svg>
      )
    case 'sca':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="40" r="20" />
          <circle cx="50" cy="40" r="12" opacity="0.6" />
          <path d="M30 60 L50 78 L70 60" opacity="0.5" />
        </svg>
      )
    case 'sensory':
      return (
        <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="30" cy="70" r="8" />
          <circle cx="50" cy="70" r="8" />
          <circle cx="70" cy="70" r="8" />
          <line x1="30" y1="62" x2="70" y2="62" opacity="0.4" />
          <path d="M28 70 L72 70" opacity="0.3" />
          <path d="M50 30 L66 50 L34 50 Z" opacity="0.4" />
        </svg>
      )
  }
}


/**
 * ModuleHeroIllustration \u2014 \u5370\u8c61\u6d3e\u98ce\u683c\u5927\u80cc\u666f\u63d2\u753b
 * \u4f7f\u7528 SVG turbulence + displacementMap filter \u5236\u9020\u6a21\u7cca\u753b\u7b14\u89e3\u611f\uff0c\n * \u770b\u4f3c CONACH \u8c46\u5361\u4e2d\u7684\u6cb9\u753b/\u5370\u8c61\u6d3e\u80cc\u666f\u3002\u4f7f\u7528 currentColor\n * \u753b\u7b14\uff0c\u7531 .hero-bath --hue \u63a7\u5236\u989c\u8272\u3002\n */
export function ModuleHeroIllustration({ moduleId, className = 'w-full h-full' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio='xMidYMid slice'
      aria-hidden='true'
      style={{ filter: 'url(#conach-turb)' }}
    >
      <defs>
        <filter id='conach-turb' x='0%' y='0%' width='100%' height='100%'>
          <feTurbulence type='fractalNoise' baseFrequency='0.012 0.018' numOctaves='3' seed={2} />
          <feDisplacementMap in='SourceGraphic' scale={28} />
        </filter>
        <radialGradient id='haze' cx='50%' cy='40%' r='65%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.45' />
          <stop offset='60%' stopColor='currentColor' stopOpacity='0.18' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <linearGradient id='fog' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='rgba(255,255,255,0.05)' />
          <stop offset='100%' stopColor='rgba(0,0,0,0.25)' />
        </linearGradient>
      </defs>
      <rect width='800' height='600' fill='url(#haze)' />
      <ellipse cx='280' cy='250' rx='260' ry='140' fill='currentColor' opacity='0.12' />
      <ellipse cx='560' cy='380' rx='320' ry='170' fill='currentColor' opacity='0.10' />
      <rect y='420' width='800' height='180' fill='url(#fog)' />
      {moduleId === 'pourover' && (
        <>
          <circle cx='400' cy='300' r='130' fill='none' stroke='currentColor' strokeOpacity='0.20' strokeWidth='2' />
          <circle cx='400' cy='300' r='80' fill='none' stroke='currentColor' strokeOpacity='0.15' strokeWidth='1.5' />
          <line x1='400' y1='150' x2='400' y2='180' stroke='currentColor' strokeOpacity='0.3' strokeWidth='2' />
          <line x1='540' y1='250' x2='510' y2='265' stroke='currentColor' strokeOpacity='0.3' strokeWidth='2' />
          <line x1='260' y1='250' x2='290' y2='265' stroke='currentColor' strokeOpacity='0.3' strokeWidth='2' />
        </>
      )}
      {moduleId === 'espresso' && (
        <>
          <circle cx='400' cy='320' r='150' fill='none' stroke='currentColor' strokeOpacity='0.15' strokeWidth='2' />
          <circle cx='400' cy='320' r='110' fill='none' stroke='currentColor' strokeOpacity='0.18' strokeWidth='1.5' />
          <circle cx='400' cy='320' r='70' fill='currentColor' fillOpacity='0.20' />
        </>
      )}
      {moduleId === 'milk' && (
        <>
          <ellipse cx='400' cy='320' rx='180' ry='120' fill='currentColor' fillOpacity='0.18' />
          <path d='M 280 320 Q 400 220 520 320' fill='none' stroke='currentColor' strokeOpacity='0.4' strokeWidth='3' />
          <path d='M 320 320 Q 400 260 480 320' fill='none' stroke='currentColor' strokeOpacity='0.5' strokeWidth='2' />
        </>
      )}
      {moduleId === 'craft' && (
        <>
          <rect x='320' y='180' width='160' height='280' fill='none' stroke='currentColor' strokeOpacity='0.2' strokeWidth='2' />
          <line x1='320' y1='250' x2='480' y2='250' stroke='currentColor' strokeOpacity='0.4' strokeWidth='1.5' />
          <line x1='320' y1='320' x2='480' y2='320' stroke='currentColor' strokeOpacity='0.4' strokeWidth='1.5' />
          <line x1='320' y1='390' x2='480' y2='390' stroke='currentColor' strokeOpacity='0.4' strokeWidth='1.5' />
        </>
      )}
      {moduleId === 'sca' && (
        <>
          <circle cx='400' cy='300' r='150' fill='none' stroke='currentColor' strokeOpacity='0.18' strokeWidth='3' />
          <circle cx='400' cy='300' r='110' fill='none' stroke='currentColor' strokeOpacity='0.22' strokeWidth='2' />
          <circle cx='400' cy='300' r='70' fill='none' stroke='currentColor' strokeOpacity='0.30' strokeWidth='1.5' />
        </>
      )}
      {moduleId === 'sensory' && (
        <>
          <circle cx='300' cy='380' r='50' fill='none' stroke='currentColor' strokeOpacity='0.25' strokeWidth='2' />
          <circle cx='420' cy='380' r='50' fill='none' stroke='currentColor' strokeOpacity='0.25' strokeWidth='2' />
          <circle cx='540' cy='380' r='50' fill='none' stroke='currentColor' strokeOpacity='0.25' strokeWidth='2' />
        </>
      )}
    </svg>
  )
}
