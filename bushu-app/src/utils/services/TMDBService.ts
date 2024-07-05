import axios, { AxiosError } from "axios"
import { ResponsePage, TVDetails } from "@/utils/services/externalTypes/tmdbTypes"
import { ShowInfo } from "@/types/watchlistTypes"

// ok to expose the API token since it's a free service anyways - see https://www.themoviedb.org/talk/5b6b0e08925141406a1134de
const publicToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmFmNWI3MzVlZmU3ZTkzOGI4MGJkMGY1OTg4YzAxZSIsIm5i' +
                    'ZiI6MTcxOTc4MjYyOC4yNzM4NzcsInN1YiI6IjY2ODFjNmUyYWYzMzg4NzQyMGVmNDg4OCIsInNjb3Blc' +
                    'yI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4lJ_Smt237V-SToqhuMDGEGwmSLqM7Wb55fA0c5L7FI'

const logoPrimaryFullURL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg'
const logoAltShortURL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg'

function getBearerToken(): string {
  return `Bearer ${publicToken}`
}

function getImageURL(path: string | undefined): string | undefined {
  return path ? `https://image.tmdb.org/t/p/w342${path}` : undefined
}

function resolveImageURL(url: string | undefined): string {
  return url ?? logoPrimaryFullURL
}

async function getSearchRequest<T>(searchString: string, isMovie = false): Promise<ResponsePage<T>> {
  let searchURL = 'https://api.themoviedb.org/3/search/'
  searchURL += isMovie ? 'movie' : 'tv'
  searchURL += `?query=${encodeURIComponent(searchString)}`

  try {
    const response = await axios.get(searchURL, {
      headers: {
        'Authorization': getBearerToken(),
        'accept': 'application/json',
      },
    })
    return response.data

  } catch (error) {
    const e = error as AxiosError
    throw(e)
  }
}
export default {
  async searchTVShows(searchString: string): Promise<ShowInfo[]> {
    const apiResponse: ResponsePage<TVDetails> = await getSearchRequest<TVDetails>(searchString)

    return apiResponse.results.map((d: TVDetails) => {
      return {
        id: d.id.toString(),
        title: d.name,
        altTitle: (d.original_language !== 'en' && d.original_name) ? d.original_name : undefined,
        isAnime: d.origin_country?.includes('JP') && d.genre_ids?.includes(16),
        imgLink: resolveImageURL(getImageURL(d.poster_path)),
        seasons: [],
      }
    })
  },
}
