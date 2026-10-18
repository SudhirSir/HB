import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { AuthAuditLog } from '@/types/auth';
import { Badge } from './Badge';

interface AuditTableProps {
  logs: AuthAuditLog[];
  maxEntries?: number;
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs, maxEntries = 10 }) => {
  const displayLogs = logs.slice(0, maxEntries);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    } catch {
      return isoString;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No authentication records recorded yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollWrapper}>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headerCell, { width: 100 }]}>Status</Text>
          <Text style={[styles.headerCell, { width: 230 }]}>Account</Text>
          <Text style={[styles.headerCell, { width: 120 }]}>Domain</Text>
          <Text style={[styles.headerCell, { width: 90 }]}>Client</Text>
          <Text style={[styles.headerCell, { width: 150 }]}>Timestamp</Text>
          <Text style={[styles.headerCell, { width: 240 }]}>Policy Result</Text>
        </View>

        {/* Table Rows */}
        {displayLogs.map((log) => {
          const isAllowed = log.status === 'ALLOWED';
          return (
            <View key={log.id} style={styles.row}>
              <View style={{ width: 100 }}>
                <Badge
                  label={isAllowed ? 'Allowed' : 'Blocked'}
                  variant={isAllowed ? 'success' : 'danger'}
                  showDot
                />
              </View>

              <Text style={[styles.cell, styles.emailCell, { width: 230 }]} numberOfLines={1}>
                {log.email}
              </Text>

              <Text style={[styles.cell, styles.domainCell, { width: 120 }]} numberOfLines={1}>
                @{log.domain}
              </Text>

              <View style={{ width: 90 }}>
                <Badge
                  label={log.platform || 'web'}
                  variant="neutral"
                />
              </View>

              <Text style={[styles.cell, styles.timeCell, { width: 150 }]}>
                {formatTime(log.timestamp)}
              </Text>

              <Text
                style={[
                  styles.cell,
                  styles.reasonCell,
                  { width: 240, color: isAllowed ? '#047857' : '#B91C1C' },
                ]}
                numberOfLines={1}
              >
                {isAllowed
                  ? `Access granted (${log.role || 'user'})`
                  : log.reason || 'Restricted domain mismatch'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollWrapper: {
    width: '100%',
  },
  table: {
    minWidth: 930,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cell: {
    fontSize: 13,
  },
  emailCell: {
    fontWeight: '500',
    color: '#0F172A',
  },
  domainCell: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: '#64748B',
    fontSize: 12,
  },
  timeCell: {
    color: '#64748B',
    fontSize: 12,
  },
  reasonCell: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
