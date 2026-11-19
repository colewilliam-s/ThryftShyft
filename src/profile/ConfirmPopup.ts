
// Helper, confirm(title, message): Promise<boolean>

// One confirmation popup for the whole app.
// Web uses window.confirm instead of Alert.alert

import { Alert, Platform } from 'react-native';

export function confirm(title: string, message: string, confirmLabel = 'Continue'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, onPress: () => resolve(true) },
      ],
      // Android: tapping outside the dialog or pressing back counts as cancel
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}


