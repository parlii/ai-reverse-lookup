import { NextResponse } from 'next/server';
import { getHistory, clearHistory, WordHistoryItem, saveToHistory } from '@/lib/kv';

// GET /api/history - Get all word history
export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ history: [] });
  }
}

// POST /api/history - Add new item to history
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, description, language, pronunciation, completion } = body;
    
    if (!word || !description || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const saved = await saveToHistory({
      word,
      description, 
      language,
      pronunciation,
      completion,
      timestamp: Date.now()
    });
    
    return NextResponse.json({ success: saved });
  } catch (error) {
    console.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to save to history' },
      { status: 500 }
    );
  }
}

// DELETE /api/history - Clear all history with password protection
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password required', success: false },
        { status: 400 }
      );
    }
    
    const cleared = await clearHistory(password);
    return NextResponse.json({ success: cleared });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history', success: false },
      { status: 500 }
    );
  }
}