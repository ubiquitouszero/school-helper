import { createClient } from '@supabase/supabase-js';

// These will come from environment variables
// Create a .env file with:
//   PUBLIC_SUPABASE_URL=your-project-url
//   PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching our schema
export interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  player_id: string;
  game_type: 'math' | 'numbers' | 'words';
  difficulty?: 'easy' | 'medium' | 'hard' | 'challenge';
  mode?: string;
  score: number;
  total_questions: number;
  time_seconds?: number;
  created_at: string;
}

export interface Trophy {
  id: string;
  player_id: string;
  game_type: string;
  trophy_type: 'bronze' | 'silver' | 'gold';
  earned_at: string;
}

// Helper functions

// Get all players
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }
  return data || [];
}

// Get player by name
export async function getPlayerByName(name: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error('Error fetching player:', error);
    return null;
  }
  return data;
}

// Save a game session
export async function saveGameSession(
  session: Omit<GameSession, 'id' | 'created_at'>
): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error saving game session:', error);
    return null;
  }
  return data;
}

// Get trophies for a player
export async function getPlayerTrophies(playerId: string): Promise<Trophy[]> {
  const { data, error } = await supabase
    .from('trophies')
    .select('*')
    .eq('player_id', playerId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching trophies:', error);
    return [];
  }
  return data || [];
}

// Award a trophy (upsert - won't duplicate)
export async function awardTrophy(
  playerId: string,
  gameType: string,
  trophyType: 'bronze' | 'silver' | 'gold'
): Promise<Trophy | null> {
  const { data, error } = await supabase
    .from('trophies')
    .upsert(
      { player_id: playerId, game_type: gameType, trophy_type: trophyType },
      { onConflict: 'player_id,game_type,trophy_type' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error awarding trophy:', error);
    return null;
  }
  return data;
}

// Get recent sessions for a player
export async function getRecentSessions(playerId: string, limit = 10): Promise<GameSession[]> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return data || [];
}
