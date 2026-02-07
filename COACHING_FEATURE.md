# AI Coaching Feature

## Overview
The AI Coaching feature provides personalized rehabilitation recommendations based on a user's session history. It uses Claude (Anthropic) to analyze workout data and provide insights on pain progression, exercise modifications, and recovery strategies.

## Features
- **Pain Progression Analysis**: Tracks pain levels over time and identifies trends
- **Exercise Recommendations**: Suggests intensity adjustments (increase/decrease) based on performance
- **Form Warnings**: Identifies potential form issues if pain increases after specific exercises
- **Recovery Suggestions**: Provides advice on rest, recovery timing, and next steps
- **Coaching History**: Stores all recommendations for future reference

## Technical Implementation

### API Route: `/api/coaching/analyze`
- **Method**: POST
- **Auth**: Requires authenticated session
- **Function**: 
  - Fetches last 150 data points (15-20 sessions) from database
  - Formats session data for AI analysis
  - Calls Claude API with structured prompt
  - Stores recommendation in `coaching_logs` table
  - Returns formatted recommendation

### API Route: `/api/coaching/history`
- **Method**: GET
- **Auth**: Requires authenticated session
- **Function**: Retrieves past coaching recommendations for the user

### Frontend: `/app/coaching/page.tsx`
- **Features**:
  - Button to trigger new analysis
  - Display current recommendation with formatted sections
  - Expandable history of past recommendations
  - Loading states and error handling

## Database Schema
```sql
CREATE TABLE coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## AI Prompt Structure
The system uses a structured prompt that asks Claude to analyze session data and provide:
1. **Pain Progression**: Trends in pain levels
2. **Exercise Recommendations**: Specific modifications
3. **Form Warnings**: Potential issues to address
4. **Recovery Suggestions**: Next steps and rest advice

## Constraints
- Maximum response size: 5KB
- Sessions analyzed: Last 15-20 sessions (up to 150 data points)
- Model: claude-3-5-sonnet-20241022
- Token limit: 1500 max_tokens

## Error Handling
- Gracefully handles missing API key
- Returns user-friendly error messages
- Prevents analysis with insufficient data (< 1 session)
- Validates response size before storing

## Usage Flow
1. User navigates to `/coaching`
2. Clicks "Analyze My Progress"
3. System fetches recent session data
4. Sends data to Claude for analysis
5. Stores recommendation in database
6. Displays formatted result
7. User can view past recommendations in history section

## Future Enhancements
- Schedule automatic weekly check-ins
- Compare recommendations over time
- Export coaching reports
- Add more specific exercise form tips
- Integrate video analysis
