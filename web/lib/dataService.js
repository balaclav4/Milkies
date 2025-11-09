import { supabase } from './supabase';

// ============================================================================
// PUMPING SESSIONS
// ============================================================================

export async function getPumpingSessions(startDate = null, endDate = null) {
  try {
    let query = supabase
      .from('pumping_sessions')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by date
    const grouped = {};
    data.forEach(row => {
      const date = row.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push({
        id: row.id,
        time: row.time,
        amount: parseFloat(row.amount_oz),
        notes: row.notes
      });
    });

    return { success: true, data: grouped };
  } catch (error) {
    console.error('Error fetching pumping sessions:', error);
    return { success: false, error: error.message };
  }
}

export async function addPumpingSession(date, time, amount, notes = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('pumping_sessions')
      .insert({
        user_id: user.id,
        date,
        time,
        amount_oz: amount,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, id: data.id, message: 'Pumping session added successfully' };
  } catch (error) {
    console.error('Error adding pumping session:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePumpingSession(id, updates) {
  try {
    const updateData = {};
    if (updates.amount !== undefined) updateData.amount_oz = updates.amount;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('pumping_sessions')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Pumping session updated successfully' };
  } catch (error) {
    console.error('Error updating pumping session:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePumpingSession(id) {
  try {
    const { error } = await supabase
      .from('pumping_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Pumping session deleted successfully' };
  } catch (error) {
    console.error('Error deleting pumping session:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// BABY FEEDINGS
// ============================================================================

export async function getFeedings(startDate = null, endDate = null) {
  try {
    let query = supabase
      .from('baby_feedings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by date
    const grouped = {};
    data.forEach(row => {
      const date = row.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push({
        id: row.id,
        time: row.time,
        amount: parseFloat(row.amount_oz),
        nursed: row.nursed,
        notes: row.notes
      });
    });

    return { success: true, data: grouped };
  } catch (error) {
    console.error('Error fetching feedings:', error);
    return { success: false, error: error.message };
  }
}

export async function addFeeding(date, time, amount, nursed = false, notes = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('baby_feedings')
      .insert({
        user_id: user.id,
        date,
        time,
        amount_oz: amount,
        nursed,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, id: data.id, message: 'Feeding added successfully' };
  } catch (error) {
    console.error('Error adding feeding:', error);
    return { success: false, error: error.message };
  }
}

export async function updateFeeding(id, updates) {
  try {
    const updateData = {};
    if (updates.amount !== undefined) updateData.amount_oz = updates.amount;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.nursed !== undefined) updateData.nursed = updates.nursed;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('baby_feedings')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Feeding updated successfully' };
  } catch (error) {
    console.error('Error updating feeding:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFeeding(id) {
  try {
    const { error } = await supabase
      .from('baby_feedings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Feeding deleted successfully' };
  } catch (error) {
    console.error('Error deleting feeding:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getDailyStats(startDate = null, endDate = null) {
  try {
    let query = supabase
      .from('daily_stats')
      .select('*')
      .order('date', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const result = data.map(row => ({
      date: row.date,
      totalPumped: parseFloat(row.total_pumped_oz) || 0,
      pumpCount: row.pump_count || 0,
      totalFed: parseFloat(row.total_fed_oz) || 0,
      feedCount: row.feed_count || 0,
      surplus: parseFloat(row.surplus_oz) || 0
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return { success: false, error: error.message };
  }
}

export async function getSummaryStats(days = 30) {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Calculate averages
    const totalDays = data.length;
    const totalPumped = data.reduce((sum, row) => sum + (parseFloat(row.total_pumped_oz) || 0), 0);
    const totalFed = data.reduce((sum, row) => sum + (parseFloat(row.total_fed_oz) || 0), 0);
    const avgPumped = totalDays > 0 ? totalPumped / totalDays : 0;
    const avgFed = totalDays > 0 ? totalFed / totalDays : 0;
    const avgSurplus = avgPumped - avgFed;

    // Last 7 days average
    const last7Start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const last7Data = data.filter(row => row.date >= last7Start);
    const last7Avg = last7Data.length > 0
      ? last7Data.reduce((sum, row) => sum + (parseFloat(row.total_pumped_oz) || 0), 0) / last7Data.length
      : 0;

    // Trend calculation (last 3 vs previous 3)
    const last3Start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const last3Data = data.filter(row => row.date >= last3Start);
    const prev3Data = data.filter(row => row.date < last3Start && row.date >= new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const last3Avg = last3Data.length > 0
      ? last3Data.reduce((sum, row) => sum + (parseFloat(row.total_pumped_oz) || 0), 0) / last3Data.length
      : 0;
    const prev3Avg = prev3Data.length > 0
      ? prev3Data.reduce((sum, row) => sum + (parseFloat(row.total_pumped_oz) || 0), 0) / prev3Data.length
      : 0;

    const trendPercent = prev3Avg > 0 ? ((last3Avg - prev3Avg) / prev3Avg * 100) : 0;

    return {
      success: true,
      data: {
        avgDailyPumped: Math.round(avgPumped * 10) / 10,
        avgDailyFed: Math.round(avgFed * 10) / 10,
        avgDailySurplus: Math.round(avgSurplus * 10) / 10,
        totalPumped: Math.round(totalPumped * 10) / 10,
        totalFed: Math.round(totalFed * 10) / 10,
        totalDays,
        last7DaysAvg: Math.round(last7Avg * 10) / 10,
        trendPercent: Math.round(trendPercent * 10) / 10
      }
    };
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    return { success: false, error: error.message };
  }
}

export async function getTodayStats() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's pumping
    const { data: pumpData, error: pumpError } = await supabase
      .from('pumping_sessions')
      .select('amount_oz')
      .eq('date', today);

    if (pumpError) throw pumpError;

    // Get today's feeding
    const { data: feedData, error: feedError } = await supabase
      .from('baby_feedings')
      .select('amount_oz')
      .eq('date', today);

    if (feedError) throw feedError;

    const totalPumped = pumpData.reduce((sum, row) => sum + (parseFloat(row.amount_oz) || 0), 0);
    const pumpCount = pumpData.length;
    const totalFed = feedData.reduce((sum, row) => sum + (parseFloat(row.amount_oz) || 0), 0);
    const feedCount = feedData.length;

    // Get average for comparison (last 30 days, excluding today)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: avgData, error: avgError } = await supabase
      .from('daily_stats')
      .select('total_pumped_oz, total_fed_oz')
      .gte('date', thirtyDaysAgo)
      .lt('date', today);

    if (avgError) throw avgError;

    const avgPumped = avgData.length > 0
      ? avgData.reduce((sum, row) => sum + (parseFloat(row.total_pumped_oz) || 0), 0) / avgData.length
      : 1;
    const avgFed = avgData.length > 0
      ? avgData.reduce((sum, row) => sum + (parseFloat(row.total_fed_oz) || 0), 0) / avgData.length
      : 1;

    return {
      success: true,
      data: {
        date: today,
        pumping: {
          total: Math.round(totalPumped * 10) / 10,
          count: pumpCount,
          percentOfAvg: Math.round((totalPumped / avgPumped * 100))
        },
        feeding: {
          total: Math.round(totalFed * 10) / 10,
          count: feedCount,
          percentOfAvg: Math.round((totalFed / avgFed * 100))
        }
      }
    };
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export async function exportData() {
  try {
    const { data: pumpingData, error: pumpError } = await supabase
      .from('pumping_sessions')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (pumpError) throw pumpError;

    const { data: feedingData, error: feedError } = await supabase
      .from('baby_feedings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (feedError) throw feedError;

    // Group pumping data by date
    const pumpingSessions = {};
    pumpingData.forEach(row => {
      const date = row.date;
      if (!pumpingSessions[date]) {
        pumpingSessions[date] = [];
      }
      pumpingSessions[date].push({
        time: row.time,
        amount: parseFloat(row.amount_oz),
        notes: row.notes
      });
    });

    // Group feeding data by date
    const babyFeedings = {};
    feedingData.forEach(row => {
      const date = row.date;
      if (!babyFeedings[date]) {
        babyFeedings[date] = [];
      }
      babyFeedings[date].push({
        time: row.time,
        amount: parseFloat(row.amount_oz),
        nursed: row.nursed,
        notes: row.notes
      });
    });

    return {
      success: true,
      data: {
        pumpingSessions,
        babyFeedings,
        exportDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
}
