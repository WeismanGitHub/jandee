import getMonth from 'date-fns/getMonth'
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'

export type Contrib = {
  date: string
  count?: number
  intensity?: string
}

type ChartProps = {
  count?: string
  username?: string
  data?: Contrib[][]
  options?: {
    boxMargin?: number
    borderRadius?: number
    showWeekDays?: boolean
    showFooter?: boolean
  }
  scheme?: 'light' | 'dark'
}

const boxSize = 10
const canvasMargin = 3
const defaultBoxMargin = 3
const defaultBorderRadius = 2
const textHeight = 13
const fontSize = '10px'

const Chart = ({
  data = [],
  username,
  count,
  scheme,
  options: {
    borderRadius = defaultBorderRadius,
    boxMargin = defaultBoxMargin,
    showWeekDays = true,
    showFooter = true,
  } = {},
}: ChartProps) => {
  const textWidth = showWeekDays ? 28 + boxMargin : 0
  const footerHeight = showFooter ? textHeight + 2 : 0
  const chartHeight = textHeight + footerHeight + (boxSize + boxMargin) * 7 + canvasMargin
  const height = chartHeight + canvasMargin * 2
  const width = data.length * (boxSize + boxMargin) + textWidth + canvasMargin
  let lastCountedMonth = 0

  return (
    <svg
      data-color-mode={scheme}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ background: 'transparent' }}
    >
      <g transform={`translate(${canvasMargin}, ${canvasMargin})`}>
        <g transform={`translate(${textWidth}, ${textHeight + boxMargin})`}>
          {data.map((week, x) => (
            <g key={`week-${x}`} transform={`translate(${(boxSize + boxMargin) * x}, 0)`}>
              {week.map((day, y) => (
                <rect
                  key={`day-${y}`}
                  width={boxSize}
                  height={boxSize}
                  y={(boxSize + boxMargin) * y}
                  rx={borderRadius}
                  ry={borderRadius}
                  fill={`var(--color-calendar-graph-day-${day.count ? `L${day.intensity}-` : ''}bg)`}
                  stroke={`var(--color-calendar-graph-day-${day.count ? `L${day.intensity}-` : ''}border)`}
                >
                  <title>{`${day.date || ''} / ${day.count || '0'}`}</title>
                </rect>
              ))}
            </g>
          ))}
        </g>

        <g transform={`translate(${textWidth}, 10)`}>
          {data.map((week, x) => {
            const date = parseISO(week[0]?.date)
            const month = getMonth(date) + 1
            const nextMonth = data[x + 1] ? getMonth(parseISO(data[x + 1][0].date)) + 1 : 0
            const firstMonthIsLast = x === 0 && month !== nextMonth
            const laistMonthIsDiff = x === data.length - 1 && month !== lastCountedMonth
            if (month !== lastCountedMonth && !firstMonthIsLast && !laistMonthIsDiff) {
              lastCountedMonth = month
              return (
                <text
                  key={`month-${x}`}
                  x={`${x * (boxSize + boxMargin)}`}
                  fill="var(--color-text-default)"
                  style={{ fontSize }}
                >
                  {format(date, 'MMM')}
                </text>
              )
            }
            return null
          })}
        </g>

        {showWeekDays && (
          <g transform={`translate(0, ${textHeight + boxMargin + 8})`}>
            {data[0].map((day, y) => (
              <text
                key={`weekday-${y}`}
                dy={y * textHeight}
                fill="var(--color-text-default)"
                style={y % 2 ? { fontSize } : { display: 'none' }}
              >
                {format(parseISO(day.date), 'EEE')}
              </text>
            ))}
          </g>
        )}

        {showFooter && username && count && (
          <g transform={`translate(${textWidth}, ${chartHeight - textHeight})`}>
            <text dy={textHeight} style={{ fontSize }} fill="var(--color-text-default)">
              {`${count} contribution${count === '1' ? '' : 's'} in the last year by @${username} on GitHub`}
            </text>
          </g>
        )}

        {showFooter && (
          <g
            transform={`translate(${data.length * (boxSize + boxMargin) + textWidth - 124}, ${
              chartHeight - footerHeight - canvasMargin
            })`}
          >
            <text dy={footerHeight} style={{ fontSize }} fill="var(--color-text-default)">
              Less
            </text>
            <g transform={`translate(28, ${footerHeight - 9})`}>
              {Array.from({ length: 5 }).map((_, intensity) => (
                <rect
                  key={`regend-${intensity}`}
                  width={boxSize}
                  height={boxSize}
                  x={(boxSize + boxMargin) * intensity}
                  rx={borderRadius}
                  ry={borderRadius}
                  fill={`var(--color-calendar-graph-day-${intensity ? `L${intensity}-` : ''}bg)`}
                  stroke={`var(--color-calendar-graph-day-${intensity ? `L${intensity}-` : ''}border)`}
                >
                  <title>i</title>
                </rect>
              ))}
            </g>
            <text
              dx={30 + (boxSize + boxMargin) * 5}
              dy={footerHeight}
              style={{ fontSize }}
              fill="var(--color-text-default)"
            >
              More
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}

export default Chart
