import { useState } from 'react';
import { Modal, Pressable, View, ActivityIndicator, Alert } from 'react-native';
import { Text, makeStyles, useTheme } from '../theme';
import type { ReportReason } from './api';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or fake listing' },
  { value: 'scam', label: 'Scam or suspicious' },
  { value: 'inappropriate', label: 'Inappropriate or offensive' },
  { value: 'prohibited', label: 'Prohibited item' },
  { value: 'harassment', label: 'Harassment or hate' },
  { value: 'other', label: 'Something else' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => Promise<void>;
};

export function ReportModal({ visible, onClose, onSubmit }: Props) {
  const s = useStyles();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function choose(reason: ReportReason) {
    setBusy(true);
    setError('');
    try {
      await onSubmit(reason);
      onClose();
      Alert.alert('Report sent', 'Thanks for letting us know. We will review this listing.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your report.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.title}>Report this listing</Text>
          <Text style={s.subtitle}>Why are you reporting it?</Text>

          {REASONS.map((r) => (
            <Pressable
              key={r.value}
              style={({ pressed }) => [s.option, pressed && s.pressed]}
              onPress={() => choose(r.value)}
              disabled={busy}
            >
              <Text style={s.optionText}>{r.label}</Text>
            </Pressable>
          ))}

          {busy ? <ActivityIndicator style={s.spinner} color={colors.textMuted} /> : null}
          {error ? <Text style={s.error}>{error}</Text> : null}

          <Pressable onPress={onClose} style={s.cancel} hitSlop={8}>
            <Text style={s.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
  },
  title: { fontSize: 18, color: c.text, fontFamily: 'DMSans_700Bold' },
  subtitle: { fontSize: 14, color: c.textMuted, marginTop: 4, marginBottom: 8, fontFamily: 'DMSans_400Regular' },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  optionText: { fontSize: 16, color: c.text, fontFamily: 'DMSans_400Regular' },
  pressed: { opacity: 0.6 },
  spinner: { marginTop: 12 },
  error: { color: c.danger, marginTop: 12, textAlign: 'center' },
  cancel: { marginTop: 16, alignItems: 'center' },
  cancelText: { fontSize: 16, color: c.link, fontFamily: 'DMSans_500Medium' },
}));