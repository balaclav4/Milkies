import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  Button,
} from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import ApiService from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [dailyStats, setDailyStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chartView, setChartView] = useState('line'); // 'line' or 'bar'

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch daily stats
      const dailyRes = await ApiService.getDailyStats();
      if (dailyRes.success) {
        setDailyStats(dailyRes.data);
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

  const exportData = async () => {
    try {
      const result = await ApiService.exportData();
      if (result.success) {
        Alert.alert('Success', 'Data exported successfully!');
        // In a real app, you might want to save this to a file or share it
        console.log('Exported data:', result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error(error);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: dailyStats.slice(-7).map((stat) =>
      format(new Date(stat.date), 'M/d')
    ),
    datasets: [
      {
        data: dailyStats.slice(-7).map((stat) => stat.totalPumped || 0),
        color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`, // purple
        strokeWidth: 2,
      },
      {
        data: dailyStats.slice(-7).map((stat) => stat.totalFed || 0),
        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, // pink
        strokeWidth: 2,
      },
    ],
    legend: ['Pumped', 'Baby Fed'],
  };

  const barChartData = {
    labels: dailyStats.slice(-7).map((stat) =>
      format(new Date(stat.date), 'M/d')
    ),
    datasets: [
      {
        data: dailyStats.slice(-7).map((stat) => stat.totalPumped || 0),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f5f5f5',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
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
        {/* Overall Summary */}
        {summaryStats && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title>Overall Summary (30 days)</Title>
              <Divider style={styles.divider} />

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Paragraph>Avg Daily Pumped</Paragraph>
                  <Title>{summaryStats.avgDailyPumped} oz</Title>
                </View>

                <View style={styles.statBox}>
                  <Paragraph>Avg Daily Fed</Paragraph>
                  <Title>{summaryStats.avgDailyFed} oz</Title>
                </View>

                <View style={styles.statBox}>
                  <Paragraph>Avg Daily Surplus</Paragraph>
                  <Title style={{ color: '#10b981' }}>
                    {summaryStats.avgDailySurplus} oz
                  </Title>
                </View>

                <View style={styles.statBox}>
                  <Paragraph>Last 7 Days Avg</Paragraph>
                  <Title>{summaryStats.last7DaysAvg} oz</Title>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.chipContainer}>
                <Chip icon="bottle-tonic" style={styles.chip}>
                  Total Pumped: {summaryStats.totalPumped} oz
                </Chip>
                <Chip icon="baby-bottle" style={styles.chip}>
                  Total Fed: {summaryStats.totalFed} oz
                </Chip>
                <Chip icon="calendar" style={styles.chip}>
                  Days Tracked: {summaryStats.totalDays}
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

        {/* Chart Toggle */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.chartHeader}>
              <Title>Supply Trends (Last 7 Days)</Title>
              <View style={styles.chartToggle}>
                <Button
                  mode={chartView === 'line' ? 'contained' : 'outlined'}
                  onPress={() => setChartView('line')}
                  compact
                >
                  Line
                </Button>
                <Button
                  mode={chartView === 'bar' ? 'contained' : 'outlined'}
                  onPress={() => setChartView('bar')}
                  compact
                >
                  Bar
                </Button>
              </View>
            </View>

            <Divider style={styles.divider} />

            {dailyStats.length > 0 ? (
              chartView === 'line' ? (
                <LineChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <BarChart
                  data={barChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
              )
            ) : (
              <Paragraph>No data available for charts</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Supply Analysis */}
        {summaryStats && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title>💚 Supply vs Intake Analysis</Title>
              <Divider style={styles.divider} />

              {summaryStats.avgDailySurplus > 3 && (
                <Paragraph style={styles.analysisText}>
                  🎉 <Text style={{ fontWeight: 'bold' }}>Perfect balance!</Text> You're
                  consistently making {summaryStats.avgDailySurplus} oz more per day than baby
                  needs. Your freezer stash is growing!
                </Paragraph>
              )}

              {summaryStats.avgDailySurplus < 0 && (
                <Paragraph style={styles.analysisText}>
                  ⚠️ On average, baby is consuming more than you're pumping. This is okay if you
                  have a freezer stash, but consider adding an extra pump if this continues.
                </Paragraph>
              )}

              <Paragraph style={styles.analysisText}>
                📊 Over the tracked period, you've built a freezer stash of approximately{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {(summaryStats.avgDailySurplus * summaryStats.totalDays).toFixed(1)} oz
                </Text>
                .
              </Paragraph>

              <Paragraph style={styles.analysisText}>
                💡 <Text style={{ fontWeight: 'bold' }}>Tip:</Text> An average surplus of 3-5 oz
                per day is ideal for building a comfortable freezer stash without risking
                oversupply issues.
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Export Button */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Button
              mode="contained"
              icon="download"
              onPress={exportData}
              style={styles.exportButton}
            >
              Export All Data
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    marginVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginVertical: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  analysisText: {
    marginVertical: 8,
    lineHeight: 24,
  },
  exportButton: {
    marginTop: 8,
  },
});
