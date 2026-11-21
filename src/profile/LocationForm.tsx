// One form, two uses:
//   mode='setup'    -> app/setup-location.tsx, shown once after profile creation
//   mode='settings' -> the Location section of your settings screen

import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, ScrollView, View } from 'react-native';
import * as Location from 'expo-location';
import { useSession } from '../session/SessionProvider';
import { useStyles } from './styles';
import { Text, useTheme } from '../theme';

import { confirm } from './ConfirmPopup';
import { fetchMyLocation, fetchCampusSpots, saveMyLocation, clearMyLocation, markLocationPrompted, type CampusSpot, type MyLocation, } from './LocationApi';


type Props = {
  mode: 'setup' | 'settings';
  onDone: () => void;
};

type Place = 'campus' | 'off_campus';
type Visibility = 'community' | 'public';

// can ask means the OS prompt can still be shown, if blocked than only the phone's settings can fix it
type Perm = 'checking' | 'granted' | 'canAsk' | 'blocked';

const UNDISCLOSED = 'undisclosed';

// Round to 2 decimals (about 1 km) before the coordinates leave the phone.
// The database should round again
const round = (n: number) => Math.round(n * 100) / 100;

async function readPermission(): Promise<Perm> {
  const p = await Location.getForegroundPermissionsAsync();
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'canAsk' : 'blocked';
}

export function LocationForm({ mode, onDone }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { session, profile, refreshProfile } = useSession();
  const userId = session?.user.id;
  const domain = profile?.university_domain ?? null;

  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<MyLocation | null>(null);
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [perm, setPerm] = useState<Perm>('checking');

  const [visibility, setVisibility] = useState<Visibility>('community'); // never default to public
  const [place, setPlace] = useState<Place | null>(null);
  const [spotId, setSpotId] = useState<string | null>(null); // UNDISCLOSED = "prefer not to say"
  const [spotListOpen, setSpotListOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load the saved setting and this campus's spots
  useEffect(() => {
    if (!userId) return;
    Promise.all([fetchMyLocation(userId), domain ? fetchCampusSpots(domain) : Promise.resolve([])])
      .then(([loc, campusSpots]) => {
        setCurrent(loc);
        setSpots(campusSpots);
        if (loc && loc.visibility !== 'off') setVisibility(loc.visibility);
        if (loc?.source === 'campus_spot') {
          setPlace('campus');
          setSpotId(loc.spot_id ?? UNDISCLOSED);
        } else if (loc?.source === 'device') {
          setPlace('off_campus');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, domain]);

  // Read the OS permission now, and again whenever the app returns to the foreground,
  // so a permission revoked from the phone's settings is noticed.
  useEffect(() => {
    let alive = true;
    const check = () => readPermission().then((p) => alive && setPerm(p)).catch(() => { });
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  //gets use rdeive location depending on permissions in place
  async function getDeviceLocation() {
    setError('');
    setLocating(true);
    try {
      let p = await readPermission();
      if (p === 'canAsk') {
        await Location.requestForegroundPermissionsAsync();
        p = await readPermission();
      }
      setPerm(p);
      if (p !== 'granted') {
        // point them at the no-permission option
        setError('Location permission is off. You can choose a campus spot instead.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: round(pos.coords.latitude), lng: round(pos.coords.longitude) });
      setPlace('off_campus');
      setSpotId(null);
    } catch {
      setError('Could not get your location. Try again, or choose a campus spot.');
    } finally {
      setLocating(false);
    }
  }

  //checks to see if form was submitted correctly 
  async function handleSave() {
    setError('');
    if (!place) return setError('Choose where you are, or skip for now.');
    if (place === 'campus' && !spotId) return setError('Pick a spot, or choose "Prefer not to say".');
    if (place === 'off_campus' && !coords && current?.source !== 'device') {
      return setError('Tap "Use my current location" first.');
    }

    if (mode === 'settings') {
      const ok = await confirm('Update your location?', 'This replaces your saved location and visibility.');
      if (!ok) return;
    }

    setSaving(true);
    try {
      // The server clears whichever source (device or campus spot) you are not using now.
      // lat/lng null + source 'device' means "keep my existing saved area, change visibility only".
      await saveMyLocation({
        visibility,
        source: place === 'campus' ? 'campus_spot' : 'device',
        spotId: place === 'campus' && spotId !== UNDISCLOSED ? spotId : null,
        lat: place === 'off_campus' ? coords?.lat ?? null : null,
        lng: place === 'off_campus' ? coords?.lng ?? null : null,
      });
      await refreshProfile();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your location.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTurnOff() {
    const ok = await confirm(
      'Turn off location sharing?',
      'Your saved location will be deleted. You can turn it back on anytime.',
    );
    if (!ok) return;
    setSaving(true);
    setError('');
    try {
      await clearMyLocation(); // one server call deletes everything and sets visibility to off
      await refreshProfile();
      setCurrent(null);
      setPlace(null);
      setSpotId(null);
      setCoords(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not turn off location sharing.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    try {
      await markLocationPrompted(); // so the setup screen is only shown once
      await refreshProfile();
    } finally {
      onDone();
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const selectedSpotLabel =
    spotId === UNDISCLOSED
      ? 'Prefer not to say'
      : spots.find((s) => s.id === spotId)?.name ?? 'Choose a spot';

  const savedSpotName = spots.find((s) => s.id === current?.spot_id)?.name;
  const summary =
    !current || current.visibility === 'off' ? 'Location sharing is off.'
      : `Sharing with ${current.visibility === 'public' ? 'everyone' : 'your community'}: ${current.source === 'device' ? 'approximate area' : savedSpotName ?? 'on campus'
      }`;




  //Listing Form layout for setup mode
  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior='automatic'
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps='handled'
    >
      {/* Explain to the user how location is used and why */}
      {mode === 'setup' ? (
        <>
          <Text style={styles.formTitle}>Find listings near you</Text>

          <Text style={styles.label}>What you get</Text>
          <Text style={styles.hint}>• Listings sorted nearest first</Text>
          <Text style={styles.hint}>• How far away each item is (rough distance only)</Text>
          <Text style={styles.hint}>• Your listings show up in other people's nearby results</Text>

          <Text style={styles.label}>If you skip</Text>
          <Text style={styles.hint}>
            Everything else still works. Your feed is sorted by newest instead of distance, and you won't see or
            show distances.
          </Text>

          <Text style={styles.label}>Your privacy</Text>
          <Text style={styles.hint}>
            Others only see a rough distance, never your address or exact spot. You can turn this off anytime and
            your saved location is deleted.
          </Text>
        </>
      ) : (
        <Text style={styles.hint}>{summary}</Text>
      )}

      {/* WHERE ARE YOU: choice of off campus or on campus */}
      <Text style={styles.label}>Where are you?</Text>
      <View style={styles.chipRow}>
        <Pressable onPress={() => setPlace('campus')}>
          <Text style={place === 'campus' ? styles.chipSelected : styles.chip}>On campus</Text>
        </Pressable>
        <Pressable onPress={() => setPlace('off_campus')}>
          <Text style={place === 'off_campus' ? styles.chipSelected : styles.chip}>Off campus</Text>
        </Pressable>
      </View>

      {/* if ON campus then gives you the option to choose and specific spot/dorm building from list dropdown*/}
      {place === 'campus' ? (
        <>
          <Text style={styles.label}>Campus spot</Text>
          <Pressable style={styles.dropdown} onPress={() => setSpotListOpen((o) => !o)}>
            <Text style={styles.dropdownText}>{selectedSpotLabel}</Text>
          </Pressable>
          {spotListOpen ? (
            <View style={styles.dropdownList}>
              <Pressable style={styles.dropdownOption} onPress={() => { setSpotId(UNDISCLOSED); setSpotListOpen(false); }}>
                <Text style={styles.dropdownOptionText}>Prefer not to say</Text>
              </Pressable>
              {spots.map((s) => (
                <Pressable key={s.id} style={styles.dropdownOption} onPress={() => { setSpotId(s.id); setSpotListOpen(false); }}>
                  <Text style={styles.dropdownOptionText}>{s.zone ? `${s.zone}: ${s.name}` : s.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {/* if OFF campus then gives you the option to use location, update or notifies if blocked */}
      {place === 'off_campus' ? (
        <>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { marginTop: 16 }, pressed && styles.pressed]}
            onPress={getDeviceLocation}
            disabled={locating}
          >
            <Text style={styles.primaryButtonText}>
              {locating ? 'Finding you...' : coords ? 'Update my current location' : 'Use my current location'}
            </Text>
          </Pressable>
          {coords || current?.source === 'device' ? (
            <Text style={styles.hint}>Approximate area saved (rounded to about a mile).</Text>
          ) : null}
          {perm === 'blocked' ? (
            <Pressable onPress={() => Linking.openSettings()}>
              <Text style={styles.photoAction}>Location is blocked. Open phone settings</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {/* WHO CAN SEE IT: choice of community or everyone for visibility */}
      <Text style={styles.label}>Who can see how far away you are?</Text>
      <View style={styles.chipRow}>
        <Pressable onPress={() => setVisibility('community')}>
          <Text style={visibility === 'community' ? styles.chipSelected : styles.chip}>My community</Text>
        </Pressable>
        <Pressable onPress={() => setVisibility('public')}>
          <Text style={visibility === 'public' ? styles.chipSelected : styles.chip}>Everyone</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>
        {visibility === 'community'
          ? 'Only members of your community who also share their location see a rough distance.'
          : 'Anyone on the app who shares their location sees a rough distance. Pick this only if you are comfortable with that.'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.primaryButton, styles.saveButton, pressed && styles.pressed]}
        onPress={handleSave}
        disabled={saving || locating}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Saving...' : mode === 'setup' ? 'Share my area' : 'Save'}
        </Text>
      </Pressable>

      {/* skip and turn off location buttons */}
      {mode === 'setup' ? (
        <Pressable onPress={handleSkip} hitSlop={8}>
          <Text style={styles.linkText}>Skip for now</Text>
        </Pressable>
      ) : current && current.visibility !== 'off' ? (
        <Pressable onPress={handleTurnOff} hitSlop={8} disabled={saving}>
          <Text style={styles.linkText}>Turn off location sharing</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}