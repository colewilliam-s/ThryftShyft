// goes back if there is a screen to go back to, otherwise to a fallback route

import { useRouter } from 'expo-router';

export function useSafeBack(fallback: '/homepage' | '/' | '/connect' = '/homepage') {
    const router = useRouter();
    return () => {
        if (router.canGoBack()) router.back();
        else router.replace(fallback);
    };
}