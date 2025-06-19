import React, { JSX } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Package, Users } from 'lucide-react-native';

export type TabConfig = {
  key: string;
  label: string;
  icon: (props: { size: number; color: string }) => JSX.Element;
};

type Props = {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  tabs?: TabConfig[];
  styles: any;
};

const defaultTabs: TabConfig[] = [
  {
    key: 'products',
    label: 'Products',
    icon: ({ size, color }) => <Package size={size} color={color} />,
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: ({ size, color }) => <Users size={size} color={color} />,
  },
];

export const Tabs = ({
  selectedTab,
  setSelectedTab,
  tabs = defaultTabs,
  styles,
}: Props) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
          onPress={() => setSelectedTab(tab.key)}
        >
          {tab.icon({
            size: 20,
            color: selectedTab === tab.key ? '#8B5CF6' : '#6B7280',
          })}
          <Text
            style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Tabs;