// Styling file for the profile pages and the profile form

import { StyleSheet } from 'react-native';
import { makeStyles } from '../theme'

// Placeholder: greys until the visual identity is decided.
// Fonts are DM Sans, loaded in app/_layout.tsx

export const GRID_COLUMNS = 3;
export const GRID_GAP = 4; // placeholder: space between grid tiles
export const SIDE_PADDING = 16;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 12,
    fontFamily: 'DMSans_400Regular',
  },

  // Avatar: blank grey circle when there's no photo
  avatar: {
    backgroundColor: '#e5e5e5',
    borderStyle: 'solid',
    borderWidth: 3
  },

  // Profile header
  header: {
    alignItems: 'center', // placeholder: centered layout
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  displayName: {
    fontSize: 15,
    color: '#111',
    fontFamily: 'DMSans_700Bold',
  },
  fullName: {
    fontSize: 22,
    color: '#111',
    fontFamily: 'DMSans_500Medium',
    fontWeight: 800,
    marginTop: 12
  },
  detail: {
    fontSize: 14,
    color: '#6b6b6b',
    fontFamily: 'DMSans_400Regular',
  },

  // Listings grid
  gridContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 32,
    flexGrow: 1,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridItem: {
    marginBottom: GRID_GAP,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgb(53, 53, 48)'
  },
  empty: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 12,
  },
  emptyText: {
    color: '#6b6b6b',
    fontFamily: 'DMSans_400Regular',
  },

  // Buttons. Placeholder colors.
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  linkText: {
    color: '#6b6b6b',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 44,
    fontFamily: 'DMSans_400Regular',
    fontSize: 19
  },
  pressed: {
    opacity: 0.7,
  },

  // Profile form
  formContent: {
    padding: 20,
    paddingBottom: 48,
  },
  formTitle: {
    fontSize: 24,
    color: '#111',
    marginBottom: 20,
    marginTop: 24,
    fontFamily: 'DMSans_700Bold',
  },
  photoPicker: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 20,
  },
  photoAction: {
    color: '#111',
    textDecorationLine: 'underline',
    fontFamily: 'DMSans_500Medium',
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginTop: 16,
    marginBottom: 6,
    fontFamily: 'DMSans_500Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
    fontFamily: 'DMSans_400Regular',
  },
  hint: {
    fontSize: 12,
    color: '#9a9a9a',
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    marginRight: 12,
    fontFamily: 'DMSans_400Regular',
  },
  saveButton: {
    marginTop: 28,
  },
  setupLogout: {
    paddingVertical: 12,
  },
  setupLogoutText: {
    color: '#6b6b6b',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'DMSans_400Regular',
  },
  messageIcon: {
    margin: 5
  },
  chatButton: {
    backgroundColor: '#9e9b9b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    opacity: .5,
    width: '35%'
  },

  // set location form
  // Chips (category, condition, On/Off campus, visibility)
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
    overflow: 'hidden', // lets borderRadius apply to Text on iOS
  },
  chipSelected: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    color: '#fff',
    fontSize: 14,
    overflow: 'hidden',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Campus spot dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#111',
  }
  
});

export const useStyles = makeStyles((style) => ({
  container: {
    flex: 1,
    backgroundColor: style.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: style.background,
  },
  error: {
    color: style.danger,
    textAlign: 'center',
    marginVertical: 12,
    fontFamily: 'DMSans_400Regular',
  },

  // Avatar: blank circle when there's no photo
  avatar: {
    backgroundColor: style.border,
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: style.borderStrong, // it had no color before, so it defaulted to black
  },

  // Profile header
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  displayName: {
    fontSize: 15,
    color: style.text,
    fontFamily: 'DMSans_700Bold',
  },
  fullName: {
    fontSize: 22,
    color: style.text,
    fontFamily: 'DMSans_500Medium',
    fontWeight: '800',
    marginTop: 12,
  },
  detail: {
    fontSize: 14,
    color: style.textMuted,
    fontFamily: 'DMSans_400Regular',
  },

  // Listings grid
  gridContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 32,
    flexGrow: 1,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridItem: {
    marginBottom: GRID_GAP,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: style.borderStrong,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 12,
  },
  emptyText: {
    color: style.textMuted,
    fontFamily: 'DMSans_400Regular',
  },

  // Buttons
  primaryButton: {
    backgroundColor: style.buttonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: style.buttonPrimaryText,
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: style.inputBorder,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: style.text,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  linkText: {
    color: style.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 44,
    fontFamily: 'DMSans_400Regular',
    fontSize: 19,
  },
  pressed: {
    opacity: 0.7,
  },

  // Forms
  formContent: {
    padding: 20,
    paddingBottom: 48,
  },
  formTitle: {
    fontSize: 24,
    color: style.titleText,
    marginBottom: 20,
    marginTop: 24,
    fontFamily: 'DMSans_700Bold',
  },
  photoPicker: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 20,
  },
  photoAction: {
    color: style.text,
    textDecorationLine: 'underline',
    fontFamily: 'DMSans_500Medium',
  },
  label: {
    fontSize: 13,
    color: style.textMuted,
    marginTop: 16,
    marginBottom: 6,
    fontFamily: 'DMSans_500Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: style.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: style.text,
    fontFamily: 'DMSans_400Regular',
  },
  hint: {
    fontSize: 12,
    color: style.textMuted,
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: style.text,
    marginRight: 12,
    fontFamily: 'DMSans_400Regular',
  },
  saveButton: {
    marginTop: 28,
  },
  setupLogout: {
    paddingVertical: 12,
  },
  setupLogoutText: {
    color: style.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontFamily: 'DMSans_400Regular',
  },
  messageIcon: {
    margin: 5,
  },
  chatButton: {
    backgroundColor: style.buttonSecondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.5,
    width: '35%',
  },

  // Location form: chips (On/Off campus, visibility)
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: style.inputBorder,
    backgroundColor: style.background,
    color: style.text,
    fontSize: 14,
    overflow: 'hidden', // lets borderRadius apply to Text on iOS
  },
  chipSelected: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: style.buttonPrimary,
    backgroundColor: style.buttonPrimary,
    color: style.buttonPrimaryText,
    fontSize: 14,
    overflow: 'hidden',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Campus spot dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: style.inputBorder,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: style.background,
  },
  dropdownText: {
    fontSize: 16,
    color: style.text,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: style.inputBorder,
    borderRadius: 8,
    backgroundColor: style.background,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: style.border,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: style.text,
  },
}));