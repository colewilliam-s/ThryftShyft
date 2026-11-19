// Styling file for the home page

import { StyleSheet } from 'react-native';
import { makeStyles } from '../theme';

// Placeholder: greys until the colorscheme is decided
// Fonts are DM Sans, loaded in app/_layout.js

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  empty: {
    color: '#6b6b6b',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'DMSans_400Regular',
  },

  // One user's row
  row: {
    marginBottom: 20,
  },
  nameWrap: {
    alignSelf: 'flex-start', // only the name itself is tappable, not the full width
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    color: '#111',
    fontFamily: 'DMSans_500Medium',
  },
  tiles: {
    flexDirection: 'row',
    gap: 8, // if you change this, change TILE_GAP in UserRow.js too
  },

  // Thumbnails
  tile: {
    backgroundColor: '#efefef',
    borderRadius: 6, // placeholder: slight rounding
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(53, 53, 48)'
  },
  soldOverlay: {
    // placeholder: dim the whole photo and center "SOLD"
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: 'DMSans_700Bold',
  },
  moreTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  moreText: {
    color: '#6b6b6b',
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
  backButton: {
    backgroundColor: '#c0bdc1',
    paddingVertical: 13,
    borderRadius: 8,
    width: '45%',
    margin: 3,
  },
  backButtonText: {
    textAlign: 'center',
    fontWeight: 800
  },
  backButtonPressed: {
    opacity: 0.7
  },
  textBackButton: {
    backgroundColor: '#c0bdc1',
    paddingVertical: 13,
    borderRadius: 8,
    width: '15%',
    margin: 3,
  }
});

export const useStyles = makeStyles((style) => ({
  container: {
    flex: 1,
    backgroundColor: style.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: style.background,
  },
  error: {
    color: style.danger,
    marginBottom: 16,
  },
  empty: {
    color: style.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'DMSans_400Regular',
  },

  // one user's row
  row: {
    marginBottom: 20,
  },
  nameWrap: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    color: style.text,
    fontFamily: 'DMSans_500Medium',
  },
  tiles: {
    flexDirection: 'row',
    gap: 8, // if you change this, change TILE_GAP in UserRow.js as well
  },

  // Thumbnails
  tile: {
    backgroundColor: style.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: style.borderStrong,
  },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // dims the photo in both modes
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: 'DMSans_700Bold',
  },
  moreTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: style.border,
    backgroundColor: style.background,
  },
  moreText: {
    color: style.textMuted,
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },

  // Buttons
  backButton: {
    backgroundColor: style.buttonSecondary,
    paddingVertical: 13,
    borderRadius: 8,
    width: '45%',
    margin: 3,
  },
  backButtonText: {
    textAlign: 'center',
    fontWeight: '800',
    color: style.text,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  textBackButton: {
    backgroundColor: style.buttonSecondary,
    paddingVertical: 13,
    borderRadius: 8,
    width: '15%',
    margin: 3,
  },
}));