import addDays from 'date-fns/addDays'
import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import format from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import parseISO from 'date-fns/parseISO'
import startOfWeek from 'date-fns/startOfWeek'
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks'

import Canvas, { Contrib } from './Canvas'

const DATE_FORMAT = 'yyyy-MM-dd'
const HOST = process.env.API_HOST

interface Year {
  year: string
  total: number
  range: {
    start: string
    end: string
  }
}

interface DataStruct {
  years: Year[]
  contributions: Contrib[]
}

type PageProps = {
  params: { username: string }
  searchParams: { scheme: 'light' | 'dark'; tz: string; v: string }
}

export default async function CanvasPage({
  params: { username },
  searchParams: { tz: timeZone = 'Asia/Seoul', ...searchParams },
}: PageProps) {
  const token = searchParams.v || `${Date.now()}`.substring(0, 8)
  const { data } = await getData<DataStruct>(`${HOST}/api/v1/${username}?v=${token}`)

  const lastDate = new Date(new Date().toLocaleString('en', { timeZone }))
  let nextDate = startOfWeek(addMonths(lastDate, -12))
  if (differenceInCalendarWeeks(lastDate, nextDate) > 52) {
    nextDate = addWeeks(nextDate, 1)
  }

  const getContrib = (date: string) => (isAfter(parseISO(date), lastDate) ? {} : getDateInfo(data, date))

  const graphEntries = Array.from({ length: 53 }).map(() =>
    Array.from({ length: 7 }).map(() => {
      const date = format(nextDate, DATE_FORMAT)
      if (isAfter(nextDate, lastDate)) return { date }
      nextDate = addDays(nextDate, 1)
      return { date, ...getContrib(date) }
    })
  )

  const count = getContributionCount(graphEntries)
  return <Canvas data={graphEntries} count={count} username={username} scheme={searchParams.scheme} />
}

async function getData<T>(url: string): Promise<{ data: T }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch data')
  const data = await res.json()
  return { data }
}

function getDateInfo(data: DataStruct, date: string) {
  return data.contributions.find(contrib => contrib.date === date)
}

function getContributionCount(graphEntries: Contrib[][]) {
  return graphEntries.reduce((rowTotal, row) => {
    return rowTotal + row.reduce((colTotal, col) => colTotal + (col.count || 0), 0)
  }, 0)
}
