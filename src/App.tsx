import { useState } from "react";
import './App.css'
import { teams, type TeamId } from "./data/vahta"
import { buildMonthSchedule, summarizeMonth } from "./lib/schedule";

function App() {
  const [selectedTeam, setSelectedTeam] = useState<TeamId>(2)

  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const monthEntries = buildMonthSchedule(year, month, selectedTeam)
  const summary = summarizeMonth(monthEntries)
  const upcomingEntries = monthEntries.filter((entry) => entry.meta.hours > 0).slice(0, 6)

  const monthLabel = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="page">
      <h1>VAHTA Analytics</h1>
      <p>{monthLabel}</p>

      <div className="team-tabs">
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => setSelectedTeam(team.id)}
          >
            {team.label}
          </button>  
        ))}
      </div>

      <section>
        <h2>MonthSummary</h2>
        <ul>
          <li>Work days: {summary.workDays}</li>
          <li>Total hours: {summary.totalHours}</li>
          <li>Day shifts: {summary.dayShiftCount}</li>
          <li>Night shifts: {summary.nightShiftCount}</li>
          <li>Recovery days: {summary.recoveryDays}</li>
          <li>Off days: {summary.offDays}</li>
        </ul>
      </section>

      <section>
        <h2>Upcoming shifts</h2>
        <ul>
          {upcomingEntries.map((entry) => (
            <li key={entry.key}>
              {entry.date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}{' '}
              - {entry.meta.label} ({entry.meta.shortLabel})
            </li>
          ))}
        </ul>
      </section>
    </main>
  )

}

export default App