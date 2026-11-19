// settings.tsx  (just the location section for now)
import { useRouter } from 'expo-router';
import { LocationForm } from './LocationForm';

export default function SettingsScreen() {
  const router = useRouter();
  return <LocationForm mode='settings' onDone={() => router.back()} />;
}