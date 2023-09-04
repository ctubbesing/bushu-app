export interface Collection {
  object: string
  url: string
  pages: {
    next_url: null | string
    previous_url: null | string
    per_page: number
  }
  total_count: number
  data_updated_at: null | string
  data: Resource[]
}

export interface Resource {
  id: number
  object: string
  url: string
  data_updated_at: string
}

export interface AssignmentResource extends Resource {
  data: AssignmentData
}

export interface SubjectResource extends Resource {
  data: SubjectData
}

export interface WKUserData {
  id: string
  username: string
  level: number
  profile_url: string
  started_at: string
  current_vacation_started_at: null | string
  subscription: {
    active: boolean
    type: string
    max_level_granted: number
    period_ends_at: null | string
  }
  preferences: any
}

export interface AssignmentData {
  available_at: string | null
  burned_at: string | null
  created_at: string
  hidden: boolean
  passed_at: string | null
  resurrected_at: string | null
  srs_stage: number
  started_at: string | null
  subject_id: number
  subject_type: string
  unlocked_at: string | null
}

export interface SubjectData {
  auxilary_meanings: SubjectAuxilaryMeaning[]
  characters: string | null
  created_at: string
  document_url: string
  hidden_at: string
  lesson_position: number
  level: number
  meaning_mnemonic: string
  meanings: SubjectMeaning[]
  slug: string
  spaced_repetition_system_id: number
}

interface SubjectMeaning {
  meaning: string
  primary: boolean
  accepted_answer: boolean
}

interface SubjectAuxilaryMeaning {
  meaning: string
  type: string
}

export interface RadicalData extends SubjectData {
  amalgamation_subject_ids: number[]
  characters: string | null
  character_images: SubjectAsset[]
}

interface SubjectAsset {
  url: string
  content_type: string
  metadata: any
}

export interface KanjiData extends SubjectData {
  amalgamation_subject_ids: number[]
  component_subject_ids: number[]
  meaning_hint: string | null
  reading_hint: string | null
  reading_mnemonic: string
  readings: KanjiReading[]
  visually_similar_subject_ids: number[]
}

interface KanjiReading {
  reading: string
  primary: boolean
  accepted_answer: boolean
  type: string
}

export interface VocabularyData extends SubjectData {
  component_subject_ids: number[]
  context_sentences: VocabularyContextSentence[]
  meaning_mnemonic: string
  parts_of_speech: string[]
  pronounciation_audios: SubjectAsset[]
  readings: VocabularyReading
  reading_mnemonic: string
}

interface VocabularyContextSentence {
  en: string
  ja: string
}

interface VocabularyReading {
  accepted_answer: boolean
  primary: boolean
  reading: string
}

export interface KanaVocabularyData extends SubjectData {
  context_sentences: VocabularyContextSentence[]
  meaning_mnemonic: string
  parts_of_speech: string[]
  pronounciation_audios: SubjectAsset[]
}
