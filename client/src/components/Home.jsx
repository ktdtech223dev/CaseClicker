import React, { useEffect, useRef, useState, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { UPGRADE_TIERS } from '../data/upgrades';
import { RANKS } from '../data/ranks';
import ClickTarget from './Home/ClickTarget';
import FloatingNumbers from './Home/FloatingNumbers';
import ClickParticles from './Home/ClickParticles';
import StatsPanel from './Home/StatsPanel';
import MilestoneTracker from './Home/MilestoneTracker';
import UpgradeList from './Home/UpgradeList';
import PrestigePanel from './Home/PrestigePanel';
import GeneratorRow from './Home/GeneratorRow';
import OfflineEarningsModal from './Home/OfflineEarningsModal';
import DailyBonusModal from './Home/DailyBonusModal';
import CaseDropNotification from './Home/CaseDropNotification';
import BoostSystem from './Home/BoostSystem';
import { playSound } from '../utils/audio';

export default function Home() {
  const { activePlayer, handleClick, collectAutoIncome, purchaseUpgrade, pingNGame, addNotification } = useGameStore();
  const autoIncomeRef = useRef(null);
  const clickAreaRef = useRef(null);
  const [upgradeLevels, setUpgradeLevels] = useState({});
  const [offlineData, setOfflineData] = useState(null);
  const [dailyBonus, setDailyBonus] = useState(null);
  const [caseDrop, setCaseDrop] = useState(null);
  const [activeBoosts, setActiveBoosts] = useState([]);

  // Initialize floating numbers and particles as hooks
  const floatingNumbers = FloatingNumbers({ containerRef: clickAreaRef });
  const clickParticles = ClickParticles();

  // Get rank info
  const prestigeLevel = activePlayer?.prestige_level || 0;
  const currentRank = RANKS[prestigeLevel] || RANKS[0];
  const nextRank = RANKS[prestigeLevel + 1] || null;

  // Get next tier unlock
  const lifetimeEarned = activePlayer?.lifetime_earned || 0;
  const nextTier = UPGRADE_TIERS.find(t => lifetimeEarned < t.unlockAt) || null;

  // Effective click value with multipliers
  const effectiveClickValue = (activePlayer?.click_value || 0.01) *
    (activePlayer?.prestige_multiplier || 1) *
    (1 + (activePlayer?.global_multiplier || 0));

  useEffect(() => {
    pingNGame({ screen: 'clicking', balance: activePlayer?.wallet });

    // Auto income ticker
    autoIncomeRef.current = setInterval(() => {
      collectAutoIncome(1);
    }, 1000);

    // Fetch upgrade levels
    if (activePlayer?.id) {
      fetch(`/api/players/${activePlayer.id}/upgrades`)
        .then(r => r.json())
        .then(data => {
          const levels = {};
          if (Array.isArray(data)) {
            data.forEach(u => { levels[u.upgrade_type] = u.level; });
          }
          setUpgradeLevels(levels);
        })
        .catch(() => {});

      // Check offline earnings
      fetch(`/api/players/${activePlayer.id}/collect-offline`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.earned > 0) {
            setOfflineData(data);
            useGameStore.setState({ activePlayer: data.player });
          }
        })
        .catch(() => {});

      // Check daily bonus
      fetch(`/api/players/${activePlayer.id}/daily-bonus`)
        .then(r => r.json())
        .then(data => {
          if (data.canClaim) {
            setDailyBonus(data);
          }
        })
        .catch(() => {});
    }

    return () => clearInterval(autoIncomeRef.current);
  }, []);

  const onClickButton = useCallback(async (e) => {
    // Get click position relative to the click area
    const rect = clickAreaRef.current?.getBoundingClientRect();
    const x = rect ? (rect.width / 2) : 100;
    const y = rect ? (rect.height / 2 - 30) : 80;

    // Check for boost multiplier
    let boostMultiplier = 1;
    const goldenBoost = activeBoosts.find(b => b.id === 'golden_click' && b.expiresAt > Date.now());
    if (goldenBoost) boostMultiplier = 100;
    const clickBoost = activeBoosts.find(b => b.id === '2x_click' && b.expiresAt > Date.now());
    if (clickBoost) boostMultiplier *= 2;

    const earned = effectiveClickValue * boostMultiplier;
    floatingNumbers.spawn(earned, x, y);
    clickParticles.burst(x + (rect?.left || 0) - (clickAreaRef.current?.offsetLeft || 0), y);

    playSound('click');
    const result = await handleClick();
    if (result?.caseDrop) {
      setCaseDrop(result.caseDrop);
      setTimeout(() => setCaseDrop(null), 4000);
    }

    // Refresh upgrade levels occasionally
    if (activePlayer && Math.random() < 0.05) {
      fetch(`/api/players/${activePlayer.id}/upgrades`)
        .then(r => r.json())
        .then(data => {
          const levels = {};
          if (Array.isArray(data)) data.forEach(u => { levels[u.upgrade_type] = u.level; });
          setUpgradeLevels(levels);
        })
        .catch(() => {});
    }
  }, [effectiveClickValue, activeBoosts, activePlayer]);

  const onPurchaseUpgrade = useCallback(async (upgradeId) => {
    const result = await purchaseUpgrade(upgradeId);
    if (result?.upgrades) {
      playSound('upgrade_buy');
      const levels = {};
      result.upgrades.forEach(u => { levels[u.upgrade_type] = u.level; });
      setUpgradeLevels(levels);
    }
  }, [purchaseUpgrade]);

  const onPrestige = useCallback(async () => {
    if (!activePlayer?.id) return;
    try {
      const res = await fetch(`/api/prestige/${activePlayer.id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        useGameStore.setState({ activePlayer: data.player });
        setUpgradeLevels({});
        addNotification(data.message, 'gold');
      } else {
        const err = await res.json();
        addNotification(err.error, 'red');
      }
    } catch (e) {
      addNotification('Prestige failed', 'red');
    }
  }, [activePlayer]);

  const onClaimDailyBonus = useCallback(async () => {
    if (!activePlayer?.id) return;
    try {
      const res = await fetch(`/api/players/${activePlayer.id}/daily-bonus`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        useGameStore.setState({ activePlayer: data.player });
        addNotification(`Day ${data.day} bonus: +$${data.reward}!`, 'green');
        setDailyBonus(null);
      }
    } catch {}
  }, [activePlayer]);

  const onActivateBoost = useCallback((boost) => {
    setActiveBoosts(prev => [...prev, boost]);
    addNotification(`${boost.name} activated!`, 'blue');
  }, []);

  if (!activePlayer) return null;

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Stats */}
      <StatsPanel player={activePlayer} rank={currentRank} />

      {/* Milestones */}
      <MilestoneTracker player={activePlayer} nextRank={nextRank} nextTier={nextTier} />

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Click area — 2 columns */}
        <div className="lg:col-span-2 flex flex-col items-center justify-start pt-4 relative" ref={clickAreaRef}>
          {floatingNumbers.element}
          {clickParticles.element}
          <ClickTarget onClick={onClickButton} clickValue={effectiveClickValue} />
          <GeneratorRow upgradeLevels={upgradeLevels} />
        </div>

        {/* Upgrades — 3 columns */}
        <div className="lg:col-span-3">
          <UpgradeList
            player={activePlayer}
            upgradeLevels={upgradeLevels}
            onPurchase={onPurchaseUpgrade}
          />
        </div>
      </div>

      {/* Prestige */}
      <PrestigePanel
        player={activePlayer}
        currentRank={currentRank}
        nextRank={nextRank}
        onPrestige={onPrestige}
      />

      {/* Boost system */}
      <BoostSystem onActivateBoost={onActivateBoost} />

      {/* Modals */}
      <OfflineEarningsModal
        show={!!offlineData}
        earned={offlineData?.earned}
        elapsed={offlineData?.elapsed}
        onClose={() => setOfflineData(null)}
      />
      <DailyBonusModal
        show={!!dailyBonus}
        streak={dailyBonus?.streak || 0}
        onClaim={onClaimDailyBonus}
        onClose={() => setDailyBonus(null)}
      />
      <CaseDropNotification caseDrop={caseDrop} onDismiss={() => setCaseDrop(null)} />
    </div>
  );
}
