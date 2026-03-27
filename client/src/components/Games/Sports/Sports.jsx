import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../store/gameStore';
import { formatPrice } from '../../../utils/helpers';

// Team color map
const TEAM_COLORS = {
  Navi: '#f0c000', FaZe: '#e04040', G2: '#555555', Vitality: '#ffd700',
  MOUZ: '#e01020', Spirit: '#5050e0', Heroic: '#3366cc', Cloud9: '#009fdf',
  Liquid: '#4477aa', ENCE: '#1d428a', Astralis: '#e41e24', NiP: '#c9a64a',
  Fnatic: '#ff5900', BIG: '#555555', Complexity: '#445577', Monte: '#6644aa',
};

function TeamLogo({ name, size = 40 }) {
  const color = TEAM_COLORS[name] || '#666';
  const initials = name?.substring(0, 2).toUpperCase() || '??';
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        fontSize: size * 0.35,
        border: `2px solid ${color}66`,
      }}
    >
      {initials}
    </div>
  );
}

function formatTimeUntil(seconds) {
  if (seconds <= 0) return 'Starting...';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

const SPORT_DISPLAY = {
  AMERICANFOOTBALL: 'NFL', BASKETBALL: 'NBA', BASEBALL: 'MLB',
  ICEHOCKEY: 'NHL', SOCCER: 'Soccer', MMA: 'MMA',
};

export default function Sports() {
  const { activePlayer, fetchPlayers, pingNGame } = useGameStore();
  const [tab, setTab] = useState('upcoming'); // upcoming, live, results, mybets
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [results, setResults] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [matchBets, setMatchBets] = useState({}); // { [matchId]: [...bets] }
  const [betSlip, setBetSlip] = useState(null); // { matchId, betType, selection, odds, team1, team2 }
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRealSports, setIsRealSports] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/sports/matches');
      const data = await res.json();
      setMatches(data);
    } catch (e) {}
  }, []);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/sports/live');
      const data = await res.json();
      setLiveMatches(data);
    } catch (e) {}
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/sports/results');
      const data = await res.json();
      setResults(data);
    } catch (e) {}
  }, []);

  const fetchMyBets = useCallback(async () => {
    if (!activePlayer) return;
    try {
      const res = await fetch(`/api/sports/my-bets/${activePlayer.id}`);
      const data = await res.json();
      setMyBets(data);
    } catch (e) {}
  }, [activePlayer]);

  const fetchMatchBets = useCallback(async (matchId) => {
    try {
      const res = await fetch(`/api/sports/match-bets/${matchId}`);
      const data = await res.json();
      setMatchBets(prev => ({ ...prev, [matchId]: data }));
    } catch (e) {}
  }, []);

  useEffect(() => {
    pingNGame({ screen: 'in_game', mode: 'sports' });
    fetch('/api/sports/status').then(r => r.json()).then(d => setIsRealSports(d.realSportsEnabled)).catch(() => {});
    fetchMatches();
    fetchLive();
    fetchResults();
    fetchMyBets();

    const interval = setInterval(() => {
      fetchMatches();
      fetchLive();
      if (tab === 'results') fetchResults();
      if (tab === 'mybets') fetchMyBets();
    }, 5000);

    return () => clearInterval(interval);
  }, [tab]);

  // Countdown timer for upcoming matches
  useEffect(() => {
    const timer = setInterval(() => {
      setMatches(prev => prev.map(m => ({
        ...m,
        time_until_start: Math.max(0, m.time_until_start - 1),
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToBetSlip = (match, betType, selection, odds) => {
    setBetSlip({ matchId: match.id, betType, selection, odds, team1: match.team1, team2: match.team2 });
    setBetAmount('');
  };

  const placeBet = async () => {
    if (!betSlip) return;
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid bet amount');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (amount > activePlayer.wallet) {
      setError('Insufficient funds');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sports/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayer.id,
          matchId: betSlip.matchId,
          betType: betSlip.betType,
          selection: betSlip.selection,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchPlayers();
        fetchMyBets();
        setBetSlip(null);
        setBetAmount('');
        setError('');
      } else {
        setError(data.error || 'Bet failed');
        setTimeout(() => setError(''), 3000);
      }
    } catch (e) {
      setError('Network error');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  };

  const quickBetAmount = (pct) => {
    const amt = Math.floor(activePlayer.wallet * pct * 100) / 100;
    setBetAmount(amt.toString());
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-4">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">{isRealSports ? '🏆' : '🎮'}</span>
              {isRealSports ? 'Sports Betting' : 'CS:GO Match Betting'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isRealSports ? 'Real-world sports — NFL, NBA, MLB, NHL, Soccer, MMA' : 'Bet on simulated pro matches'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-xs">Your Balance</div>
            <div className="text-yellow-400 font-bold text-lg">{formatPrice(activePlayer?.wallet)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1a1a24] rounded-lg p-1">
          {[
            { key: 'upcoming', label: 'Upcoming', count: matches.length },
            { key: 'live', label: 'Live', count: liveMatches.length },
            { key: 'results', label: 'Results', count: results.length },
            { key: 'mybets', label: 'My Bets', count: myBets.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-yellow-400/20 text-yellow-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {t.label}
              {t.key === 'live' && t.count > 0 && (
                <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
              )}
              {t.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-yellow-400/30' : 'bg-gray-700'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Matches */}
        {tab === 'upcoming' && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">🎮</div>
                <div className="text-lg font-medium">No upcoming matches</div>
                <div className="text-sm mt-1">New matches are generated every few minutes</div>
              </div>
            ) : (
              matches.map(match => (
                <motion.div
                  key={match.id}
                  layout
                  className="bg-[#1a1a24] border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-colors"
                >
                  {/* Match Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => {
                      const next = expandedMatch === match.id ? null : match.id;
                      setExpandedMatch(next);
                      if (next) fetchMatchBets(next);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Team 1 */}
                      <div className="flex items-center gap-3 flex-1">
                        <TeamLogo name={match.team1} />
                        <div>
                          <div className="text-white font-semibold">{match.team1}</div>
                          <div className="text-xs text-gray-500">{match.team1_odds}x</div>
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="text-center px-4">
                        <div className="text-yellow-400 font-bold text-xs uppercase">
                          {match.format === 'real'
                            ? (SPORT_DISPLAY[match.map] || match.map || 'Sports')
                            : match.format?.toUpperCase()}
                        </div>
                        {match.format !== 'real' && (
                          <div className="text-gray-500 text-[10px] mt-0.5">{match.map}</div>
                        )}
                        <div className="text-gray-400 text-xs mt-1 font-mono">
                          {formatTimeUntil(match.time_until_start)}
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="text-right">
                          <div className="text-white font-semibold">{match.team2}</div>
                          <div className="text-xs text-gray-500">{match.team2_odds}x</div>
                        </div>
                        <TeamLogo name={match.team2} />
                      </div>
                    </div>

                    {/* Quick Bet Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); addToBetSlip(match, 'winner', match.team1, match.team1_odds); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                          betSlip?.matchId === match.id && betSlip?.selection === match.team1
                            ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                            : 'bg-gray-800/50 border-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                        }`}
                      >
                        {match.team1} <span className="text-yellow-400/80 ml-1">{match.team1_odds}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToBetSlip(match, 'winner', match.team2, match.team2_odds); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                          betSlip?.matchId === match.id && betSlip?.selection === match.team2
                            ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                            : 'bg-gray-800/50 border-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                        }`}
                      >
                        {match.team2} <span className="text-yellow-400/80 ml-1">{match.team2_odds}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Over/Under bets + Open Bets */}
                  <AnimatePresence>
                    {expandedMatch === match.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-gray-800/50 space-y-3">
                          {/* Over/Under — only for simulated CS:GO matches */}
                          {match.format !== 'real' && (
                            <div>
                              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Total Rounds</div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addToBetSlip(match, 'over_rounds', match.over_under_line?.toString() || '26.5', match.over_odds || 1.90)}
                                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                    betSlip?.matchId === match.id && betSlip?.betType === 'over_rounds'
                                      ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                                      : 'bg-gray-800/50 border-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                                  }`}
                                >
                                  Over {match.over_under_line || 26.5}
                                  <span className="text-yellow-400/80 ml-1">{(match.over_odds || 1.90).toFixed(2)}</span>
                                </button>
                                <button
                                  onClick={() => addToBetSlip(match, 'under_rounds', match.over_under_line?.toString() || '26.5', match.under_odds || 1.90)}
                                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                    betSlip?.matchId === match.id && betSlip?.betType === 'under_rounds'
                                      ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                                      : 'bg-gray-800/50 border-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                                  }`}
                                >
                                  Under {match.over_under_line || 26.5}
                                  <span className="text-yellow-400/80 ml-1">{(match.under_odds || 1.90).toFixed(2)}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Open Bets on this match */}
                          {(() => {
                            const bets = matchBets[match.id] || [];
                            if (bets.length === 0) return (
                              <div className="text-xs text-gray-600 italic">No bets placed yet</div>
                            );
                            const team1Bets = bets.filter(b => b.bet_type === 'winner' && b.selection === match.team1);
                            const team2Bets = bets.filter(b => b.bet_type === 'winner' && b.selection === match.team2);
                            const team1Total = team1Bets.reduce((s, b) => s + b.amount, 0);
                            const team2Total = team2Bets.reduce((s, b) => s + b.amount, 0);
                            return (
                              <div>
                                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Open Bets ({bets.length})</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-gray-800/40 rounded-lg p-2">
                                    <div className="text-xs font-medium text-gray-300 mb-1">{match.team1}</div>
                                    {team1Bets.length === 0 ? (
                                      <div className="text-xs text-gray-600">No bets</div>
                                    ) : (
                                      <>
                                        <div className="text-xs text-yellow-400 font-bold">{formatPrice(team1Total)}</div>
                                        {team1Bets.map((b, i) => (
                                          <div key={i} className="text-[10px] text-gray-500 mt-0.5">
                                            {b.player_name}: {formatPrice(b.amount)}
                                          </div>
                                        ))}
                                      </>
                                    )}
                                  </div>
                                  <div className="bg-gray-800/40 rounded-lg p-2">
                                    <div className="text-xs font-medium text-gray-300 mb-1">{match.team2}</div>
                                    {team2Bets.length === 0 ? (
                                      <div className="text-xs text-gray-600">No bets</div>
                                    ) : (
                                      <>
                                        <div className="text-xs text-yellow-400 font-bold">{formatPrice(team2Total)}</div>
                                        {team2Bets.map((b, i) => (
                                          <div key={i} className="text-[10px] text-gray-500 mt-0.5">
                                            {b.player_name}: {formatPrice(b.amount)}
                                          </div>
                                        ))}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Live Matches */}
        {tab === 'live' && (
          <div className="space-y-3">
            {liveMatches.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">📺</div>
                <div className="text-lg font-medium">No live matches</div>
                <div className="text-sm mt-1">Matches go live when their start time arrives</div>
              </div>
            ) : (
              liveMatches.map(match => (
                <div
                  key={match.id}
                  className="bg-[#1a1a24] border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold uppercase">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                    <span className="text-xs text-gray-500">{match.format?.toUpperCase()} &bull; {match.map}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TeamLogo name={match.team1} size={48} />
                      <div className="text-white font-semibold text-lg">{match.team1}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white font-mono">
                        <span className={match.score1 > match.score2 ? 'text-green-400' : ''}>{match.score1}</span>
                        <span className="text-gray-600 mx-2">:</span>
                        <span className={match.score2 > match.score1 ? 'text-green-400' : ''}>{match.score2}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-white font-semibold text-lg">{match.team2}</div>
                      <TeamLogo name={match.team2} size={48} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Results */}
        {tab === 'results' && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">🏆</div>
                <div>No completed matches yet</div>
              </div>
            ) : (
              results.map(match => {
                const isReal = match.is_real || match.format === 'real';
                const label = isReal
                  ? (match.sport_label || SPORT_DISPLAY[match.map] || match.map || 'Sports')
                  : `${match.format?.toUpperCase()} \u2022 ${match.map}`;
                return (
                  <div
                    key={match.id}
                    className="bg-[#1a1a24] border border-gray-800/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <TeamLogo name={match.team1} size={36} />
                        <span className={`font-semibold ${match.score1 > match.score2 ? 'text-green-400' : 'text-gray-400'}`}>
                          {match.team1}
                        </span>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-xl font-bold font-mono text-white">
                          {match.score1} - {match.score2}
                        </div>
                        <div className="text-[10px] text-gray-600 uppercase">{label}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className={`font-semibold ${match.score2 > match.score1 ? 'text-green-400' : 'text-gray-400'}`}>
                          {match.team2}
                        </span>
                        <TeamLogo name={match.team2} size={36} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* My Bets */}
        {tab === 'mybets' && (
          <div className="space-y-2">
            {myBets.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">🎯</div>
                <div>No bets placed yet</div>
              </div>
            ) : (
              myBets.map(bet => (
                <div
                  key={bet.id}
                  className="bg-[#1a1a24] border border-gray-800/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-gray-300 font-medium text-sm">
                        {bet.team1} vs {bet.team2}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500 capitalize">
                          {bet.bet_type === 'winner' ? `Winner: ${bet.selection}` :
                           bet.bet_type === 'over_rounds' ? `Over ${bet.selection} rounds` :
                           `Under ${bet.selection} rounds`}
                        </span>
                        <span className="text-xs text-gray-500">
                          @ <span className="text-yellow-400">{bet.odds_at_bet}x</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Bet: <span className="text-gray-300">{formatPrice(bet.amount)}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      {bet.status === 'pending' ? (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded font-medium">
                          Pending
                        </span>
                      ) : bet.status === 'won' ? (
                        <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded font-bold">
                          WON {formatPrice(bet.payout)}
                        </span>
                      ) : (
                        <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded">
                          LOST
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bet Slip Sidebar */}
      <div className="w-72 shrink-0">
        <div className="bg-[#1a1a24] border border-gray-800/50 rounded-xl sticky top-4">
          <div className="p-4 border-b border-gray-800/50">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Bet Slip</h3>
          </div>

          {betSlip ? (
            <div className="p-4">
              {/* Selected Bet */}
              <div className="bg-[#12121a] rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-1">
                  {betSlip.team1} vs {betSlip.team2}
                </div>
                <div className="text-white font-medium text-sm">
                  {betSlip.betType === 'winner' ? `${betSlip.selection} to win` :
                   betSlip.betType === 'over_rounds' ? `Over ${betSlip.selection} rounds` :
                   `Under ${betSlip.selection} rounds`}
                </div>
                <div className="text-yellow-400 font-bold mt-1">
                  @ {typeof betSlip.odds === 'number' ? betSlip.odds.toFixed(2) : betSlip.odds}
                </div>
              </div>

              {/* Amount Input */}
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#12121a] border border-gray-700/50 rounded-lg py-2.5 pl-7 pr-3 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                {[0.1, 0.25, 0.5, 1].map(pct => (
                  <button
                    key={pct}
                    onClick={() => quickBetAmount(pct)}
                    className="py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded transition"
                  >
                    {pct === 1 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              {/* Potential Payout */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500">Potential Payout</div>
                  <div className="text-green-400 font-bold text-lg">
                    {formatPrice(parseFloat(betAmount) * betSlip.odds)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Profit: {formatPrice(parseFloat(betAmount) * betSlip.odds - parseFloat(betAmount))}
                  </div>
                </div>
              )}

              {/* Place Bet Button */}
              <button
                onClick={placeBet}
                disabled={loading || !betAmount || parseFloat(betAmount) <= 0}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-yellow-500"
              >
                {loading ? 'Placing...' : 'Place Bet'}
              </button>

              {/* Cancel */}
              <button
                onClick={() => { setBetSlip(null); setBetAmount(''); }}
                className="w-full py-2 mt-2 text-gray-500 hover:text-gray-300 text-xs transition"
              >
                Clear Bet Slip
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600 text-sm">
              <div className="text-2xl mb-2">🎯</div>
              <div>Select a match outcome to add it to your bet slip</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
