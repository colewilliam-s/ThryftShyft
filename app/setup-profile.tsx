// First-time profile setup. app/_layout.tsx sends new users here until their profile is finished.

import { Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../src/supabase';
import { ProfileForm } from '../src/profile/ProfileForm';
import { styles } from '../src/profile/styles';
import { useRouter } from 'expo-router';


export default function SetupProfile() {
  const router = useRouter();
  return (
    // this screen has no header, so keep it clear of the notch and home bar
    <SafeAreaView style={styles.container}>

      {/* Now after saving, routes to location setup page */}
      <ProfileForm title='Create your profile' saveLabel='Continue' onSaved={() => router.replace('../src/profile/SetupLocation')} />  

      {/* a way out in case the wrong account is logged in */}
      <Pressable onPress={() => supabase.auth.signOut()} hitSlop={8} style={styles.setupLogout}>
        <Text style={styles.setupLogoutText}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
