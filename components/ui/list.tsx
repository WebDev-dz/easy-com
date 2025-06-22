import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, StyleProp, ViewStyle } from 'react-native';

type Props<T> = {
  data: T[];
  renderItem: (item: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  columnWrapperStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  horizontal?: boolean;
  numColumns?: number;
  contentContainerStyle?: any;
  style?: any;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
};

const RenderList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  columnWrapperStyle,
  refreshing = false,
  onRefresh,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  horizontal = false,
  numColumns = 1,
  contentContainerStyle,
  style,
  onScroll,
  scrollEventThrottle = 16,
  ...rest
}: Props<T>) => {
  const handleScroll = (event: any) => {
    if (onScroll) {
      onScroll(event);
    }

    if (onEndReached && data.length > 0) {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToEnd = (onEndReachedThreshold || 0.5) * (horizontal ? layoutMeasurement.width : layoutMeasurement.height);
      
      const scrollPosition = horizontal ? contentOffset.x : contentOffset.y;
      const containerSize = horizontal ? layoutMeasurement.width : layoutMeasurement.height;
      const contentSizeDimension = horizontal ? contentSize.width : contentSize.height;

      if (containerSize + scrollPosition >= contentSizeDimension - paddingToEnd) {
        onEndReached();
      }
    }
  };

  const renderItems = () => {
    if (data.length === 0) {
      if (ListEmptyComponent) {
        return React.isValidElement(ListEmptyComponent) 
          ? ListEmptyComponent 
          : React.createElement(ListEmptyComponent);
      }
      return null;
    }

    if (numColumns > 1 && !horizontal) {
      return data.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : `${index}`;
        return (
          <View key={key} style={{ width: `${100 / numColumns}%` }}>
            {renderItem({ item, index })}
          </View>
        );
      });
    }

    return data.map((item, index) => {
      const key = keyExtractor ? keyExtractor(item, index) : `${index}`;
      return (
        <View key={key}>
          {renderItem({ item, index })}
        </View>
      );
    });
  };

  const renderHeader = () => {
    if (!ListHeaderComponent) return null;
    return React.isValidElement(ListHeaderComponent) 
      ? ListHeaderComponent 
      : React.createElement(ListHeaderComponent);
  };

  const renderFooter = () => {
    if (!ListFooterComponent) return null;
    return React.isValidElement(ListFooterComponent) 
      ? ListFooterComponent 
      : React.createElement(ListFooterComponent);
  };

  const finalContentContainerStyle: StyleProp<ViewStyle>[] = [styles.contentContainer, contentContainerStyle];
  if (numColumns > 1 && !horizontal) {
    finalContentContainerStyle.push(styles.gridContainer);
    if (columnWrapperStyle) {
      finalContentContainerStyle.push(columnWrapperStyle);
    }
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={finalContentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      horizontal={horizontal}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
      }
      {...rest}
    >
      {renderHeader()}
      {renderItems()}
      {renderFooter()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default RenderList;