// One square listing photo, plus the "more" tile that ends a row

import { Pressable, Image, View, Text } from 'react-native';
import { useStyles } from './styles';
import type { Listing } from '../types';

type ThumbnailProps = {
  listing: Pick<Listing, 'image_url' | 'status'>;
  size: number;
  onPress: () => void;
};

// Fills the tile. Written out because StyleSheet.absoluteFill may not stay available in newer React Native.
const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

export function ItemThumbnail({ listing, size, onPress }: ThumbnailProps) {
  const styles = useStyles();

  return (
    <Pressable onPress={onPress} style={[styles.tile, { width: size, height: size }]}>
      {listing.image_url ? (
        <Image source={{ uri: listing.image_url }} style={fill} />
      ) : null}
      {listing.status === 'sold' ? (
        <View style={styles.soldOverlay}>
          <Text style={styles.soldText}>SOLD</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// handling if there is too many tiles
export function MoreTile({ size, onPress }: { size: number; onPress: () => void }) {
  const styles = useStyles();

  return (
    <Pressable onPress={onPress} style={[styles.tile, styles.moreTile, { width: size, height: size }]}>
      <Text style={styles.moreText}>...</Text>
    </Pressable>
  );
}