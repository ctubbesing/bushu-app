export interface ResponsePage<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

interface MediaDetails {
  id: number
  overview: string
  backdrop_path: string
  poster_path: string
  genre_ids: number[]
  original_language: string
  adult: boolean
  popularity: number
  vote_average: number
  vote_count: number
}

interface TVSeasonSummary {
  id: number
  season_number: number
  overview: string
  episode_count: number
  air_date: string
  poster_path: string
  vote_average: number
}

export interface TVDetails extends MediaDetails {
  name: string
  original_name: string
  first_air_date: string
  origin_country: string[]
}

export interface TVFullDetails extends TVDetails {
  seasons: TVSeasonSummary[]
  production_countries: {
    name: string
    iso_3166_1: string
  }[]
}

export interface MovieFullDetails extends MediaDetails {
  original_title: string
  release_date: string
  title: string
  video: boolean
  production_countries: {
    name: string
    iso_3166_1: string
  }[]
}
