#!/usr/bin/env python3
"""
Milk Supply Tracker - Backend API
Flask REST API with SQLite database
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Database configuration
import os
DATABASE = os.path.join(os.path.dirname(__file__), 'milk_tracker.db')

def get_db():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def init_db():
    """Initialize the database with schema"""
    with app.app_context():
        conn = get_db()
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")

def migrate_json_data():
    """Migrate existing JSON data to SQL database"""
    json_file = os.path.join(os.path.dirname(__file__), 'milk-tracker-data.json')
    if not os.path.exists(json_file):
        print("⚠️  No JSON data to migrate")
        return
    
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Migrate pumping data
    pumping_count = 0
    for entry in data.get('pumpingEntries', []):
        date = entry['date']
        for pump in entry['pumps']:
            try:
                cursor.execute(
                    'INSERT OR IGNORE INTO pumping_sessions (date, time, amount_oz) VALUES (?, ?, ?)',
                    (date, pump['time'], pump['amount'])
                )
                pumping_count += cursor.rowcount
            except Exception as e:
                print(f"Error migrating pump: {e}")
    
    # Migrate feeding data
    feeding_count = 0
    for entry in data.get('feedingEntries', []):
        date = entry['date']
        for feed in entry['feedings']:
            try:
                cursor.execute(
                    'INSERT OR IGNORE INTO baby_feedings (date, time, amount_oz, nursed) VALUES (?, ?, ?, ?)',
                    (date, feed['time'], feed['amount'], 1 if feed.get('nursed', False) else 0)
                )
                feeding_count += cursor.rowcount
            except Exception as e:
                print(f"Error migrating feed: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"✅ Migrated {pumping_count} pumping sessions and {feeding_count} feedings")

def calculate_daily_stats():
    """Recalculate all daily statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Clear existing stats
    cursor.execute('DELETE FROM daily_stats')
    
    # Calculate pumping stats
    cursor.execute('''
        INSERT OR REPLACE INTO daily_stats (date, total_pumped_oz, pump_count)
        SELECT date, SUM(amount_oz), COUNT(*)
        FROM pumping_sessions
        GROUP BY date
    ''')
    
    # Calculate feeding stats
    cursor.execute('''
        INSERT OR REPLACE INTO daily_stats (date, total_fed_oz, feed_count)
        SELECT date, SUM(amount_oz), COUNT(*)
        FROM baby_feedings
        GROUP BY date
        ON CONFLICT(date) DO UPDATE SET
            total_fed_oz = excluded.total_fed_oz,
            feed_count = excluded.feed_count
    ''')
    
    # Calculate surplus
    cursor.execute('''
        UPDATE daily_stats
        SET surplus_oz = COALESCE(total_pumped_oz, 0) - COALESCE(total_fed_oz, 0)
    ''')
    
    conn.commit()
    conn.close()

# ============================================================================
# PUMPING ENDPOINTS
# ============================================================================

@app.route('/api/pumping', methods=['GET'])
def get_pumping_sessions():
    """Get all pumping sessions, optionally filtered by date range"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM pumping_sessions'
    params = []
    
    if start_date and end_date:
        query += ' WHERE date BETWEEN ? AND ?'
        params = [start_date, end_date]
    elif start_date:
        query += ' WHERE date >= ?'
        params = [start_date]
    
    query += ' ORDER BY date, time'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    # Group by date
    result = {}
    for row in rows:
        date = row['date']
        if date not in result:
            result[date] = []
        result[date].append({
            'id': row['id'],
            'time': row['time'],
            'amount': row['amount_oz'],
            'notes': row['notes']
        })
    
    return jsonify({
        'success': True,
        'data': result
    })

@app.route('/api/pumping', methods=['POST'])
def add_pumping_session():
    """Add a new pumping session"""
    data = request.get_json()
    
    required_fields = ['date', 'time', 'amount']
    if not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'error': 'Missing required fields: date, time, amount'
        }), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO pumping_sessions (date, time, amount_oz, notes) VALUES (?, ?, ?, ?)',
            (data['date'], data['time'], data['amount'], data.get('notes'))
        )
        conn.commit()
        session_id = cursor.lastrowid
        
        # Recalculate stats for this date
        calculate_daily_stats()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'id': session_id,
            'message': 'Pumping session added successfully'
        }), 201
        
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'A pumping session already exists for this date and time'
        }), 409
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pumping/<int:session_id>', methods=['DELETE'])
def delete_pumping_session(session_id):
    """Delete a pumping session"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM pumping_sessions WHERE id = ?', (session_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'Pumping session not found'
        }), 404
    
    conn.commit()
    calculate_daily_stats()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Pumping session deleted successfully'
    })

@app.route('/api/pumping/<int:session_id>', methods=['PUT'])
def update_pumping_session(session_id):
    """Update a pumping session"""
    data = request.get_json()
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build update query dynamically
    updates = []
    params = []
    
    if 'amount' in data:
        updates.append('amount_oz = ?')
        params.append(data['amount'])
    if 'time' in data:
        updates.append('time = ?')
        params.append(data['time'])
    if 'notes' in data:
        updates.append('notes = ?')
        params.append(data['notes'])
    
    if not updates:
        return jsonify({
            'success': False,
            'error': 'No fields to update'
        }), 400
    
    updates.append('updated_at = CURRENT_TIMESTAMP')
    params.append(session_id)
    
    query = f"UPDATE pumping_sessions SET {', '.join(updates)} WHERE id = ?"
    
    cursor.execute(query, params)
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'Pumping session not found'
        }), 404
    
    conn.commit()
    calculate_daily_stats()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Pumping session updated successfully'
    })

# ============================================================================
# FEEDING ENDPOINTS
# ============================================================================

@app.route('/api/feeding', methods=['GET'])
def get_feedings():
    """Get all baby feedings, optionally filtered by date range"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM baby_feedings'
    params = []
    
    if start_date and end_date:
        query += ' WHERE date BETWEEN ? AND ?'
        params = [start_date, end_date]
    elif start_date:
        query += ' WHERE date >= ?'
        params = [start_date]
    
    query += ' ORDER BY date, time'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    # Group by date
    result = {}
    for row in rows:
        date = row['date']
        if date not in result:
            result[date] = []
        result[date].append({
            'id': row['id'],
            'time': row['time'],
            'amount': row['amount_oz'],
            'nursed': bool(row['nursed']),
            'notes': row['notes']
        })
    
    return jsonify({
        'success': True,
        'data': result
    })

@app.route('/api/feeding', methods=['POST'])
def add_feeding():
    """Add a new baby feeding"""
    data = request.get_json()
    
    required_fields = ['date', 'time', 'amount']
    if not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'error': 'Missing required fields: date, time, amount'
        }), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO baby_feedings (date, time, amount_oz, nursed, notes) VALUES (?, ?, ?, ?, ?)',
            (data['date'], data['time'], data['amount'], 
             1 if data.get('nursed', False) else 0, data.get('notes'))
        )
        conn.commit()
        feeding_id = cursor.lastrowid
        
        calculate_daily_stats()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'id': feeding_id,
            'message': 'Feeding added successfully'
        }), 201
        
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'A feeding already exists for this date and time'
        }), 409
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/feeding/<int:feeding_id>', methods=['DELETE'])
def delete_feeding(feeding_id):
    """Delete a feeding"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM baby_feedings WHERE id = ?', (feeding_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'Feeding not found'
        }), 404
    
    conn.commit()
    calculate_daily_stats()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Feeding deleted successfully'
    })

@app.route('/api/feeding/<int:feeding_id>', methods=['PUT'])
def update_feeding(feeding_id):
    """Update a feeding"""
    data = request.get_json()
    
    conn = get_db()
    cursor = conn.cursor()
    
    updates = []
    params = []
    
    if 'amount' in data:
        updates.append('amount_oz = ?')
        params.append(data['amount'])
    if 'time' in data:
        updates.append('time = ?')
        params.append(data['time'])
    if 'nursed' in data:
        updates.append('nursed = ?')
        params.append(1 if data['nursed'] else 0)
    if 'notes' in data:
        updates.append('notes = ?')
        params.append(data['notes'])
    
    if not updates:
        return jsonify({
            'success': False,
            'error': 'No fields to update'
        }), 400
    
    updates.append('updated_at = CURRENT_TIMESTAMP')
    params.append(feeding_id)
    
    query = f"UPDATE baby_feedings SET {', '.join(updates)} WHERE id = ?"
    
    cursor.execute(query, params)
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({
            'success': False,
            'error': 'Feeding not found'
        }), 404
    
    conn.commit()
    calculate_daily_stats()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Feeding updated successfully'
    })

# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@app.route('/api/stats/daily', methods=['GET'])
def get_daily_stats():
    """Get daily statistics"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM daily_stats'
    params = []
    
    if start_date and end_date:
        query += ' WHERE date BETWEEN ? AND ?'
        params = [start_date, end_date]
    elif start_date:
        query += ' WHERE date >= ?'
        params = [start_date]
    
    query += ' ORDER BY date'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        result.append({
            'date': row['date'],
            'totalPumped': row['total_pumped_oz'] or 0,
            'pumpCount': row['pump_count'] or 0,
            'totalFed': row['total_fed_oz'] or 0,
            'feedCount': row['feed_count'] or 0,
            'surplus': row['surplus_oz'] or 0
        })
    
    return jsonify({
        'success': True,
        'data': result
    })

@app.route('/api/stats/summary', methods=['GET'])
def get_summary_stats():
    """Get overall summary statistics"""
    days = request.args.get('days', 30, type=int)
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Calculate date range
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    # Overall averages
    cursor.execute('''
        SELECT 
            AVG(total_pumped_oz) as avg_pumped,
            AVG(total_fed_oz) as avg_fed,
            AVG(surplus_oz) as avg_surplus,
            SUM(total_pumped_oz) as total_pumped,
            SUM(total_fed_oz) as total_fed,
            COUNT(*) as total_days
        FROM daily_stats
        WHERE date BETWEEN ? AND ?
    ''', (start_date, end_date))
    
    row = cursor.fetchone()
    
    # Last 7 days average
    last_7_start = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    cursor.execute('''
        SELECT AVG(total_pumped_oz) as avg_pumped_7d
        FROM daily_stats
        WHERE date >= ?
    ''', (last_7_start,))
    
    last_7 = cursor.fetchone()
    
    # Trend calculation (last 3 vs previous 3)
    last_3_start = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    prev_6_start = (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d')
    
    cursor.execute('''
        SELECT AVG(total_pumped_oz) as avg
        FROM daily_stats
        WHERE date >= ?
    ''', (last_3_start,))
    last_3_avg = cursor.fetchone()['avg'] or 0
    
    cursor.execute('''
        SELECT AVG(total_pumped_oz) as avg
        FROM daily_stats
        WHERE date BETWEEN ? AND ?
    ''', (prev_6_start, last_3_start))
    prev_3_avg = cursor.fetchone()['avg'] or 0
    
    trend = ((last_3_avg - prev_3_avg) / prev_3_avg * 100) if prev_3_avg > 0 else 0
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'avgDailyPumped': round(row['avg_pumped'] or 0, 1),
            'avgDailyFed': round(row['avg_fed'] or 0, 1),
            'avgDailySurplus': round(row['avg_surplus'] or 0, 1),
            'totalPumped': round(row['total_pumped'] or 0, 1),
            'totalFed': round(row['total_fed'] or 0, 1),
            'totalDays': row['total_days'],
            'last7DaysAvg': round(last_7['avg_pumped_7d'] or 0, 1),
            'trendPercent': round(trend, 1)
        }
    })

@app.route('/api/stats/today', methods=['GET'])
def get_today_stats():
    """Get today's statistics"""
    today = datetime.now().strftime('%Y-%m-%d')
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get today's pumping sessions
    cursor.execute('''
        SELECT SUM(amount_oz) as total, COUNT(*) as count
        FROM pumping_sessions
        WHERE date = ?
    ''', (today,))
    pump_row = cursor.fetchone()
    
    # Get today's feedings
    cursor.execute('''
        SELECT SUM(amount_oz) as total, COUNT(*) as count
        FROM baby_feedings
        WHERE date = ?
    ''', (today,))
    feed_row = cursor.fetchone()
    
    # Get average for comparison
    cursor.execute('''
        SELECT AVG(total_pumped_oz) as avg_pumped, AVG(total_fed_oz) as avg_fed
        FROM daily_stats
        WHERE date < ?
    ''', (today,))
    avg_row = cursor.fetchone()
    
    conn.close()
    
    total_pumped = pump_row['total'] or 0
    total_fed = feed_row['total'] or 0
    avg_pumped = avg_row['avg_pumped'] or 1
    avg_fed = avg_row['avg_fed'] or 1
    
    return jsonify({
        'success': True,
        'data': {
            'date': today,
            'pumping': {
                'total': round(total_pumped, 1),
                'count': pump_row['count'] or 0,
                'percentOfAvg': round((total_pumped / avg_pumped * 100), 0)
            },
            'feeding': {
                'total': round(total_fed, 1),
                'count': feed_row['count'] or 0,
                'percentOfAvg': round((total_fed / avg_fed * 100), 0)
            }
        }
    })

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Milk Tracker API is running'
    })

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export all data as JSON"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all pumping sessions
    cursor.execute('SELECT * FROM pumping_sessions ORDER BY date, time')
    pumping = cursor.fetchall()
    
    # Get all feedings
    cursor.execute('SELECT * FROM baby_feedings ORDER BY date, time')
    feedings = cursor.fetchall()
    
    conn.close()
    
    pumping_data = {}
    for row in pumping:
        date = row['date']
        if date not in pumping_data:
            pumping_data[date] = []
        pumping_data[date].append({
            'time': row['time'],
            'amount': row['amount_oz'],
            'notes': row['notes']
        })
    
    feeding_data = {}
    for row in feedings:
        date = row['date']
        if date not in feeding_data:
            feeding_data[date] = []
        feeding_data[date].append({
            'time': row['time'],
            'amount': row['amount_oz'],
            'nursed': bool(row['nursed']),
            'notes': row['notes']
        })
    
    return jsonify({
        'success': True,
        'data': {
            'pumpingSessions': pumping_data,
            'babyFeedings': feeding_data,
            'exportDate': datetime.now().isoformat()
        }
    })

# ============================================================================
# INITIALIZATION
# ============================================================================

if __name__ == '__main__':
    # Initialize database
    if not os.path.exists(DATABASE):
        print("🔧 Creating new database...")
        init_db()
        print("📦 Migrating JSON data...")
        migrate_json_data()
        print("📊 Calculating statistics...")
        calculate_daily_stats()
    else:
        print("✅ Database already exists")
    
    print("\n" + "="*60)
    print("🚀 Starting Milk Tracker API Server")
    print("="*60)
    print(f"📍 URL: http://localhost:5000")
    print(f"💾 Database: {DATABASE}")
    print("\n📋 Available Endpoints:")
    print("   GET    /api/health           - Health check")
    print("   GET    /api/pumping          - Get pumping sessions")
    print("   POST   /api/pumping          - Add pumping session")
    print("   PUT    /api/pumping/:id      - Update pumping session")
    print("   DELETE /api/pumping/:id      - Delete pumping session")
    print("   GET    /api/feeding          - Get feedings")
    print("   POST   /api/feeding          - Add feeding")
    print("   PUT    /api/feeding/:id      - Update feeding")
    print("   DELETE /api/feeding/:id      - Delete feeding")
    print("   GET    /api/stats/daily      - Get daily stats")
    print("   GET    /api/stats/summary    - Get summary stats")
    print("   GET    /api/stats/today      - Get today's stats")
    print("   GET    /api/export           - Export all data")
    print("="*60 + "\n")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
