export type LibrarySection = {
  id: string;
  title: string;
  subtitle: string;
  status: 'verified' | 'sample' | 'pending';
  badge: string;
};

export type Surah = {
  id: number;
  arabicName: string;
  englishName: string;
  verses: number;
  status: 'Verified source required' | 'Sample metadata';
};

export type DuaItem = {
  id: string;
  title: string;
  category: string;
  source: string;
  status: 'Awaiting verification' | 'Approved for publication';
};

export type EventItem = {
  id: string;
  name: string;
  date: string;
  note: string;
};

export const appSections: LibrarySection[] = [
  { id: 'quran', title: 'Holy Quran', subtitle: 'Complete Quran library with verification workflow', status: 'pending', badge: 'Workflow' },
  { id: 'dua', title: 'Daily Dua', subtitle: 'Shia dua library and source tracking', status: 'sample', badge: 'Sample' },
  { id: 'sajjadiya', title: 'Sahifa Sajjadiya', subtitle: 'Prayer and supplication references', status: 'sample', badge: 'Sample' },
  { id: 'kumayl', title: 'Dua Kumayl', subtitle: 'Verified source-to-text linkage', status: 'pending', badge: 'Pending' },
  { id: 'tawassul', title: 'Dua Tawassul', subtitle: 'Islamic calendar and occasion indexing', status: 'sample', badge: 'Sample' },
  { id: 'ashura', title: 'Ziyarat Ashura', subtitle: 'Protected ziyarat data with provenance', status: 'pending', badge: 'Review' },
  { id: 'namaz', title: 'Namaz ka Tareeqa', subtitle: 'Prayer guides with marja-based notes', status: 'sample', badge: 'Draft' },
  { id: 'wudu', title: 'Wuzu ka Tareeqa', subtitle: 'Ritual guidance with source references', status: 'sample', badge: 'Draft' },
  { id: 'calendar', title: 'Amaal and Islamic Calendar', subtitle: 'Regional convention and estimated dates', status: 'sample', badge: 'Sample' },
  { id: 'tasbeeh', title: 'Tasbeeh Counter', subtitle: 'Offline dhikr and saved sessions', status: 'verified', badge: 'Live' },
  { id: 'search', title: 'Search Islamic Library', subtitle: 'Offline and online content discovery', status: 'sample', badge: 'Alpha' },
  { id: 'settings', title: 'Settings', subtitle: 'Accessibility, privacy and offline controls', status: 'verified', badge: 'Ready' },
];

export const quranSurahs: Surah[] = [
  { id: 1, arabicName: 'الفاتحة', englishName: 'Al-Fatihah', verses: 7, status: 'Sample metadata' },
  { id: 2, arabicName: 'البقرة', englishName: 'Al-Baqarah', verses: 286, status: 'Sample metadata' },
  { id: 3, arabicName: 'آل عمران', englishName: 'Ali Imran', verses: 200, status: 'Sample metadata' },
  { id: 4, arabicName: 'النساء', englishName: 'An-Nisa', verses: 176, status: 'Sample metadata' },
  { id: 5, arabicName: 'المائدة', englishName: 'Al-Ma’idah', verses: 120, status: 'Sample metadata' },
];

export const duaLibrary: DuaItem[] = [
  { id: 'kumayl', title: 'Dua Kumayl', category: 'Daily supplication', source: 'Mafatih al-Jinan', status: 'Awaiting verification' },
  { id: 'tawassul', title: 'Dua Tawassul', category: 'Supplication', source: 'Verified Shia reference set', status: 'Awaiting verification' },
  { id: 'jawshan', title: 'Dua Jawshan Kabeer', category: 'Protection', source: 'Shia manuscript references', status: 'Awaiting verification' },
  { id: 'sajjadiya', title: 'Sahifa Sajjadiya', category: 'Daily remembrance', source: 'Sahifa al-Sajjadiyya', status: 'Awaiting verification' },
];

export const calendarEvents: EventItem[] = [
  { id: 'ashura', name: 'Ashura', date: 'Estimated via moon sighting', note: 'Regional calendars may vary; mark as estimated where moon sighting is uncertain.' },
  { id: 'arbaeen', name: 'Arbaeen', date: 'Calculated from Muharram lunar schedule', note: 'Date must be independently verified against the selected authority.' },
  { id: 'gadir', name: 'Eid al-Ghadir', date: 'Regional convention dependent', note: 'Commence only after confirmed authority-based calculations.' },
  { id: 'ramadan', name: 'Ramadan start', date: 'Moon sighting dependent', note: 'Use regional convention selection and show estimated flag in UI.' },
];

export const verificationChecklist = [
  'Exactly 114 surahs in the approved edition',
  'Verse counts checked against the source edition',
  'Source metadata and checksum retained',
  'RLS and admin publication workflow enforced',
  'Scholarly review required before publication',
];

export const schemaSummary = [
  'users',
  'user_preferences',
  'quran_surahs',
  'quran_verses',
  'quran_translations',
  'duas',
  'dua_translations',
  'ziyarat',
  'ziyarat_translations',
  'sahifa_sajjadiya_entries',
  'prayer_guides',
  'wudu_guides',
  'islamic_events',
  'religious_sources',
  'content_versions',
  'content_verification_records',
  'bookmarks',
  'reading_history',
  'offline_download_metadata',
  'tasbeeh_sessions',
  'admin_users',
];
