#!/bin/bash

# RiskFlux Production System Test
# Tests all real data APIs and hazard scoring with production data

echo "🚀 RiskFlux Production System - API Integration Test"
echo "=================================================="
echo ""

# Test locations (variety of climates and terrains)
declare -a TEST_LOCATIONS=(
    "52.1332,-106.6700"  # Saskatoon, Canada (prairie, moderate snow)
    "40.7128,-74.0060"   # New York, USA (coastal, hurricanes)
    "39.7392,-104.9903"  # Denver, USA (high elevation, low snow)
    "48.1351,11.5820"    # Munich, Germany (alpine, regular snow)
    "34.0522,-118.2437"  # Los Angeles, USA (dry, low flood risk)
)

BASE_URL="http://localhost:4000/api/v1"
RESULTS_FILE="/tmp/riskflux_test_results.json"

# Initialize results file
echo "[]" > "$RESULTS_FILE"

echo "Testing with 5 diverse global locations..."
echo ""

for i in "${!TEST_LOCATIONS[@]}"; do
    COORDS="${TEST_LOCATIONS[$i]}"
    LAT=$(echo $COORDS | cut -d',' -f1)
    LON=$(echo $COORDS | cut -d',' -f2)
    
    echo "Test $((i+1))/5: Location ($LAT, $LON)"
    
    # Make API request to hazard score endpoint
    RESPONSE=$(curl -s -X POST "$BASE_URL/hazard-score" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        -d "{
            \"latitude\": $LAT,
            \"longitude\": $LON
        }")
    
    # Extract scores
    OVERALL=$(echo $RESPONSE | grep -o '"overallScore":[0-9]*' | cut -d':' -f2)
    FLOOD=$(echo $RESPONSE | grep -o '"floodScore":[0-9]*' | cut -d':' -f2)
    STORM=$(echo $RESPONSE | grep -o '"stormScore":[0-9]*' | cut -d':' -f2)
    SNOW=$(echo $RESPONSE | grep -o '"snowScore":[0-9]*' | cut -d':' -f2)
    
    if [ -z "$OVERALL" ]; then
        echo "  ❌ Failed - No response or invalid token"
        echo "  Note: Use a valid JWT token for testing"
    else
        echo "  ✅ Success - Scores retrieved"
        echo "    Overall Risk: $OVERALL/100"
        echo "    Flood Risk: $FLOOD/100"
        echo "    Storm Risk: $STORM/100"
        echo "    Snow Risk: $SNOW/100"
    fi
    echo ""
    
    sleep 1  # Rate limiting
done

echo "=================================================="
echo "✨ Test Complete!"
echo ""
echo "API Response Format:"
echo "{
  'overallScore': 0-100,
  'floodScore': 0-100,
  'stormScore': 0-100,
  'snowScore': 0-100,
  'factors': [
    {
      'factorName': 'distance_to_water_km',
      'factorValue': <value>,
      'weight': 0.6,
      'contribution': <score>
    },
    ...
  ]
}"
echo ""
echo "For detailed results and factor breakdowns, check the API response."
echo ""
echo "Note: First request may take 3-5 seconds (API calls)"
echo "      Subsequent requests are <100ms (cached)"
