import type { EpisodeDate, RawEpisodeDate, ShowSeason } from '@/types/watchlistTypes'
import { DateTime } from 'luxon'

const defaultEpisodeCount = 30

const buildReleaseSchedule = (season: ShowSeason): EpisodeDate[] => {
  let episodeDates: EpisodeDate[] = []
  if (season.startDate) {
    const startDate = DateTime.fromISO(season.startDate)
    if (startDate.isValid)
    {
      episodeDates = [{
        episode: 1,
        date: startDate,
      }]
      const episodeCount = season.totalEpisodeCount ?? defaultEpisodeCount
      let previousDate: DateTime = startDate
      for (let i = 1; i < episodeCount; i++) {
        const nextIrregularDate = season.irregularDates?.find((d: RawEpisodeDate) => d.episode >= i + 1)

        let currentDate: DateTime
        if (nextIrregularDate?.episode === i + 1) {
          currentDate = DateTime.fromISO(nextIrregularDate.date)
        } else {
          const nextWeekDate = previousDate.plus({days: 7})
          currentDate = nextIrregularDate ? DateTime.min(DateTime.fromISO(nextIrregularDate.date), nextWeekDate) : nextWeekDate
        }

        previousDate = currentDate

        episodeDates.push({
          episode: i + 1,
          date: currentDate
        })
      }
    }
  }
  return episodeDates
}

export default buildReleaseSchedule
