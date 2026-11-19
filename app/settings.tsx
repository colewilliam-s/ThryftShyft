import { useRouter } from 'expo-router';
import { LocationForm } from '../src/profile/LocationForm';

export default function SettingsScreen() {
    const router = useRouter();
    return (
        <LocationForm mode='settings' onDone={() => router.replace('/profile')} />
    );
}