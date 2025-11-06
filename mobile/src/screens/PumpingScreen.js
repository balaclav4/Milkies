import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Chip,
  FAB,
  Portal,
  Modal,
  Surface,
  Divider,
  IconButton,
} from 'react-native-paper';
import { format } from 'date-fns';
import ApiService from '../services/api';

export default function PumpingScreen() {
  const [pumpingData, setPumpingData] = useState({});
  const [todayStats, setTodayStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTime, setNewTime] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch pumping data
      const pumpingRes = await ApiService.getPumpingSessions();
      if (pumpingRes.success) {
        setPumpingData(pumpingRes.data);
      }

      // Fetch today's stats
      const todayRes = await ApiService.getTodayStats();
      if (todayRes.success) {
        setTodayStats(todayRes.data);
      }

      // Fetch summary stats
      const summaryRes = await ApiService.getSummaryStats(30);
      if (summaryRes.success) {
        setSummaryStats(summaryRes.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleAddPump = async () => {
    if (!newDate || !newTime || !newAmount) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await ApiService.addPumpingSession({
        date: newDate,
        time: newTime,
        amount: parseFloat(newAmount),
      });

      if (result.success) {
        Alert.alert('Success', 'Pump session added!');
        setModalVisible(false);
        setNewTime('');
        setNewAmount('');
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add pump session');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this pump session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deletePumpingSession(id);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete pump session');
            }
          },
        },
      ]
    );
  };

  const getTrendIcon = (percent) => {
    if (percent > 2) return 'trending-up';
    if (percent < -2) return 'trending-down';
    return 'minus';
  };

  const getTrendColor = (percent) => {
    if (percent > 2) return '#10b981';
    if (percent < -2) return '#ef4444';
    return '#6b7280';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Progress */}
        {todayStats && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title>Today's Progress</Title>
              <Paragraph>{todayStats.date}</Paragraph>
              <Divider style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Paragraph>Total So Far</Paragraph>
                  <Title>{todayStats.pumping.total} oz</Title>
                  <Paragraph>{todayStats.pumping.count} pumps</Paragraph>
                </View>

                <View style={styles.statBox}>
                  <Paragraph>vs Average</Paragraph>
                  <Title>{todayStats.pumping.percentOfAvg}%</Title>
                  <Paragraph>
                    {todayStats.pumping.percentOfAvg >= 100
                      ? '🎉 Above avg!'
                      : 'Tracking...'}
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Summary Stats */}
        {summaryStats && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title>Key Statistics</Title>
              <Divider style={styles.divider} />

              <View style={styles.chipContainer}>
                <Chip icon="chart-line" style={styles.chip}>
                  Avg: {summaryStats.avgDailyPumped} oz/day
                </Chip>
                <Chip icon="calendar-week" style={styles.chip}>
                  Last 7d: {summaryStats.last7DaysAvg} oz
                </Chip>
                <Chip
                  icon={getTrendIcon(summaryStats.trendPercent)}
                  style={[
                    styles.chip,
                    { backgroundColor: getTrendColor(summaryStats.trendPercent) + '20' },
                  ]}
                >
                  Trend: {summaryStats.trendPercent > 0 ? '+' : ''}
                  {summaryStats.trendPercent}%
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Entries */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Title>Recent Entries</Title>
            <Divider style={styles.divider} />

            {Object.entries(pumpingData)
              .slice(-5)
              .reverse()
              .map(([date, pumps]) => {
                const total = pumps.reduce((sum, p) => sum + p.amount, 0);
                const avgDaily = summaryStats?.avgDailyPumped || 1;
                const percentOfAvg = (total / avgDaily) * 100;

                return (
                  <Surface key={date} style={styles.entryCard} elevation={1}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Paragraph style={styles.entryDate}>
                          {format(new Date(date), 'EEE, MMM d')}
                        </Paragraph>
                        <Title>{total.toFixed(1)} oz</Title>
                        <Paragraph style={{ color: percentOfAvg >= 100 ? '#10b981' : '#6b7280' }}>
                          {percentOfAvg.toFixed(0)}% of average
                        </Paragraph>
                      </View>
                    </View>

                    <View style={styles.pumpsList}>
                      {pumps.map((pump) => (
                        <View key={pump.id} style={styles.pumpItem}>
                          <View>
                            <Paragraph style={styles.pumpTime}>{pump.time}</Paragraph>
                            <Paragraph style={styles.pumpAmount}>{pump.amount} oz</Paragraph>
                          </View>
                          <IconButton
                            icon="delete"
                            iconColor="#ef4444"
                            size={20}
                            onPress={() => handleDelete(pump.id)}
                          />
                        </View>
                      ))}
                    </View>
                  </Surface>
                );
              })}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Add Pump"
      />

      {/* Add Pump Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Pump Session</Title>
          <Divider style={styles.divider} />

          <TextInput
            label="Date"
            value={newDate}
            onChangeText={setNewDate}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Time (e.g., 8:30am)"
            value={newTime}
            onChangeText={setNewTime}
            mode="outlined"
            style={styles.input}
            placeholder="8:30am"
          />

          <TextInput
            label="Amount (oz)"
            value={newAmount}
            onChangeText={setNewAmount}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="6.5"
          />

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAddPump}>
              Add Pump
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginVertical: 4,
  },
  entryCard: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontWeight: 'bold',
  },
  pumpsList: {
    gap: 8,
  },
  pumpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 8,
  },
  pumpTime: {
    fontWeight: '600',
    color: '#6b21a8',
  },
  pumpAmount: {
    color: '#7c3aed',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#9333ea',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  input: {
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
});
