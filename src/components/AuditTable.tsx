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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' (' + date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return isoString;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No authentication audit records yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollWrapper}>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell, { width: 110 }]}>Status</Text>
          <Text style={[styles.cell, styles.headerCell, { width: 230 }]}>Account Email</Text>
          <Text style={[styles.cell, styles.headerCell, { width: 130 }]}>Domain</Text>
          <Text style={[styles.cell, styles.headerCell, { width: 90 }]}>Platform</Text>
          <Text style={[styles.cell, styles.headerCell, { width: 170 }]}>Timestamp</Text>
          <Text style={[styles.cell, styles.headerCell, { width: 240 }]}>Policy Outcome / Note</Text>
        </View>

        {/* Table Rows */}
        {displayLogs.map((log) => {
          const isAllowed = log.status === 'ALLOWED';
          return (
            <View key={log.id} style={[styles.row, !isAllowed && styles.restrictedRow]}>
              <View style={[styles.cell, { width: 110 }]}>
                <Badge
                  label={log.status}
                  variant={isAllowed ? 'success' : 'danger'}
                />
              </View>
              <Text style={[styles.cell, styles.emailCell, { width: 230 }]} numberOfLines={1}>
                {log.email}
              </Text>
              <Text style={[styles.cell, styles.codeCell, { width: 130 }]} numberOfLines={1}>
                @{log.domain}
              </Text>
              <View style={[styles.cell, { width: 90 }]}>
                <Badge
                  label={log.platform || 'web'}
                  variant="neutral"
                />
              </View>
              <Text style={[styles.cell, styles.timeCell, { width: 170 }]}>
                {formatTime(log.timestamp)}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.reasonCell,
                  { width: 240, color: isAllowed ? '#15803d' : '#b91c1c' },
                ]}
                numberOfLines={2}
              >
                {isAllowed
                  ? `Access granted (${log.role || 'user'})`
                  : log.reason || 'Domain verification rejected'}
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
    minWidth: 970,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerRow: {
    backgroundColor: '#f8fafc',
    borderBottomColor: '#e2e8f0',
  },
  restrictedRow: {
    backgroundColor: '#fffcfc',
  },
  cell: {
    paddingHorizontal: 6,
    fontSize: 13,
  },
  headerCell: {
    fontWeight: '700',
    color: '#475569',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emailCell: {
    fontWeight: '600',
    color: '#0f172a',
  },
  codeCell: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    color: '#0284c7',
    fontWeight: '600',
  },
  timeCell: {
    color: '#64748b',
    fontSize: 12,
  },
  reasonCell: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
