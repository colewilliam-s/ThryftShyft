import { StyleSheet } from 'react-native'
import { makeStyles } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10
  },
  pressed: {
    opacity: 0.7
  },
  rowText: {
    flex: 1
  },
  name: {
    fontSize: 15,
    color: '#111',
    fontFamily: 'DMSans_500Medium'
  },
  preview: {
    fontSize: 13,
    color: '#6b6b6b',
    fontFamily: 'DMSans_400Regular'
  },
  error: {
    color: 'red',
    marginBottom: 12
  },
  empty: {
    color: '#6b6b6b',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'DMSans_400Regular'
  },
});

export const useStyles = makeStyles((style) => ({
  container: {
    flex: 1,
    backgroundColor: style.background
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: style.background
  },
  name: {
    fontSize: 15,
    color: style.text,
    fontFamily: 'DMSans_500Medium'
  }
}));

export const useDmStyles = makeStyles((style) => ({
  container: {
    flex: 1,
    padding: 20,
    marginTop: '10%',
    backgroundColor: style.background
  }
}))