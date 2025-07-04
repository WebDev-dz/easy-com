import { StyleSheet } from 'react-native';



export  const styles = StyleSheet.create({
    
   
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#111827',
    },
    headerStats: {
      alignItems: 'flex-end',
    },
    statsText: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      gap: 8,
    },
    activeTab: {
      borderBottomColor: '#8B5CF6',
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#6B7280',
    },
    activeTabText: {
      color: '#8B5CF6',
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 12,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#111827',
    },
    filterButton: {
      backgroundColor: '#8B5CF6',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: 12,
    },
    productsGrid: {
      flexDirection: 'row',
      marginVertical: 8,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 0,
    },
    discountBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: '#EF4444',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    discountText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    newBadge: {
      position: 'absolute',
      top: 8,
      right: 40,
      backgroundColor: '#10B981',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    newText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    suppliersContainer: {
      marginVertical: 8,
      gap: 16,
    },
    supplierCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    supplierHeader: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    supplierImageContainer: {
      position: 'relative',
      marginRight: 12,
    },
    supplierImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#10B981',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    supplierInfo: {
      flex: 1,
    },
    supplierTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    supplierName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      flex: 1,
    },
    supplierTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    supplierTypeBadge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    supplierTypeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    domainText: {
      fontSize: 12,
      color: '#6B7280',
      fontStyle: 'italic',
    },
    supplierDescription: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
    },
    shareButton: {
      padding: 8,
    },
    supplierDetails: {
      gap: 12,
    },
    supplierMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    metricItem: {
      alignItems: 'flex-start',
    },
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metricText: {
      fontSize: 12,
      color: '#6B7280',
    },
    metricLabel: {
      fontSize: 10,
      color: '#9CA3AF',
      marginTop: 2,
    },
    supplierRatingText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#111827',
      marginLeft: 4,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    locationText: {
      fontSize: 12,
      color: '#6B7280',
      flex: 1,
    },
    supplierActions: {
      flexDirection: 'row',
      gap: 8,
    },
    contactButton: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    ordersButton: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    contactButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6B7280',
    },
    ordersButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6B7280',
    },
    viewProductsButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#8B5CF6',
      borderRadius: 8,
      paddingVertical: 10,
      gap: 6,
    },
    viewProductsButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      width: '100%',
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#6B7280',
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: '#9CA3AF',
      marginTop: 4,
    },
    errorText: {
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      fontWeight: '500',
    },
    container: {
      backgroundColor: 'red',
      paddingVertical: 0,
        paddingHorizontal: 0,
        marginBottom: 24
    
      },
      scrollContainer: {
        paddingVertical: 0,
        height: '100%',
        flexGrow: 1,
        backgroundColor: '#F9FAFB',
      },
      header: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        padding: 24,
        paddingTop: 32,
      },
      profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
      },
      editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      },
      userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
      },
      userEmail: {
        fontSize: 16,
        color: '#6B7280',
      },
      userInfoCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      },
      infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
      },
      infoContent: {
        marginLeft: 16,
        flex: 1,
      },
      infoLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
      },
      infoValue: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
      },
      statsContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      },
      statItem: {
        alignItems: 'center',
      },
      statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
      },
      statLabel: {
        fontSize: 12,
        color: '#6B7280',
      },
      statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
      },
      menuContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      },
      menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      },
      menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      },
      menuContent: {
        flex: 1,
      },
      menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
      },
      menuSubtitle: {
        fontSize: 12,
        color: '#6B7280',
      },
      logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      },
      logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
      },
      footer: {
        alignItems: 'center',
        padding: 24,
      },
      footerText: {
        fontSize: 12,
        color: '#9CA3AF',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
      },
      loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
      },
  });