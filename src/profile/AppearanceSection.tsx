import { Pressable, View } from 'react-native';
import { useStyles } from './styles';
import { Text } from '../theme';
import { useThemePreference, type ThemePreference } from '../theme/preference';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function AppearanceSection() {
  const styles = useStyles();
  const { preference, setPreference } = useThemePreference();

  return (
    <>
      <Text style={styles.label}>Appearance</Text>
      <View style={styles.chipRow}>
        {OPTIONS.map((o) => (
          <Pressable key={o.value} onPress={() => setPreference(o.value)}>
            <Text style={preference === o.value ? styles.chipSelected : styles.chip}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>System follows your phone's setting.</Text>
    </>
  );
}