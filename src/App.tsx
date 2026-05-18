import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import './App.css'

type ControlId = 'collect' | 'sort' | 'steam'
type DemoPhase =
  | 'idle'
  | 'voice-command'
  | 'scanning'
  | 'collecting'
  | 'bucket-full'
  | 'rotating'
  | 'classifying'
  | 'steaming'
  | 'voice-report'
  | 'warning'
  | 'summary'
type IconName =
  | 'air'
  | 'arrow-up'
  | 'battery'
  | 'bluetooth'
  | 'chart'
  | 'check'
  | 'dot'
  | 'grid'
  | 'history'
  | 'menu'
  | 'mic'
  | 'play'
  | 'radar'
  | 'shuttle'
  | 'sliders'
  | 'spark'
  | 'sync'
  | 'target'
  | 'thermometer'
  | 'warning'
  | 'water'
  | 'wifi'

type IconProps = {
  name: IconName
  className?: string
}

const DEMO_TOTAL = 42
const DEMO_GOOD_TARGET = 38
const DEMO_BAD_TARGET = 4
const DEMO_BUCKET_LIMIT = 10
const BAD_BALL_NUMBERS = new Set([8, 17, 29, 39])

const controlItems: Array<{
  id: ControlId
  icon: IconName
  label: [string, string]
  className: string
  status: string
}> = [
  {
    id: 'collect',
    icon: 'play',
    label: ['自动', '拾球'],
    className: 'control--collect',
    status: '自动拾球中',
  },
  {
    id: 'sort',
    icon: 'target',
    label: ['AI', '筛球'],
    className: 'control--sort',
    status: 'AI筛球中',
  },
  {
    id: 'steam',
    icon: 'air',
    label: ['自动', '蒸球'],
    className: 'control--steam',
    status: '蒸球保养中',
  },
]

const cageSlots = [
  { angle: 0, className: 'slot--top slot--active', icon: 'shuttle' as const },
  {
    angle: 60,
    className: 'slot--upper-right slot--transition',
    icon: 'history' as const,
  },
  {
    angle: 120,
    className: 'slot--lower-right slot--active',
    icon: 'shuttle' as const,
  },
  {
    angle: 180,
    className: 'slot--bottom slot--active',
    icon: 'shuttle' as const,
  },
  {
    angle: 240,
    className: 'slot--lower-left slot--empty',
    icon: 'dot' as const,
  },
  {
    angle: 300,
    className: 'slot--upper-left slot--empty',
    icon: 'dot' as const,
  },
]

const phaseControlByPhase: Partial<Record<DemoPhase, ControlId>> = {
  'voice-command': 'collect',
  scanning: 'collect',
  collecting: 'collect',
  'bucket-full': 'collect',
  rotating: 'collect',
  classifying: 'sort',
  steaming: 'steam',
  'voice-report': 'steam',
  warning: 'steam',
  summary: 'sort',
}

const phaseOrder: Record<DemoPhase, number> = {
  idle: -1,
  'voice-command': 0,
  scanning: 1,
  collecting: 2,
  'bucket-full': 3,
  rotating: 3,
  classifying: 4,
  steaming: 5,
  'voice-report': 6,
  warning: 7,
  summary: 8,
}

const timelineItems: Array<{
  label: string
  icon: IconName
  order: number
}> = [
  { label: '语音启动', icon: 'mic', order: 0 },
  { label: '路径寻球', icon: 'radar', order: 1 },
  { label: '自动拾球', icon: 'play', order: 2 },
  { label: '满仓换仓', icon: 'sync', order: 3 },
  { label: 'AI筛球', icon: 'target', order: 4 },
  { label: '自动蒸球', icon: 'air', order: 5 },
  { label: '语音播报', icon: 'mic', order: 6 },
  { label: '异常保护', icon: 'warning', order: 7 },
  { label: '数据总结', icon: 'check', order: 8 },
]

const badIssueLabels = ['毛片破损', '球头变形', '重量异常', '飞行不稳']

function countBadBalls(step: number) {
  return Array.from(BAD_BALL_NUMBERS).filter((ballNumber) => ballNumber <= step)
    .length
}

function hasReachedPhase(currentPhase: DemoPhase, targetPhase: DemoPhase) {
  return phaseOrder[currentPhase] >= phaseOrder[targetPhase]
}

function Icon({ name, className }: IconProps) {
  const baseProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  }

  switch (name) {
    case 'air':
      return (
        <svg {...baseProps}>
          <path d="M4 8h10.2a2.8 2.8 0 1 0-2.5-4" />
          <path d="M4 13h14.2a3.2 3.2 0 1 1-2.8 4.8" />
          <path d="M4 18h7" />
        </svg>
      )
    case 'arrow-up':
      return (
        <svg {...baseProps}>
          <path d="M12 19V5" />
          <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
        </svg>
      )
    case 'battery':
      return (
        <svg {...baseProps}>
          <rect x="5" y="6" width="12" height="12" rx="2" />
          <path d="M18 10v4" />
          <path d="m11 8-2 4h3l-1 4 4-6h-3l1-2z" />
        </svg>
      )
    case 'bluetooth':
      return (
        <svg {...baseProps}>
          <path d="m8 7 8 5-8 5V3l8 5-8 5" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...baseProps}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 4-7" />
          <path d="M8 19v-3" />
          <path d="M13 19v-5" />
          <path d="M18 19v-9" />
        </svg>
      )
    case 'check':
      return (
        <svg {...baseProps}>
          <path d="m5 12.5 4.3 4.3L19 7" />
        </svg>
      )
    case 'dot':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      )
    case 'grid':
      return (
        <svg {...baseProps}>
          <rect x="4" y="4" width="6.5" height="6.5" />
          <rect x="13.5" y="4" width="6.5" height="6.5" />
          <rect x="4" y="13.5" width="6.5" height="6.5" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" />
        </svg>
      )
    case 'history':
      return (
        <svg {...baseProps}>
          <path d="M7 8H3V4" />
          <path d="M4.5 8a8 8 0 1 1 1 9.5" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...baseProps}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...baseProps}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
          <path d="M9 21h6" />
        </svg>
      )
    case 'play':
      return (
        <svg {...baseProps}>
          <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'radar':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 12 18 6" />
          <path d="M12 4v2" />
          <path d="M20 12h-2" />
          <path d="M12 20v-2" />
          <path d="M4 12h2" />
        </svg>
      )
    case 'shuttle':
      return (
        <svg {...baseProps}>
          <circle cx="7.5" cy="16.5" r="2.5" />
          <path d="M9.4 14.6 18 6" />
          <path d="M12.5 8.5h5.8v5.8" />
          <path d="M10.8 11.1h4.5v4.5" />
        </svg>
      )
    case 'sliders':
      return (
        <svg {...baseProps}>
          <path d="M5 4v16" />
          <path d="M12 4v16" />
          <path d="M19 4v16" />
          <path d="M3 8h4" />
          <path d="M10 15h4" />
          <path d="M17 11h4" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...baseProps}>
          <path d="M12 3 14 9.5 20 12l-6 2.5L12 21l-2-6.5L4 12l6-2.5z" />
        </svg>
      )
    case 'sync':
      return (
        <svg {...baseProps}>
          <path d="M7 7.5A7 7 0 0 1 18.1 9" />
          <path d="M18 4.5V9h-4.5" />
          <path d="M17 16.5A7 7 0 0 1 5.9 15" />
          <path d="M6 19.5V15h4.5" />
        </svg>
      )
    case 'target':
      return (
        <svg {...baseProps}>
          <path d="M12 21v-5.5" />
          <path d="M12 4a7 7 0 0 0-7 7c0 2.6 1.4 4.9 3.5 6.1" />
          <path d="M12 4a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.1" />
          <circle cx="12" cy="11" r="2.5" />
          <path d="M7 11h2.5" />
          <path d="M14.5 11H17" />
          <path d="M12 6v2.5" />
        </svg>
      )
    case 'thermometer':
      return (
        <svg {...baseProps}>
          <path d="M14 14.7V5a2 2 0 0 0-4 0v9.7a4 4 0 1 0 4 0z" />
          <path d="M12 7v7" />
        </svg>
      )
    case 'warning':
      return (
        <svg {...baseProps}>
          <path d="M12 3 2.7 20h18.6z" fill="currentColor" stroke="none" />
          <path d="M12 8.5v5" stroke="#0b1326" strokeWidth="2" />
          <path d="M12 17h.01" stroke="#0b1326" strokeWidth="3" />
        </svg>
      )
    case 'water':
      return (
        <svg {...baseProps}>
          <path d="M12 3S6.5 9.4 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.4 12 3 12 3z" />
          <path d="M9.5 14.5a2.7 2.7 0 0 0 2.7 2.7" />
        </svg>
      )
    case 'wifi':
      return (
        <svg {...baseProps}>
          <path d="M5 9.2a10.8 10.8 0 0 1 14 0" />
          <path d="M8 12.4a6.2 6.2 0 0 1 8 0" />
          <path d="M11.2 15.5a1.5 1.5 0 0 1 1.6 0" />
        </svg>
      )
  }
}

function App() {
  const [activeControl, setActiveControl] = useState<ControlId>('collect')
  const [emergency, setEmergency] = useState(false)
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle')
  const [demoStep, setDemoStep] = useState(0)
  const [wheelTurns, setWheelTurns] = useState(0)
  const [hasRotated, setHasRotated] = useState(false)

  const isDemoActive = demoPhase !== 'idle'
  const isDemoRunning = isDemoActive && demoPhase !== 'summary'
  const displayActiveControl =
    phaseControlByPhase[demoPhase] ?? activeControl
  const demoBadCount = isDemoActive ? countBadBalls(demoStep) : 4
  const demoGoodCount = isDemoActive
    ? Math.max(0, demoStep - demoBadCount)
    : 38
  const demoTotalCount = isDemoActive ? demoStep : 42
  const currentBucketFillCount = isDemoActive
    ? Math.min(
        hasRotated
          ? Math.max(demoStep - DEMO_BUCKET_LIMIT, 0)
          : demoStep,
        DEMO_BUCKET_LIMIT,
      )
    : 0
  const wheelRotation = wheelTurns * 60
  const goodRatio =
    demoTotalCount === 0 ? 0 : (demoGoodCount / demoTotalCount) * 100
  const currentBucketLabel = hasRotated ? '2号仓' : '1号仓'
  const currentPhaseOrder = phaseOrder[demoPhase]
  const pathProgress = isDemoActive
    ? Math.min(100, Math.round((demoTotalCount / DEMO_TOTAL) * 100))
    : 100
  const steamProgress = hasReachedPhase(demoPhase, 'steaming')
    ? demoPhase === 'steaming'
      ? 68
      : 100
    : 0
  const voiceProgress = hasReachedPhase(demoPhase, 'voice-report')
    ? 100
    : hasReachedPhase(demoPhase, 'voice-command')
      ? 45
      : 0
  const humidityValue = hasReachedPhase(demoPhase, 'steaming') ? 65 : 55
  const lowWaterWarning = demoPhase === 'warning' || emergency

  useEffect(() => {
    if (emergency) {
      return undefined
    }

    if (demoPhase === 'voice-command') {
      const timer = window.setTimeout(() => setDemoPhase('scanning'), 900)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'scanning') {
      const timer = window.setTimeout(() => setDemoPhase('collecting'), 1400)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'collecting') {
      if (demoStep === DEMO_BUCKET_LIMIT && !hasRotated) {
        const timer = window.setTimeout(() => setDemoPhase('bucket-full'), 520)

        return () => window.clearTimeout(timer)
      }

      if (demoStep < DEMO_TOTAL) {
        const timer = window.setTimeout(
          () => setDemoStep((step) => Math.min(step + 1, DEMO_TOTAL)),
          demoStep < DEMO_BUCKET_LIMIT ? 260 : 92,
        )

        return () => window.clearTimeout(timer)
      }

      const timer = window.setTimeout(() => setDemoPhase('classifying'), 700)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'bucket-full') {
      const timer = window.setTimeout(() => {
        setWheelTurns((turns) => turns + 1)
        setDemoPhase('rotating')
      }, 820)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'rotating') {
      const timer = window.setTimeout(() => {
        setHasRotated(true)
        setDemoPhase('collecting')
      }, 1050)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'classifying') {
      const timer = window.setTimeout(() => setDemoPhase('steaming'), 1300)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'steaming') {
      const timer = window.setTimeout(() => setDemoPhase('voice-report'), 2400)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'voice-report') {
      const timer = window.setTimeout(() => setDemoPhase('warning'), 2200)

      return () => window.clearTimeout(timer)
    }

    if (demoPhase === 'warning') {
      const timer = window.setTimeout(() => setDemoPhase('summary'), 2200)

      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [demoPhase, demoStep, emergency, hasRotated])

  const currentStatus = useMemo(() => {
    if (emergency) {
      return '急停保护'
    }

    if (demoPhase === 'voice-command') {
      return '语音唤醒'
    }

    if (demoPhase === 'scanning') {
      return '路径扫描中'
    }

    if (demoPhase === 'collecting') {
      return `拾取中 ${demoStep}/${DEMO_TOTAL}`
    }

    if (demoPhase === 'bucket-full') {
      return '1号仓已满'
    }

    if (demoPhase === 'rotating') {
      return '轮盘换仓中'
    }

    if (demoPhase === 'classifying') {
      return 'AI复核完成'
    }

    if (demoPhase === 'steaming') {
      return '蒸球保养中'
    }

    if (demoPhase === 'voice-report') {
      return '语音播报中'
    }

    if (demoPhase === 'warning') {
      return '缺水保护'
    }

    if (demoPhase === 'summary') {
      return '2号仓就绪'
    }

    return '4号仓运行'
  }, [demoPhase, demoStep, emergency])

  const demoStatus = useMemo(() => {
    if (demoPhase === 'idle') {
      return '播放一次完整演示流程'
    }

    if (demoPhase === 'voice-command') {
      return '语音指令：开始拾球'
    }

    if (demoPhase === 'scanning') {
      return '路径规划锁定 42 颗散落球'
    }

    if (demoPhase === 'collecting') {
      return `自动拾球 ${demoTotalCount}/${DEMO_TOTAL}`
    }

    if (demoPhase === 'bucket-full') {
      return `当前 ${currentBucketLabel} ${DEMO_BUCKET_LIMIT}/${DEMO_BUCKET_LIMIT}`
    }

    if (demoPhase === 'rotating') {
      return '球桶轮盘正在切换仓位'
    }

    if (demoPhase === 'classifying') {
      return 'AI筛选完成，异常球单独收纳'
    }

    if (demoPhase === 'steaming') {
      return '温湿度联动，自动蒸球中'
    }

    if (demoPhase === 'voice-report') {
      return '语音播报本轮训练结果'
    }

    if (demoPhase === 'warning') {
      return '缺水警告触发，设备进入保护'
    }

    return '演示完成，数据已同步'
  }, [currentBucketLabel, demoPhase, demoTotalCount])

  const phaseNarration = useMemo(() => {
    if (demoPhase === 'idle') {
      return {
        title: '一键演示全流程',
        detail: '语音启动、路径寻球、拾球筛选、换仓、蒸球、播报与保护',
        icon: 'spark' as const,
      }
    }

    if (demoPhase === 'voice-command') {
      return {
        title: '收到语音指令',
        detail: '系统进入自动拾球任务，连接状态与电量同步检查',
        icon: 'mic' as const,
      }
    }

    if (demoPhase === 'scanning') {
      return {
        title: '扫描训练场地',
        detail: '视觉识别散落球位，并生成最短拾取路径',
        icon: 'radar' as const,
      }
    }

    if (demoPhase === 'collecting') {
      return {
        title: '自动拾球与实时计数',
        detail: `当前已收集 ${demoTotalCount} 颗，目标效率 50-120 颗/分钟`,
        icon: 'play' as const,
      }
    }

    if (demoPhase === 'bucket-full' || demoPhase === 'rotating') {
      return {
        title: '球仓满载自动换仓',
        detail: '光电计数触发轮盘机构，切换备用球仓继续作业',
        icon: 'sync' as const,
      }
    }

    if (demoPhase === 'classifying') {
      return {
        title: 'AI好坏球筛选',
        detail: '识别毛片破损、球头变形与重量异常，坏球独立收纳',
        icon: 'target' as const,
      }
    }

    if (demoPhase === 'steaming') {
      return {
        title: '自动蒸球保养',
        detail: `湿度 ${humidityValue}%RH，温湿度闭环控制保护球材`,
        icon: 'air' as const,
      }
    }

    if (demoPhase === 'voice-report') {
      return {
        title: '语音播报训练结果',
        detail: `本轮拾球 ${DEMO_TOTAL} 颗，好球 ${DEMO_GOOD_TARGET} 颗，坏球 ${DEMO_BAD_TARGET} 颗`,
        icon: 'mic' as const,
      }
    }

    if (demoPhase === 'warning') {
      return {
        title: '异常保护与提醒',
        detail: '缺水警告已播报，蒸球模块自动暂停等待补水',
        icon: 'warning' as const,
      }
    }

    return {
      title: '整轮演示完成',
      detail: '设备在线、数据同步、2号仓就绪，可进入下一轮训练',
      icon: 'check' as const,
    }
  }, [demoPhase, demoTotalCount, humidityValue])

  const activeControlText =
    controlItems.find((item) => item.id === displayActiveControl)?.status ??
    '待机'

  const activeDemoBall =
    demoPhase === 'collecting' &&
    demoStep < DEMO_TOTAL &&
    !(demoStep === DEMO_BUCKET_LIMIT && !hasRotated)
      ? {
          key: `${demoStep}-${hasRotated ? 'b' : 'a'}`,
          number: demoStep + 1,
          type: BAD_BALL_NUMBERS.has(demoStep + 1) ? 'bad' : 'good',
        }
      : null

  const recognitionLabel = activeDemoBall
    ? activeDemoBall.type === 'bad'
      ? badIssueLabels[demoBadCount % badIssueLabels.length]
      : '好球入仓'
    : demoPhase === 'classifying'
      ? 'AI筛选完成'
      : '等待识别'

  const telemetryItems = [
    {
      icon: 'radar' as const,
      label: '路径规划',
      value: `${pathProgress}%`,
      progress: pathProgress,
      tone: 'green',
    },
    {
      icon: 'thermometer' as const,
      label: '蒸球湿度',
      value: `${humidityValue}%RH`,
      progress: steamProgress,
      tone: 'cyan',
    },
    {
      icon: 'mic' as const,
      label: '语音交互',
      value: voiceProgress === 100 ? '已播报' : '待播报',
      progress: voiceProgress,
      tone: 'blue',
    },
  ]

  const startDemo = () => {
    setEmergency(false)
    setActiveControl('collect')
    setDemoStep(0)
    setWheelTurns(0)
    setHasRotated(false)
    setDemoPhase('voice-command')
  }

  const stopDemoForManualControl = (controlId: ControlId) => {
    setEmergency(false)
    setDemoPhase('idle')
    setDemoStep(0)
    setWheelTurns(0)
    setHasRotated(false)
    setActiveControl(controlId)
  }

  return (
    <div className="dashboard-root">
      <header className="top-app-bar">
        <button className="icon-button" type="button" aria-label="打开菜单">
          <Icon name="menu" />
        </button>
        <h1>羽毛球捡球机</h1>
        <button className="icon-button" type="button" aria-label="电量状态">
          <Icon name="battery" />
        </button>
      </header>

      <main className="dashboard-main" aria-label="羽毛球捡球机控制台">
        <section className="mobile-status" aria-label="连接与告警状态">
          <div className="signal-group" aria-label="连接正常">
            <Icon name="wifi" />
            <Icon name="bluetooth" />
          </div>
          <div
            className={`warning-pill ${lowWaterWarning ? 'is-alerting' : ''}`}
          >
            <Icon name="water" />
            <span>{lowWaterWarning ? '缺水警告' : '水位正常'}</span>
          </div>
        </section>

        <section className="control-grid" aria-label="主控制">
          {controlItems.map((item) => (
            <button
              className={`control-button ${item.className} ${
                displayActiveControl === item.id ? 'is-active' : ''
              }`}
              type="button"
              key={item.id}
              aria-pressed={displayActiveControl === item.id}
              onClick={() => stopDemoForManualControl(item.id)}
            >
              <Icon name={item.icon} className="control-icon" />
              <span className="control-label">
                <span>{item.label[0]}</span>
                <span>{item.label[1]}</span>
              </span>
            </button>
          ))}
        </section>

        <section className="demo-strip" aria-label="演示动画控制">
          <button
            className="demo-play-button"
            type="button"
            onClick={startDemo}
            disabled={isDemoRunning}
          >
            <Icon name={isDemoRunning ? 'sync' : 'play'} />
            <span>
              {isDemoRunning
                ? '演示中'
                : demoPhase === 'summary'
                  ? '重播演示'
                  : '播放演示'}
            </span>
          </button>
          <div className="demo-readout">
            <strong>{demoStatus}</strong>
            <span>
              好球 {demoGoodCount}/{DEMO_GOOD_TARGET} · 坏球 {demoBadCount}/
              {DEMO_BAD_TARGET} · 当前仓 {currentBucketFillCount}/
              {DEMO_BUCKET_LIMIT}
            </span>
          </div>
        </section>

        <button
          className={`emergency-fab ${emergency ? 'is-active' : ''}`}
          type="button"
          aria-pressed={emergency}
          onClick={() => {
            const nextEmergency = !emergency
            setEmergency(nextEmergency)
            if (nextEmergency) {
              setDemoPhase('idle')
              setDemoStep(0)
              setHasRotated(false)
            }
          }}
        >
          <Icon name="warning" />
          <span>紧急停止</span>
        </button>

        <section className="workflow-panel" aria-label="演示流程">
          <div className="phase-narration">
            <div className="phase-icon">
              <Icon name={phaseNarration.icon} />
            </div>
            <div className="phase-copy">
              <strong>{phaseNarration.title}</strong>
              <span>{phaseNarration.detail}</span>
            </div>
            <div className="voice-wave" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="timeline-rail" aria-label="当前演示阶段">
            {timelineItems.map((item) => {
              const isCurrent = item.order === currentPhaseOrder
              const isDone = item.order < currentPhaseOrder

              return (
                <div
                  className={`timeline-step ${isCurrent ? 'is-current' : ''} ${
                    isDone ? 'is-done' : ''
                  }`}
                  key={item.label}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel cage-panel" aria-labelledby="cage-title">
          <div className="panel-title-row">
            <h2 id="cage-title">球笼状态 // 分拣仓</h2>
            <span>{currentStatus}</span>
          </div>

          <div className="cage-visual" aria-label={`当前状态：${activeControlText}`}>
            <div
              className={`scan-sweep ${
                demoPhase === 'scanning' ? 'is-scanning' : ''
              }`}
              aria-hidden="true"
            />
            <div className="cage-ring cage-ring--near" />
            <div className="cage-ring cage-ring--far" />
            <div
              className={`recognition-tag ${
                activeDemoBall?.type === 'bad' || demoPhase === 'warning'
                  ? 'is-bad'
                  : ''
              } ${demoPhase === 'classifying' ? 'is-complete' : ''}`}
            >
              <Icon
                name={
                  demoPhase === 'warning'
                    ? 'warning'
                    : activeDemoBall?.type === 'bad'
                      ? 'target'
                      : 'check'
                }
              />
              <span>{recognitionLabel}</span>
            </div>
            {activeDemoBall ? (
              <div
                className={`flying-shuttle flying-shuttle--${activeDemoBall.type}`}
                key={activeDemoBall.key}
              >
                <Icon name="shuttle" />
              </div>
            ) : null}
            <div
              className={`steam-cloud ${
                demoPhase === 'steaming' ? 'is-steaming' : ''
              }`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
            <div
              className={`wheel-rotor ${
                demoPhase === 'rotating' ? 'is-rotating' : ''
              }`}
            >
              {cageSlots.map((slot) => {
                const isFillingSlot = slot.className.includes('slot--top')
                const slotAngle = slot.angle + wheelRotation
                const slotStyle = {
                  '--slot-angle': `${slotAngle}deg`,
                  '--slot-counter-angle': `${-slotAngle}deg`,
                } as CSSProperties

                return (
                  <div
                    className={`cage-slot ${slot.className} ${
                      isFillingSlot && isDemoActive ? 'slot--filling' : ''
                    }`}
                    key={slot.className}
                    style={slotStyle}
                  >
                    <Icon name={slot.icon} />
                    {isFillingSlot && isDemoActive ? (
                      <span className="slot-fill" aria-hidden="true">
                        {Array.from({ length: DEMO_BUCKET_LIMIT }).map(
                          (_, index) => (
                            <i
                              className={
                                index < currentBucketFillCount
                                  ? index + 1 <= demoGoodCount
                                    ? 'is-good'
                                    : 'is-bad'
                                  : ''
                              }
                              key={index}
                            />
                          ),
                        )}
                      </span>
                    ) : null}
                  </div>
                )
              })}
              <div className="cage-hub" aria-hidden="true">
                <Icon name="sync" />
              </div>
            </div>
          </div>
        </section>

        <section className="panel stats-panel" aria-labelledby="stats-title">
          <div className="panel-title-row panel-title-row--stacked">
            <h2 id="stats-title">拾球统计</h2>
          </div>

          <div className="stats-body">
            <div className="stat-number-row">
              <strong>{demoTotalCount}</strong>
              <Icon name="arrow-up" />
            </div>

            <div className="ratio-block">
              <div className="ratio-labels">
                <span className="good-label">好球 ({demoGoodCount})</span>
                <span className="bad-label">坏球 ({demoBadCount})</span>
              </div>
              <div className="ratio-bar" aria-label="好坏球比例">
                <span
                  className="ratio-good"
                  style={{ width: `${goodRatio}%` }}
                />
                <span
                  className="ratio-bad"
                  style={{ width: `${100 - goodRatio}%` }}
                />
              </div>
            </div>

            <div className="metric-capsules" aria-label="本轮关键指标">
              <div className="metric-card">
                <span>当前球仓</span>
                <strong>{currentBucketLabel}</strong>
              </div>
              <div className="metric-card">
                <span>单仓容量</span>
                <strong>
                  {currentBucketFillCount}/{DEMO_BUCKET_LIMIT}
                </strong>
              </div>
              <div className="metric-card">
                <span>筛选精度</span>
                <strong>98%+</strong>
              </div>
              <div className="metric-card">
                <span>寿命提升</span>
                <strong>30%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="panel telemetry-panel" aria-labelledby="telemetry-title">
          <div className="panel-title-row">
            <h2 id="telemetry-title">设备联动</h2>
            <span>{phaseNarration.title}</span>
          </div>

          <div className="telemetry-list">
            {telemetryItems.map((item) => (
              <div className="telemetry-row" key={item.label}>
                <div className={`telemetry-icon telemetry-icon--${item.tone}`}>
                  <Icon name={item.icon} />
                </div>
                <div className="telemetry-copy">
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="telemetry-bar" aria-hidden="true">
                    <i
                      className={`telemetry-fill telemetry-fill--${item.tone}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
