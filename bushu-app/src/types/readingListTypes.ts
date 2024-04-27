enum BookFormat {
  Paper,
  EBook,
  Audio
}

export interface Collection {
  id: string
  name: string
  collections: Collection[]
  series: Series[]
  books: Book[]
  tags: string[]
}

export interface Series {
  id: string
  name: string
  length?: number
  isSingleBook: boolean
  books: Book[]
  isComplete: boolean
  imgLink?: string
  tags: string[]
}

export interface Book {
  id: string
  title: string
  authors: string[]
  seriesId: string
  bookNumber: number
  isNovella: boolean
  publicationDate: string
  wordCount?: number
  audioLength?: number
  imgLink?: string
  audioImgLink?: string
  infoLink?: string
  tags: string[]
}

export interface BookRead {
  id: string
  bookInfo: Book
  format: BookFormat
  progressPercent: number
  beganDate?: string
  completedDate?: string
  droppedDate?: string
}

export interface ReadingListData {
  reading: BookRead[]
  upNext: BookRead[]
  currentSeries: Series[]
  backlog: (Collection | Series | Book)[]
}
