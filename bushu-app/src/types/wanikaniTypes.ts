export interface Resource {
  id: number
  object: string
  url: string
  data_updated_at: Date
  data: {
    subject_id?: number
    characters?: string
  }
}

export interface Collection {
  object: string
  url: string
  pages: {
    next_url: null | string
    previous_url: null | string
    per_page: number
  }
  total_count: number
  data_updated_at: null | Date
  data: Resource[]
}
