// app/setup-location.tsx
import { useRouter } from 'expo-router';
import { LocationForm } from './LocationForm';

export default function SetupLocationScreen() {
  const router = useRouter();
  return <LocationForm mode='setup' onDone={() => router.replace('/ProfileView')} />;
}