import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { router, usePathname } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { appSections, calendarEvents, duaLibrary, quranSurahs, verificationChecklist } from './src/data/libraryData';
import { useAppState } from './src/state/AppState';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/quran', label: 'Quran' },
  { href: '/library', label: 'Duas & Ziyarat' },
  { href: '/guides', label: 'Prayer guides' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/bookmarks', label: 'Saved' },
  { href: '/tasbeeh', label: 'Tasbeeh' },
  { href: '/settings', label: 'Settings' },
] as const;

type Screen = 'home' | 'quran' | 'library' | 'guides' | 'calendar' | 'bookmarks' | 'tasbeeh' | 'settings' | 'search';

const routeScreens: Record<string, Screen> = {
  '/': 'home',
  '/quran': 'quran',
  '/library': 'library',
  '/guides': 'guides',
  '/calendar': 'calendar',
  '/bookmarks': 'bookmarks',
  '/tasbeeh': 'tasbeeh',
  '/settings': 'settings',
  '/search': 'search',
};

const guideItems = [
  { id: 'prayer', title: 'Namaz ka Tareeqa', detail: 'Guide content awaits review against the selected marja’s rulings.' },
  { id: 'wudu', title: 'Wuzu ka Tareeqa', detail: 'Guide content awaits review against the selected marja’s rulings.' },
  { id: 'calendar-guide', title: 'Amaal and Islamic Calendar', detail: 'Dates are not published until their regional source is configured.' },
  { id: 'offline', title: 'Offline downloads', detail: 'No verified religious-content package has been installed yet.' },
];

function Palette({ darkMode }: { darkMode: boolean }) {
  return darkMode
    ? {
        background: '#071912',
        surface: '#123228',
        surfaceAlt: '#1a4237',
        primary: '#9ed6b8',
        accent: '#d9bb6d',
        text: '#edf6f1',
        muted: '#bdd5c9',
        border: '#2f5f50',
        warning: '#f5d68f',
        danger: '#ffc1b8',
      }
    : {
        background: '#f5f3eb',
        surface: '#ffffff',
        surfaceAlt: '#eef7f0',
        primary: '#0f5d46',
        accent: '#b08c34',
        text: '#14261b',
        muted: '#547365',
        border: '#dfe8e3',
        warning: '#785b00',
        danger: '#9b3428',
      };
}

export default function App() {
  const pathname = usePathname();
  const screen = routeScreens[pathname] ?? 'home';
  const { data, setData, ready, storageError } = useAppState();
  const palette = Palette({ darkMode: data.darkMode });
  const [searchText, setSearchText] = useState('');
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [targetDraft, setTargetDraft] = useState(data.target);

  useEffect(() => {
    setTargetDraft(data.target);
  }, [data.target]);

  const query = searchText.trim().toLocaleLowerCase();
  const filteredSurahs = useMemo(
    () =>
      quranSurahs.filter(
        (surah) =>
          !query ||
          surah.englishName.toLocaleLowerCase().includes(query) ||
          surah.arabicName.includes(query) ||
          String(surah.id).includes(query),
      ),
    [query],
  );
  const filteredGuides = useMemo(
    () =>
      guideItems.filter(
        (item) =>
          !query ||
          item.title.toLocaleLowerCase().includes(query) ||
          item.detail.toLocaleLowerCase().includes(query),
      ),
    [query],
  );
  const filteredEvents = useMemo(
    () =>
      calendarEvents.filter(
        (event) =>
          !query ||
          event.name.toLocaleLowerCase().includes(query) ||
          event.date.toLocaleLowerCase().includes(query) ||
          event.note.toLocaleLowerCase().includes(query),
      ),
    [query],
  );
  const filteredDuas = useMemo(
    () =>
      duaLibrary.filter(
        (dua) =>
          !query ||
          dua.title.toLocaleLowerCase().includes(query) ||
          dua.category.toLocaleLowerCase().includes(query) ||
          dua.source.toLocaleLowerCase().includes(query),
      ),
    [query],
  );
  const countTarget = Number.parseInt(data.target, 10);
  const validTarget = Number.isInteger(countTarget) && countTarget > 0;

  function toggleBookmark(id: string) {
    setData((previous) => ({
      ...previous,
      bookmarks: previous.bookmarks.includes(id)
        ? previous.bookmarks.filter((bookmark) => bookmark !== id)
        : [...previous.bookmarks, id],
    }));
  }

  function markRecentlyRead(id: string) {
    setData((previous) => ({
      ...previous,
      recentlyRead: [id, ...previous.recentlyRead.filter((recent) => recent !== id)].slice(0, 10),
    }));
  }

  function renderSearchBox(placeholder: string) {
    return (
      <TextInput
        accessibilityLabel={placeholder}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={[styles.input, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, color: palette.text }]}
      />
    );
  }

  function renderBookmarkButton(id: string) {
    const bookmarked = data.bookmarks.includes(id);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
        onPress={() => toggleBookmark(id)}
        style={[styles.smallButton, { borderColor: palette.border }]}
      >
        <Text style={{ color: bookmarked ? palette.accent : palette.muted, fontWeight: '700' }}>
          {bookmarked ? 'Saved' : 'Save'}
        </Text>
      </Pressable>
    );
  }

  function renderHome() {
    const heroTextColor = data.darkMode ? '#071912' : '#ffffff';
    const heroMutedColor = data.darkMode ? '#183a2d' : '#e3f0e8';

    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.hero, { backgroundColor: palette.primary }]}>
          <Text style={[styles.eyebrowLight, { color: heroMutedColor }]}>SHIA ISLAMIC LIBRARY</Text>
          <Text style={[styles.heroTitle, { color: heroTextColor }]}>Noor-e-Hidayat</Text>
          <Text style={[styles.heroBody, { color: heroMutedColor }]}>A calm, source-conscious home for learning and daily worship.</Text>
          <View style={[styles.heroPill, { backgroundColor: data.darkMode ? '#07191222' : '#ffffff22' }]}>
            <Text style={[styles.heroPillText, { color: heroTextColor }]}>Content status: foundation in progress</Text>
          </View>
          <View style={styles.heroActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/quran')}
              style={[styles.heroAction, { backgroundColor: heroTextColor, borderColor: heroTextColor }]}
            >
              <Text style={[styles.heroActionText, { color: palette.primary }]}>Browse Quran</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/tasbeeh')}
              style={[styles.heroAction, { borderColor: heroTextColor }]}
            >
              <Text style={[styles.heroActionText, { color: heroTextColor }]}>Open Tasbeeh</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.notice, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.noticeTitle, { color: palette.text }]}>Integrity comes first</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Sacred texts and rulings are not presented as complete or verified until their sources, permissions and review are recorded.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.heading, { color: palette.text }]}>Your library</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/search')}
              style={StyleSheet.flatten([styles.textButton, { borderColor: palette.border }])}
            >
              <Text style={{ color: palette.primary, fontWeight: '700' }}>Search</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {appSections.map((item) => {
              const target =
                item.id === 'quran'
                  ? '/quran'
                  : item.id === 'calendar'
                    ? '/calendar'
                    : item.id === 'tasbeeh'
                      ? '/tasbeeh'
                      : item.id === 'settings'
                        ? '/settings'
                        : item.id === 'namaz' || item.id === 'wudu'
                          ? '/guides'
                          : '/library';
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(target)}
                  style={StyleSheet.flatten([styles.tile, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }])}
                >
                  <Text style={[styles.tileTitle, { color: palette.text }]}>{item.title}</Text>
                  <Text style={[styles.tileBody, { color: palette.muted }]}>{item.subtitle}</Text>
                  <Text style={[styles.status, { color: item.status === 'verified' ? palette.primary : palette.warning }]}>
                    {item.badge}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Continue where you left off</Text>
          {data.recentlyRead.length ? (
            data.recentlyRead.slice(0, 3).map((id) => (
              <Pressable
                key={id}
                accessibilityRole="link"
                accessibilityLabel={`Continue reading ${getContentTitle(id)}`}
                onPress={() => router.push(getContentRoute(id))}
                style={[styles.recentItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
              >
                <View style={styles.flex}>
                  <Text style={[styles.itemTitle, { color: palette.text }]}>{getContentTitle(id)}</Text>
                  <Text style={[styles.caption, { color: palette.muted }]}>Continue reading</Text>
                </View>
                <Text style={[styles.recentArrow, { color: palette.primary }]} accessibilityElementsHidden>›</Text>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.body, { color: palette.muted }]}>Recently opened items will appear here on this device.</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Verification before publication</Text>
          {verificationChecklist.map((item) => (
            <Text key={item} style={[styles.body, { color: palette.muted }]}>•  {item}</Text>
          ))}
          <Text style={[styles.caption, { color: palette.warning }]}>
            Islamic date is not displayed because no trusted regional calendar source is configured.
          </Text>
        </View>
      </ScrollView>
    );
  }

  function renderQuran() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Holy Quran</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            The full Quran text is not installed. These are sample surah metadata only; no verse text is being shown as complete or verified.
          </Text>
          {renderSearchBox('Search sample surah names or number')}
          {filteredSurahs.length ? filteredSurahs.map((surah) => {
            const id = `quran:${surah.id}`;
            return (
              <View
                key={id}
                style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
              >
                <Text style={[styles.number, { color: palette.accent }]}>{surah.id.toString().padStart(2, '0')}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${surah.englishName} metadata`}
                  onPress={() => markRecentlyRead(id)}
                  style={styles.flex}
                >
                  <Text style={[styles.arabicTitle, { color: palette.text }]}>{surah.arabicName}</Text>
                  <Text style={[styles.body, { color: palette.text }]}>{surah.englishName}</Text>
                  <Text style={[styles.caption, { color: palette.muted }]}>{surah.verses} ayahs · sample metadata</Text>
                </Pressable>
                {renderBookmarkButton(id)}
              </View>
            );
          }) : <EmptyState text="No matching surah metadata." color={palette.muted} />}
        </View>
      </ScrollView>
    );
  }

  function renderLibrary() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Duas, ziyarat & Sahifa</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Catalog entries are references for a future import. Their sacred text, translation and audio are not included until verified and licensed.
          </Text>
          {renderSearchBox('Search library titles and sources')}
          {filteredDuas.length ? filteredDuas.map((dua) => {
            const id = `dua:${dua.id}`;
            return (
              <View
                key={dua.id}
                style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${dua.title} source metadata`}
                  onPress={() => markRecentlyRead(id)}
                  style={styles.flex}
                >
                  <Text style={[styles.itemTitle, { color: palette.text }]}>{dua.title}</Text>
                  <Text style={[styles.caption, { color: palette.muted }]}>{dua.category} · {dua.source}</Text>
                  <Text style={[styles.caption, { color: palette.warning }]}>{dua.status} · text unavailable</Text>
                </Pressable>
                {renderBookmarkButton(id)}
              </View>
            );
          }) : <EmptyState text="No matching library entries." color={palette.muted} />}
          <Text style={[styles.subheading, { color: palette.text }]}>Ziyarat texts</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            No ziyarat text is published in this build. Verified editions and permissions must be added before release.
          </Text>
        </View>
      </ScrollView>
    );
  }

  function renderGuides() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Prayer & practical guides</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Guides remain unpublished until checked against documented rulings. Select a marja and qualified reviewer before enabling instructions.
          </Text>
          {filteredGuides.map((item) => (
            <View key={item.id} style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
              <View style={styles.flex}>
                <Text style={[styles.itemTitle, { color: palette.text }]}>{item.title}</Text>
                <Text style={[styles.caption, { color: palette.muted }]}>{item.detail}</Text>
                <Text style={[styles.caption, { color: palette.warning }]}>Awaiting verified content</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderCalendar() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Islamic calendar & Amaal</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            No date is shown as confirmed. Moon-sighting dates depend on region and religious authority; the following are category examples, not a dated schedule.
          </Text>
          {filteredEvents.map((event) => (
            <View key={event.id} style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
              <View style={styles.flex}>
                <Text style={[styles.itemTitle, { color: palette.text }]}>{event.name}</Text>
                <Text style={[styles.caption, { color: palette.warning }]}>{event.date}</Text>
                <Text style={[styles.caption, { color: palette.muted }]}>{event.note}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderBookmarks() {
    const savedItems = data.bookmarks;
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Saved items</Text>
          <Text style={[styles.body, { color: palette.muted }]}>Bookmarks are stored on this device; account sync is not configured.</Text>
          {savedItems.length ? savedItems.map((id) => (
            <View key={id} style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
              <Text style={[styles.body, styles.flex, { color: palette.text }]}>{getContentTitle(id)}</Text>
              {renderBookmarkButton(id)}
            </View>
          )) : <EmptyState text="You haven’t saved any items yet." color={palette.muted} />}
        </View>
      </ScrollView>
    );
  }

  function renderTasbeeh() {
    const goalMet = validTarget && data.count >= countTarget;
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Tasbeeh counter</Text>
          <Text style={[styles.caption, { textAlign: 'center', color: palette.muted }]}>Your personal counter · saved on this device</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.counter, { color: palette.primary }]}>{data.count}</Text>
          <Text style={[styles.body, { textAlign: 'center', color: goalMet ? palette.primary : palette.muted }]}>
            {validTarget ? `${Math.min(data.count, countTarget)} of ${countTarget}` : 'Enter a valid target to track progress'}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: palette.surfaceAlt }]}>
            <View style={[styles.progressFill, {
              width: `${validTarget ? Math.min(100, (data.count / countTarget) * 100) : 0}%`,
              backgroundColor: palette.primary,
            }]} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increment tasbeeh counter"
            onPress={() => setData((previous) => ({ ...previous, count: previous.count + 1 }))}
            style={[styles.primaryButton, { backgroundColor: palette.primary }]}
          >
            <Text style={styles.primaryButtonText}>Count</Text>
          </Pressable>
          <TextInput
            accessibilityLabel="Tasbeeh target"
            value={targetDraft}
            onChangeText={(value) => setTargetDraft(value.replace(/[^0-9]/g, '').slice(0, 6))}
            onBlur={() => {
              const parsedTarget = Number.parseInt(targetDraft, 10);
              if (Number.isInteger(parsedTarget) && parsedTarget > 0) {
                setData((previous) => ({ ...previous, target: String(parsedTarget) }));
                setTargetDraft(String(parsedTarget));
              } else {
                setTargetDraft(data.target);
              }
            }}
            keyboardType="number-pad"
            placeholder="Target (for example, 33)"
            placeholderTextColor={palette.muted}
            style={[styles.input, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, color: palette.text }]}
          />
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() =>
                setData((previous) => ({
                  ...previous,
                  savedSessions: [
                    { id: `${Date.now()}`, count: previous.count, target: Number.parseInt(previous.target, 10), savedAt: new Date().toLocaleString() },
                    ...previous.savedSessions,
                  ].slice(0, 20),
                }))
              }
              style={[styles.secondaryButton, { borderColor: palette.border }]}
            >
              <Text style={{ color: palette.primary, fontWeight: '700' }}>Save session</Text>
            </Pressable>
            <Pressable
              onPress={() => setResetConfirmation(true)}
              style={[styles.secondaryButton, { borderColor: palette.border }]}
            >
              <Text style={{ color: palette.danger, fontWeight: '700' }}>Reset</Text>
            </Pressable>
          </View>
          {resetConfirmation ? (
            <View style={[styles.confirmBox, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
              <Text style={[styles.body, { color: palette.text }]}>Reset the current count? Saved sessions will remain unchanged.</Text>
              <View style={styles.buttonRow}>
                <Pressable onPress={() => setResetConfirmation(false)} style={[styles.secondaryButton, { borderColor: palette.border }]}>
                  <Text style={{ color: palette.text, fontWeight: '700' }}>Keep count</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setData((previous) => ({ ...previous, count: 0 }));
                    setResetConfirmation(false);
                  }}
                  style={[styles.secondaryButton, { borderColor: palette.danger }]}
                >
                  <Text style={{ color: palette.danger, fontWeight: '700' }}>Confirm reset</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <Text style={[styles.subheading, { color: palette.text }]}>Saved sessions</Text>
          {data.savedSessions.length ? data.savedSessions.map((session) => (
            <View key={session.id} style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
              <View style={styles.flex}>
                <Text style={[styles.body, { color: palette.text }]}>{session.count} counts · target {session.target}</Text>
                <Text style={[styles.caption, { color: palette.muted }]}>{session.savedAt}</Text>
              </View>
            </View>
          )) : <Text style={[styles.caption, { color: palette.muted }]}>No saved sessions.</Text>}
        </View>
      </ScrollView>
    );
  }

  function renderSettings() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Settings</Text>
          <SettingRow label="Dark appearance" description="Change the colors used on this device." value={data.darkMode} onValueChange={(darkMode) => setData((previous) => ({ ...previous, darkMode }))} textColor={palette.text} mutedColor={palette.muted} />
          <SettingRow label="Reminder preference" description="This saves your preference only; scheduled notifications are not connected yet." value={data.notificationsEnabled} onValueChange={(notificationsEnabled) => setData((previous) => ({ ...previous, notificationsEnabled }))} textColor={palette.text} mutedColor={palette.muted} />
          <View style={[styles.listItem, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
            <View style={styles.flex}>
              <Text style={[styles.itemTitle, { color: palette.text }]}>Offline content</Text>
              <Text style={[styles.caption, { color: palette.muted }]}>Downloads are not available until verified content packages are prepared.</Text>
            </View>
            <Text style={[styles.status, { color: palette.warning }]}>Not ready</Text>
          </View>
          <Text style={[styles.caption, { color: palette.muted }]}>Arabic, Urdu, English and Roman Urdu may be shown only when verified content exists.</Text>
          <Text style={[styles.caption, { color: palette.muted }]}>Account sync and content administration are not connected in this local build.</Text>
        </View>
      </ScrollView>
    );
  }

  function renderSearch() {
    return (
      <ScrollView style={styles.screenScroll} contentContainerStyle={styles.page}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.heading, { color: palette.text }]}>Search the library</Text>
          {renderSearchBox('Search Quran metadata and library titles')}
          <Text style={[styles.subheading, { color: palette.text }]}>Quran metadata</Text>
          {filteredSurahs.map((surah) => (
            <Text key={surah.id} style={[styles.body, { color: palette.muted }]}>{surah.id}. {surah.englishName} · metadata only</Text>
          ))}
          <Text style={[styles.subheading, { color: palette.text }]}>Dua library</Text>
          {filteredDuas.map((dua) => (
            <Text key={dua.id} style={[styles.body, { color: palette.muted }]}>{dua.title} · {dua.status}</Text>
          ))}
          <Text style={[styles.subheading, { color: palette.text }]}>Guides and calendar metadata</Text>
          {filteredGuides.map((guide) => (
            <Text key={guide.id} style={[styles.body, { color: palette.muted }]}>{guide.title} · awaiting verification</Text>
          ))}
          {filteredEvents.map((event) => (
            <Text key={event.id} style={[styles.body, { color: palette.muted }]}>{event.name} · date not confirmed</Text>
          ))}
          {!filteredSurahs.length && !filteredDuas.length && !filteredGuides.length && !filteredEvents.length ? (
            <EmptyState text="No results found." color={palette.muted} />
          ) : null}
        </View>
      </ScrollView>
    );
  }

  const screenTitle = navigation.find((item) => item.href === pathname)?.label ?? 'Search';
  let content: React.ReactNode;
  switch (screen) {
    case 'quran':
      content = renderQuran();
      break;
    case 'library':
      content = renderLibrary();
      break;
    case 'guides':
      content = renderGuides();
      break;
    case 'calendar':
      content = renderCalendar();
      break;
    case 'bookmarks':
      content = renderBookmarks();
      break;
    case 'tasbeeh':
      content = renderTasbeeh();
      break;
    case 'settings':
      content = renderSettings();
      break;
    case 'search':
      content = renderSearch();
      break;
    default:
      content = renderHome();
  }

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: palette.background }])}>
      <StatusBar style={data.darkMode ? 'light' : 'dark'} />
      <View style={[styles.topBar, { backgroundColor: palette.background, borderColor: palette.border }]}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/')}>
          <Text style={[styles.brand, { color: palette.primary }]}>Noor-e-Hidayat</Text>
        </Pressable>
        <Text style={[styles.topMeta, { color: palette.muted }]}>{screenTitle}</Text>
      </View>
      {storageError ? (
        <View accessibilityRole="alert" style={[styles.storageNotice, { backgroundColor: palette.surfaceAlt }]}>
          <Text style={[styles.caption, { color: palette.warning }]}>{storageError}</Text>
        </View>
      ) : null}
      {!ready ? (
        <View style={styles.loading}>
          <Text style={[styles.body, { color: palette.muted }]}>Loading your saved preferences…</Text>
        </View>
      ) : content}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.navBar, { backgroundColor: palette.surface, borderColor: palette.border }]}
      >
        {navigation.map((item) => (
          <Pressable
            key={item.href}
            accessibilityRole="link"
            accessibilityState={{ selected: pathname === item.href }}
            onPress={() => router.push(item.href)}
            style={StyleSheet.flatten([
              styles.navButton,
              pathname === item.href && { backgroundColor: palette.primary },
            ])}
          >
            <Text style={[styles.navLabel, { color: pathname === item.href ? '#ffffff' : palette.text }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.body, { color, paddingVertical: 12 }]}>{text}</Text>;
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
  textColor,
  mutedColor,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.flex}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{label}</Text>
        <Text style={[styles.caption, { color: mutedColor }]}>{description}</Text>
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} />
    </View>
  );
}

function getContentTitle(id: string) {
  if (id.startsWith('quran:')) {
    const surah = quranSurahs.find((item) => item.id === Number.parseInt(id.slice(6), 10));
    return surah ? `${surah.englishName} · Quran metadata` : 'Quran item';
  }

  if (id.startsWith('dua:')) {
    return duaLibrary.find((item) => item.id === id.slice(4))?.title ?? 'Library item';
  }

  return id;
}

function getContentRoute(id: string): '/quran' | '/library' {
  return id.startsWith('quran:') ? '/quran' : '/library';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    minHeight: 62,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { fontSize: 20, fontWeight: '800' },
  topMeta: { fontSize: 13, fontWeight: '600' },
  storageNotice: { paddingHorizontal: 18, paddingVertical: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screenScroll: { flex: 1 },
  page: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 18, paddingBottom: 34, gap: 16 },
  hero: { borderRadius: 22, padding: 24, gap: 10 },
  eyebrowLight: { color: '#d4eadd', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: '#ffffff', fontSize: 32, fontWeight: '800' },
  heroBody: { color: '#e3f0e8', fontSize: 15, lineHeight: 23, maxWidth: 560 },
  heroPill: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 999, backgroundColor: '#ffffff22', paddingHorizontal: 12, paddingVertical: 7 },
  heroPillText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  heroAction: { minHeight: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  heroActionText: { fontSize: 13, fontWeight: '800' },
  notice: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  noticeTitle: { fontSize: 16, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  heading: { fontSize: 21, fontWeight: '800' },
  subheading: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', flexGrow: 1, minWidth: 142, borderWidth: 1, borderRadius: 14, padding: 13, gap: 6 },
  tileTitle: { fontSize: 14, fontWeight: '700' },
  tileBody: { fontSize: 11, lineHeight: 16 },
  status: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  textButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15 },
  listItem: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentItem: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentArrow: { fontSize: 24, fontWeight: '600' },
  number: { width: 32, fontSize: 18, fontWeight: '800' },
  arabicTitle: { fontSize: 24, textAlign: 'right' },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  flex: { flex: 1, gap: 4 },
  smallButton: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  counter: { fontSize: 64, lineHeight: 76, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  progressTrack: { height: 9, borderRadius: 99, overflow: 'hidden', marginVertical: 4 },
  progressFill: { height: '100%', borderRadius: 99 },
  primaryButton: { minHeight: 58, justifyContent: 'center', alignItems: 'center', borderRadius: 15, marginVertical: 6 },
  primaryButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 17 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  secondaryButton: { minHeight: 44, flex: 1, minWidth: 125, borderWidth: 1, borderRadius: 11, justifyContent: 'center', alignItems: 'center', padding: 10 },
  confirmBox: { borderWidth: 1, borderRadius: 13, padding: 12, gap: 10 },
  settingRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#8a9a90', paddingVertical: 9 },
  navBar: { borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 9, alignItems: 'center', gap: 8 },
  navButton: { borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  navLabel: { fontSize: 12, fontWeight: '700' },
});
