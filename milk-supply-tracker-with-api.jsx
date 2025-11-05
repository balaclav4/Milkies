import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, Calendar, RefreshCw, Download } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

export default function MilkSupplyTracker() {
  const [activeTab, setActiveTab] = useState('pumping');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [pumpingData, setPumpingData] = useState({});
  const [feedingData, setFeedingData] = useState({});
  const [dailyStats, setDailyStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  
  // Form state
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNursed, setNewNursed] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch pumping data
      const pumpingRes = await fetch(`${API_BASE_URL}/pumping`);
      const pumpingJson = await pumpingRes.json();
      if (pumpingJson.success) {
        setPumpingData(pumpingJson.data);
      }
      
      // Fetch feeding data
      const feedingRes = await fetch(`${API_BASE_URL}/feeding`);
      const feedingJson = await feedingRes.json();
      if (feedingJson.success) {
        setFeedingData(feedingJson.data);
      }
      
      // Fetch daily stats
      const statsRes = await fetch(`${API_BASE_URL}/stats/daily`);
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setDailyStats(statsJson.data);
      }
      
      // Fetch summary stats
      const summaryRes = await fetch(`${API_BASE_URL}/stats/summary?days=30`);
      const summaryJson = await summaryRes.json();
      if (summaryJson.success) {
        setSummaryStats(summaryJson.data);
      }
      
      // Fetch today's stats
      const todayRes = await fetch(`${API_BASE_URL}/stats/today`);
      const todayJson = await todayRes.json();
      if (todayJson.success) {
        setTodayStats(todayJson.data);
      }
      
    } catch (err) {
      setError('Failed to fetch data. Make sure the API server is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Add pump session
  const addPumpSession = async () => {
    if (!newDate || !newTime || !newAmount) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/pumping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          amount: parseFloat(newAmount)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewTime('');
        setNewAmount('');
        fetchData(); // Reload data
      } else {
        alert(result.error || 'Failed to add pump session');
      }
    } catch (err) {
      alert('Error adding pump session');
      console.error(err);
    }
  };

  // Add feeding
  const addFeeding = async () => {
    if (!newDate || !newTime || !newAmount) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/feeding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          amount: parseFloat(newAmount),
          nursed: newNursed
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewTime('');
        setNewAmount('');
        setNewNursed(false);
        fetchData(); // Reload data
      } else {
        alert(result.error || 'Failed to add feeding');
      }
    } catch (err) {
      alert('Error adding feeding');
      console.error(err);
    }
  };

  // Delete pump session
  const deletePumpSession = async (id) => {
    if (!confirm('Are you sure you want to delete this pump session?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/pumping/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchData(); // Reload data
      } else {
        alert(result.error || 'Failed to delete pump session');
      }
    } catch (err) {
      alert('Error deleting pump session');
      console.error(err);
    }
  };

  // Delete feeding
  const deleteFeeding = async (id) => {
    if (!confirm('Are you sure you want to delete this feeding?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/feeding/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchData(); // Reload data
      } else {
        alert(result.error || 'Failed to delete feeding');
      }
    } catch (err) {
      alert('Error deleting feeding');
      console.error(err);
    }
  };

  // Export data
  const exportData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export`);
      const result = await response.json();
      
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `milk-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }
    } catch (err) {
      alert('Error exporting data');
      console.error(err);
    }
  };

  // Format data for charts
  const chartData = useMemo(() => {
    return dailyStats.map(stat => ({
      date: stat.date,
      pumped: stat.totalPumped,
      consumed: stat.totalFed,
      surplus: stat.surplus
    }));
  }, [dailyStats]);

  const getTrendIcon = (percent) => {
    if (percent > 2) return <TrendingUp className="text-green-600" />;
    if (percent < -2) return <TrendingDown className="text-red-600" />;
    return <Minus className="text-gray-600" />;
  };

  const getTrendColor = (percent) => {
    if (percent > 2) return 'text-green-600';
    if (percent < -2) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">Milk Supply Tracker</h1>
              <p className="text-gray-600">Connected to database • Real-time sync</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('pumping')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'pumping' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Pumping
            </button>
            <button
              onClick={() => setActiveTab('feeding')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'feeding' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Baby's Intake
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'comparison' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Supply vs Intake
            </button>
          </div>
        </div>

        {/* PUMPING TAB */}
        {activeTab === 'pumping' && summaryStats && (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Overall Average</div>
                <div className="text-3xl font-bold text-purple-900">{summaryStats.avgDailyPumped} oz</div>
                <div className="text-xs text-gray-500 mt-1">per day</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Last 7 Days</div>
                <div className="text-3xl font-bold text-blue-900">{summaryStats.last7DaysAvg} oz</div>
                <div className="text-xs text-gray-500 mt-1">daily average</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  Current Trend
                  {getTrendIcon(summaryStats.trendPercent)}
                </div>
                <div className={`text-3xl font-bold ${getTrendColor(summaryStats.trendPercent)}`}>
                  {summaryStats.trendPercent > 0 ? '+' : ''}{summaryStats.trendPercent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">last 3 vs prev 3 days</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Total Days</div>
                <div className="text-3xl font-bold text-pink-900">{summaryStats.totalDays}</div>
                <div className="text-xs text-gray-500 mt-1">tracked</div>
              </div>
            </div>

            {/* Today's Progress */}
            {todayStats && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Today's Progress</h2>
                    <p className="text-purple-100">{todayStats.date}</p>
                  </div>
                  <Calendar className="w-8 h-8" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">Total So Far</div>
                    <div className="text-4xl font-bold">{todayStats.pumping.total} oz</div>
                    <div className="text-sm mt-1">{todayStats.pumping.count} pumps</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">vs Your Average</div>
                    <div className="text-4xl font-bold">{todayStats.pumping.percentOfAvg}%</div>
                    <div className="text-sm mt-1">
                      {todayStats.pumping.percentOfAvg >= 100 ? '🎉 Above average!' : 'Still tracking...'}
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">Status</div>
                    <div className="text-4xl font-bold">
                      {todayStats.pumping.count >= 5 ? '✓' : '...'}
                    </div>
                    <div className="text-sm mt-1">
                      {todayStats.pumping.count >= 5 ? 'Great job!' : 'Keep going'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Total Output</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(1)} oz`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pumped" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    name="Daily Total (oz)"
                    dot={{ fill: '#9333ea', r: 4 }}
                  />
                  {summaryStats && (
                    <Line 
                      type="monotone" 
                      dataKey={() => summaryStats.avgDailyPumped} 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Your Average"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Add New Pump */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Pump Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g., 8:30am"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (oz)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g., 6.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addPumpSession}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Add Pump
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Entries</h3>
              <div className="space-y-4">
                {Object.entries(pumpingData).slice(-5).reverse().map(([date, pumps]) => {
                  const total = pumps.reduce((sum, p) => sum + p.amount, 0);
                  const avgDaily = summaryStats?.avgDailyPumped || 1;
                  const percentOfAvg = (total / avgDaily) * 100;
                  
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-800">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-900">{total.toFixed(1)} oz</div>
                          <div className={`text-sm ${percentOfAvg >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                            {percentOfAvg.toFixed(0)}% of average
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {pumps.map((pump) => (
                          <div key={pump.id} className="bg-purple-50 rounded px-3 py-2 text-sm flex justify-between items-center">
                            <div>
                              <div className="font-medium text-purple-900">{pump.time}</div>
                              <div className="text-purple-700">{pump.amount} oz</div>
                            </div>
                            <button
                              onClick={() => deletePumpSession(pump.id)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* FEEDING TAB */}
        {activeTab === 'feeding' && summaryStats && (
          <>
            {/* Baby Feeding Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Average Daily Intake</div>
                <div className="text-3xl font-bold text-pink-900">{summaryStats.avgDailyFed} oz</div>
                <div className="text-xs text-gray-500 mt-1">per day</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Total Tracked</div>
                <div className="text-3xl font-bold text-blue-900">{summaryStats.totalFed} oz</div>
                <div className="text-xs text-gray-500 mt-1">all time</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Days Tracked</div>
                <div className="text-3xl font-bold text-purple-900">{summaryStats.totalDays}</div>
                <div className="text-xs text-gray-500 mt-1">feeding days</div>
              </div>
            </div>

            {/* Today's Baby Intake */}
            {todayStats && (
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Baby's Intake Today</h2>
                    <p className="text-pink-100">{todayStats.date}</p>
                  </div>
                  <Calendar className="w-8 h-8" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">Total Consumed</div>
                    <div className="text-4xl font-bold">{todayStats.feeding.total} oz</div>
                    <div className="text-sm mt-1">{todayStats.feeding.count} feedings</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">vs Average Intake</div>
                    <div className="text-4xl font-bold">{todayStats.feeding.percentOfAvg}%</div>
                    <div className="text-sm mt-1">
                      {todayStats.feeding.percentOfAvg >= 100 ? '🎉 Great eating!' : 'Growing appetite...'}
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm mb-1">Status</div>
                    <div className="text-4xl font-bold">
                      {todayStats.feeding.count >= 6 ? '✓' : '...'}
                    </div>
                    <div className="text-sm mt-1">
                      {todayStats.feeding.count >= 6 ? 'Well fed!' : 'More meals coming'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Baby Intake Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Baby Intake</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(1)} oz`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    name="Daily Intake (oz)"
                    dot={{ fill: '#ec4899', r: 4 }}
                  />
                  {summaryStats && (
                    <Line 
                      type="monotone" 
                      dataKey={() => summaryStats.avgDailyFed} 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Average Intake"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Add New Feeding */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Baby Feeding</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g., 8:30am"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (oz)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g., 4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Also Nursed?</label>
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newNursed}
                      onChange={(e) => setNewNursed(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addFeeding}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Add Feeding
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Baby Feedings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Baby Feedings</h3>
              <div className="space-y-4">
                {Object.entries(feedingData).slice(-5).reverse().map(([date, feedings]) => {
                  const total = feedings.reduce((sum, f) => sum + f.amount, 0);
                  const avgDaily = summaryStats?.avgDailyFed || 1;
                  const percentOfAvg = (total / avgDaily) * 100;
                  
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-800">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-pink-900">{total.toFixed(1)} oz</div>
                          <div className={`text-sm ${percentOfAvg >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                            {percentOfAvg.toFixed(0)}% of average
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {feedings.map((feed) => (
                          <div key={feed.id} className="bg-pink-50 rounded px-3 py-2 text-sm flex justify-between items-center">
                            <div>
                              <div className="font-medium text-pink-900">{feed.time}</div>
                              <div className="text-pink-700">
                                {feed.amount} oz {feed.nursed && '🤱'}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteFeeding(feed.id)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* COMPARISON TAB */}
        {activeTab === 'comparison' && summaryStats && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Supply vs Baby's Intake</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(1)} oz`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Bar dataKey="pumped" fill="#9333ea" name="Pumped" />
                  <Bar dataKey="consumed" fill="#ec4899" name="Baby Consumed" />
                  <Bar dataKey="surplus" fill="#10b981" name="Surplus (Freezer)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Daily Surplus</div>
                <div className="text-3xl font-bold text-green-600">
                  {summaryStats.avgDailySurplus} oz
                </div>
                <div className="text-xs text-gray-500 mt-1">for freezer stash</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Total Pumped</div>
                <div className="text-3xl font-bold text-purple-900">
                  {summaryStats.totalPumped} oz
                </div>
                <div className="text-xs text-gray-500 mt-1">{summaryStats.totalDays} days</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 mb-1">Total Consumed</div>
                <div className="text-3xl font-bold text-pink-900">
                  {summaryStats.totalFed} oz
                </div>
                <div className="text-xs text-gray-500 mt-1">{summaryStats.totalDays} days</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💚 Supply vs Intake Analysis</h3>
              <div className="space-y-3 text-gray-700">
                {summaryStats.avgDailySurplus > 3 && (
                  <p>
                    🎉 <strong>Perfect balance!</strong> You're consistently making {summaryStats.avgDailySurplus} oz more per day than baby needs. 
                    Your freezer stash is growing!
                  </p>
                )}
                
                {summaryStats.avgDailySurplus < 0 && (
                  <p>
                    ⚠️ On average, baby is consuming more than you're pumping. This is okay if you have a freezer stash, 
                    but consider adding an extra pump if this continues.
                  </p>
                )}
                
                <p>
                  📊 Over the tracked period, you've built a freezer stash of approximately{' '}
                  <strong>{(summaryStats.avgDailySurplus * summaryStats.totalDays).toFixed(1)} oz</strong>.
                </p>
                
                <p>
                  💡 <strong>Tip:</strong> An average surplus of 3-5 oz per day is ideal for building a comfortable 
                  freezer stash without risking oversupply issues.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
