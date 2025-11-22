import * as z from 'zod'
import { DateTime } from "luxon"

export const RawEpisodeDate = z.object({
  episode: z.number(),
  date: z.string(),
})
export type RawEpisodeDate = z.infer<typeof RawEpisodeDate>

export const ShowSeason = z.object({
  id: z.string(),
  showId: z.string(),
  seasonNumber: z.number(),
  name: z.string().optional(),
  totalEpisodeCount: z.number().nullable().optional(),
  irregularDates: z.array(RawEpisodeDate),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  airingSeason: z.string().optional(),
  airingYear: z.number().optional(),
  infoLink: z.string().optional(),
  imgLink: z.string().optional(),
})
export type ShowSeason = z.infer<typeof ShowSeason>

export const ShowInfo = z.object({
  id: z.string(),
  title: z.string(),
  altTitle: z.string().optional(),
  isAnime: z.boolean().optional(),
  doEpisodeCountOverall: z.boolean().optional(),
  seasonCount: z.number().optional(),
  seasons: z.array(ShowSeason),
  imgLink: z.string().optional(),
})
export type ShowInfo = z.infer<typeof ShowInfo>

export const SeasonView = z.object({
  id: z.string(),
  seasonInfo: ShowSeason,
  watchedEpisodes: z.number(),
  currentEpisodeCount: z.number().optional(),
  beganDate: z.string().optional(),
  completedDate: z.string().optional(),
  droppedDate: z.string().optional(),
})
export type SeasonView = z.infer<typeof SeasonView>

export const WatchlistData = z.object({
  main: z.array(SeasonView),
  live: z.array(SeasonView),
  queue: z.array(SeasonView),
  upcoming: z.array(ShowSeason),
  backlog: z.array(ShowInfo),
})
export type WatchlistData = z.infer<typeof WatchlistData>

export const EpisodeDate = z.object({
  episode: z.number(),
  date: z.custom<DateTime>(arg => arg instanceof DateTime),
})
export type EpisodeDate = z.infer<typeof EpisodeDate>
