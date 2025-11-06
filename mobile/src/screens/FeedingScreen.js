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
  Checkbox,
} from 'react-native-paper';
import { format } from 'date-fns';
import ApiService from '../services/api';

export default function FeedingScreen() {
  const [feedingData, setFeedingData] = useState({});
  const [todayStats, setTodayStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTime, setNewTime] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNursed, setNewNursed] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch feeding data
      const feedingRes = await ApiService.getFeedings();
      if (feedingRes.success) {
        setFeedingData(feedingRes.data);
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

  const handleAddFeeding = async () => {
    if (!newDate || !newTime || !newAmount) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await ApiService.addFeeding({
        date: newDate,
        time: newTime,
        amount: parseFloat(newAmount),
        nursed: newNursed,
      });

      if (result.success) {
        Alert.alert('Success', 'Feeding added!');
        setModalVisible(false);
        setNewTime('');
        setNewAmount('');
        setNewNursed(false);
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add feeding');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this feeding?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteFeeding(id);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete feeding');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Intake */}
        {todayStats && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title>Baby's Intake Today</Title>
              <Paragraph>{todayStats.date}</Paragraph>
              <Divider style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Paragraph>Total Consumed</Paragraph>
                  <Title>{todayStats.feeding.total} oz</Title>
                  <Paragraph>{todayStats.feeding.count} feedings</Paragraph>
                </View>

                <View style={styles.statBox}>
                  <Paragraph>vs Average</Paragraph>
                  <Title>{todayStats.feeding.percentOfAvg}%</Title>
                  <Paragraph>
                    {todayStats.feeding.percentOfAvg >= 100
                      ? '🎉 Great eating!'
                      : 'Growing...'}
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
              <Title>Feeding Statistics</Title>
              <Divider style={styles.divider} />

              <View style={styles.chipContainer}>
                <Chip icon="chart-line" style={styles.chip}>
                  Avg Intake: {summaryStats.avgDailyFed} oz/day
                </Chip>
                <Chip icon="bottle-tonic" style={styles.chip}>
                  Total: {summaryStats.totalFed} oz
                </Chip>
                <Chip icon="calendar" style={styles.chip}>
                  Days Tracked: {summaryStats.totalDays}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Feedings */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Title>Recent Baby Feedings</Title>
            <Divider style={styles.divider} />

            {Object.entries(feedingData)
              .slice(-5)
              .reverse()
              .map(([date, feedings]) => {
                const total = feedings.reduce((sum, f) => sum + f.amount, 0);
                const avgDaily = summaryStats?.avgDailyFed || 1;
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

                    <View style={styles.feedingsList}>
                      {feedings.map((feed) => (
                        <View key={feed.id} style={styles.feedingItem}>
                          <View>
                            <Paragraph style={styles.feedingTime}>{feed.time}</Paragraph>
                            <Paragraph style={styles.feedingAmount}>
                              {feed.amount} oz {feed.nursed && '🤱'}
                            </Paragraph>
                          </View>
                          <IconButton
                            icon="delete"
                            iconColor="#ef4444"
                            size={20}
                            onPress={() => handleDelete(feed.id)}
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
        label="Add Feeding"
      />

      {/* Add Feeding Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Baby Feeding</Title>
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
            placeholder="4"
          />

          <View style={styles.checkboxRow}>
            <Checkbox
              status={newNursed ? 'checked' : 'unchecked'}
              onPress={() => setNewNursed(!newNursed)}
            />
            <Paragraph>Also nursed?</Paragraph>
          </View>

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAddFeeding}>
              Add Feeding
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
  feedingsList: {
    gap: 8,
  },
  feedingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    padding: 12,
    borderRadius: 8,
  },
  feedingTime: {
    fontWeight: '600',
    color: '#9f1239',
  },
  feedingAmount: {
    color: '#ec4899',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ec4899',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
});
