type Contrib = {
  date: string
  count: number
  color: string
  intensity: string
}

type Year = {
  year: string
  total: number
  range: {
    start: string
    end: string
  }
}

type ChartData = {
  contributions: Contrib[]
  years: Year[]
}

type PageProps = {
  params: { username: string }
  searchParams: { scheme: 'light' | 'dark' }
}

enum Color {
  '#ebedf0' = '--color-calendar-graph-day',
  '#9be9a8' = '--color-calendar-graph-day-L1',
  '#40c463' = '--color-calendar-graph-day-L2',
  '#30a14e' = '--color-calendar-graph-day-L3',
  '#216e39' = '--color-calendar-graph-day-L4',
}

const HOST = 'https://jandee.vercel.app' // 'http://localhost:3000'

async function getData<T>(url: string): Promise<{ data: T }> {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data = await res.json()
  return { data }
}

const Chart = async ({ params, searchParams }: PageProps) => {
  const { data } = await getData<ChartData>(`${HOST}/api/v1/${params.username}`)
  if (!data) return null

  const width = 768
  const current = new Date()
  const dates = []
  for (let i = 0; i < 12; i++) {
    current.setDate(-current.getDate())
    dates.push(new Date(current.getTime()))
  }
  dates.reverse()
  dates.push(new Date())

  const months = []
  for (let i = 0; i < dates.length; i++) {
    if (!i) continue
    const date = dates[i]
    months.push(
      <text
        key={`month-${i}`}
        x={`${(width / 12.1) * (i - 1) - 5}`}
        y="-6"
        fill="var(--color-text-default)"
        style={{ fontSize: '0.66em' }}
      >
        {date.toLocaleString('en-US', { month: 'short' })}
      </text>
    )
  }

  const mappedContributions = {} as Record<string, Contrib>
  const contributions = data.contributions
  for (let i = 0; i < contributions.length; i++) {
    let contrib = contributions[i]
    let dateObj = new Date(contrib.date)
    if (dateObj < dates[0]) {
      break
    }
    mappedContributions[contrib.date] = contrib
  }

  const now = new Date()
  // const offset = now.getTimezoneOffset() * 60 * 1000

  function renderWeek(week: number) {
    const rel = new Date(now.getTime())
    rel.setDate(-(53 * 7) + (week + 4) * 7)

    return (
      <g key={`week-${week}`} transform={`translate(${week * 14}, 0)`}>
        {Array.from({ length: 7 }).map((_, i) => {
          const relDay = new Date(rel.getTime())
          relDay.setDate(rel.getDate() + 1 + i)
          // console.log(i, relDay.getDay())

          const key = relDay.toISOString().split('T')[0]
          const found = mappedContributions[key]
          if (!found) {
            return (
              <rect
                key={`rect-${i}`}
                width="10"
                height="10"
                x="-37"
                y={13 * i}
                rx="2"
                ry="2"
                fill="var(--color-calendar-graph-day-bg)"
                stroke="var(--color-calendar-graph-day-border)"
              >
                <title>{key}</title>
              </rect>
            )
          }

          return (
            <rect
              key={`rect-${i}`}
              width="10"
              height="10"
              x="-37"
              y={13 * i}
              rx="2"
              ry="2"
              fill={`var(${Color[found.color as keyof typeof Color]}-bg)`}
              stroke={`var(${Color[found.color as keyof typeof Color]}-border)`}
            >
              <title>{key}</title>
            </rect>
          )
        })}
      </g>
    )
  }

  return (
    <svg
      data-color-mode={searchParams.scheme}
      width="768"
      height="120"
      viewBox="0 0 768 120"
      style={{ background: 'transparent' }}
    >
      <g transform="translate(10, 20)">
        <g transform="translate(56, 0)">{[...Array(53)].map((_, i) => renderWeek(i))}</g>
        <g transform="translate(23, 0)">{months}</g>
        <text textAnchor="start" dx="-9" dy="8" style={{ display: 'none' }}>
          Sun
        </text>
        <text textAnchor="start" dx="-9" dy="22" fill="var(--color-text-default)" style={{ fontSize: '0.66em' }}>
          Mon
        </text>
        <text textAnchor="start" dx="-9" dy="32" fill="var(--color-text-default)" style={{ display: 'none' }}>
          Tue
        </text>
        <text textAnchor="start" dx="-9" dy="48" fill="var(--color-text-default)" style={{ fontSize: '0.66em' }}>
          Wed
        </text>
        <text textAnchor="start" dx="-9" dy="62" fill="var(--color-text-default)" style={{ display: 'none' }}>
          Thu
        </text>
        <text textAnchor="start" dx="-9" dy="73" fill="var(--color-text-default)" style={{ fontSize: '0.66em' }}>
          Fri
        </text>
        <text textAnchor="start" dx="-9" dy="81" fill="var(--color-text-default)" style={{ display: 'none' }}>
          Sat
        </text>
      </g>
    </svg>
  )
}

export default Chart
