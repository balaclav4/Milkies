#!/usr/bin/env python3
"""
Test script for Milk Tracker API
Run this to verify all endpoints work correctly
"""

import requests
import json
from datetime import datetime

API_BASE = 'http://localhost:5000/api'

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing health endpoint...")
    response = requests.get(f'{API_BASE}/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_get_pumping():
    """Test getting pumping sessions"""
    print("\n🍼 Testing GET pumping sessions...")
    response = requests.get(f'{API_BASE}/pumping')
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Found {len(data.get('data', {}))} days of data")
    return response.status_code == 200

def test_add_pumping():
    """Test adding a pumping session"""
    print("\n➕ Testing POST pumping session...")
    test_data = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'time': '10:00am',
        'amount': 8.5
    }
    response = requests.post(
        f'{API_BASE}/pumping',
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code in [200, 201, 409]  # 409 if already exists

def test_get_stats():
    """Test getting statistics"""
    print("\n📊 Testing stats endpoints...")
    
    # Daily stats
    response = requests.get(f'{API_BASE}/stats/daily')
    print(f"Daily stats status: {response.status_code}")
    
    # Summary stats
    response = requests.get(f'{API_BASE}/stats/summary')
    data = response.json()
    if data['success']:
        stats = data['data']
        print(f"Average daily output: {stats['avgDailyPumped']} oz")
        print(f"Total days tracked: {stats['totalDays']}")
    
    # Today's stats
    response = requests.get(f'{API_BASE}/stats/today')
    print(f"Today's stats status: {response.status_code}")
    
    return response.status_code == 200

def main():
    print("=" * 60)
    print("🧪 Milk Tracker API Test Suite")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health),
        ("Get Pumping Data", test_get_pumping),
        ("Add Pumping Session", test_add_pumping),
        ("Get Statistics", test_get_stats),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error in {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("📋 Test Results Summary")
    print("=" * 60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")

if __name__ == '__main__':
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to API server")
        print("Make sure the Flask server is running:")
        print("  python3 api_server.py")
