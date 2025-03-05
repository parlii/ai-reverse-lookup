import { NextResponse } from 'next/server';
import { getHistory, saveToHistory, clearHistory } from '@/lib/kv';

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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { word, description, language, completion, pronunciation } = body;

    // Validate required fields
    if (!word || !description || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp and optional fields
    const historyItem = {
      word,
      description,
      language,
      timestamp: Date.now(),
      completion, // Include completion if provided
      pronunciation // Include pronunciation if provided
    };

    const saved = await saveToHistory(historyItem);
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
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Check password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password', success: false },
        { status: 401 }
      );
    }

    // Pass the password to clearHistory if it requires it
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