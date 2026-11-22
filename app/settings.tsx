import { useRouter } from 'expo-router';
import { LocationForm } from '../src/profile/LocationForm';
import { AppearanceSection } from '../src/profile/AppearanceSection';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <LocationForm
      mode='settings'
      topContent={<AppearanceSection />}
      onDone={() => router.replace('/profile')}
    />
  );
}