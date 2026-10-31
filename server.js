const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'game_config.json');
const DEFAULT_CONFIG_FILE = path.join(DATA_DIR, 'default_config.json');

// MIME 類型對照
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

// 載入與儲存配置
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } else if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
      const def = fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8');
      fs.writeFileSync(CONFIG_FILE, def, 'utf8');
      return JSON.parse(def);
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
  return {};
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving config:', err);
    return false;
  }
}

let activeConfig = loadConfig();

// 房間資料管理
const rooms = new Map();
// 訂閱房間 SSE clients: roomId -> Set of res objects
const sseSubscribers = new Map();

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function calculateDayOfYear(month, day) {
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let days = 0;
  for (let i = 0; i < month - 1; i++) {
    days += daysInMonths[i];
  }
  return days + day;
}

function getBirthdayDistance(bday1Str, bday2Str) {
  try {
    const [m1, d1] = (bday1Str || '01-01').split('-').map(Number);
    const [m2, d2] = (bday2Str || '01-01').split('-').map(Number);
    const day1 = calculateDayOfYear(m1, d1);
    const day2 = calculateDayOfYear(m2, d2);
    const diff = Math.abs(day1 - day2);
    return Math.min(diff, 365 - diff);
  } catch (e) {
    return 999;
  }
}

function createRoomState(roomId) {
  return {
    roomId,
    createdAt: Date.now(),
    phase: 'LOBBY', // LOBBY, SELECT_ROLE, SELECT_TRAINING, EVENT, ROLL_TRAINING, DRAW_MISSION, RESOLVE_MISSION, AWARDS_VICTORY, GAME_OVER
    round: 1,
    intensityMultiplier: 1,
    players: [],
    firstPlayerIndex: 0,
    currentEvent: null,
    currentMission: null,
    usedEventIds: [],
    usedMissionIds: [],
    eventHistory: [],
    missionHistory: [],
    teamMissionDicePool: {},
    gameLogs: [
      { timestamp: new Date().toLocaleTimeString(), text: '【作戰指揮所成立】主辦方已建立遊戲室，等待各梯次新兵加入。' }
    ],
    config: JSON.parse(JSON.stringify(activeConfig))
  };
}

function addLog(room, text) {
  room.gameLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    text
  });
  if (room.gameLogs.length > 100) room.gameLogs.pop();
}

function broadcastRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const subscribers = sseSubscribers.get(roomId);
  if (subscribers && subscribers.size > 0) {
    const payload = `data: ${JSON.stringify({ type: 'room:update', room })}\n\n`;
    for (const res of subscribers) {
      try {
        res.write(payload);
      } catch (e) {
        subscribers.delete(res);
      }
    }
  }
}

// 請求處理
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // SSE 訂閱端點: /api/events?roomId=XXXX
  if (pathname === '/api/events') {
    const roomId = (parsedUrl.searchParams.get('roomId') || '').toUpperCase();
    if (!roomId || !rooms.has(roomId)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '房間不存在' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    if (!sseSubscribers.has(roomId)) {
      sseSubscribers.set(roomId, new Set());
    }
    const set = sseSubscribers.get(roomId);
    set.add(res);

    // 立即傳送當前房間狀態
    res.write(`data: ${JSON.stringify({ type: 'room:update', room: rooms.get(roomId) })}\n\n`);

    // 心跳維持連線
    const interval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(interval);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      set.delete(res);
      if (set.size === 0) sseSubscribers.delete(roomId);
    });
    return;
  }

  // 取得伺服器 IP 與狀態
  if (pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ips: getLocalIpAddresses(),
      port: PORT,
      activeRooms: Array.from(rooms.keys())
    }));
    return;
  }

  // 設定 API
  if (pathname === '/api/config') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, config: activeConfig }));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newConfig = JSON.parse(body);
          if (newConfig && newConfig.roles && newConfig.trainings) {
            activeConfig = newConfig;
            saveConfig(newConfig);
            // 同步至現存房間
            for (const room of rooms.values()) {
              room.config = JSON.parse(JSON.stringify(activeConfig));
              broadcastRoom(room.roomId);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: '設定已更新', config: activeConfig }));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '格式不正確' }));
          }
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: e.message }));
        }
      });
      return;
    }
  }

  if (pathname === '/api/config/reset' && req.method === 'POST') {
    try {
      if (fs.existsSync(DEFAULT_CONFIG_FILE)) {
        const def = fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8');
        fs.writeFileSync(CONFIG_FILE, def, 'utf8');
        activeConfig = JSON.parse(def);
        for (const room of rooms.values()) {
          room.config = JSON.parse(JSON.stringify(activeConfig));
          broadcastRoom(room.roomId);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '已重設回桌遊預設配置', config: activeConfig }));
        return;
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: '找不到預設配置' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: e.message }));
    }
    return;
  }

  // 房間與遊戲動作 API
  if (pathname === '/api/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { action, roomId, payload } = data;
        const normalizedRoomId = (roomId || '').toUpperCase();

        if (action === 'create_room') {
          let newRoomId = generateRoomId();
          while (rooms.has(newRoomId)) newRoomId = generateRoomId();
          const room = createRoomState(newRoomId);
          rooms.set(newRoomId, room);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, roomId: newRoomId, room }));
          return;
        }

        // 單人直接開局
        if (action === 'create_solo_game') {
          let newRoomId = generateRoomId();
          while (rooms.has(newRoomId)) newRoomId = generateRoomId();
          const room = createRoomState(newRoomId);
          room.isSolo = true;
          const { playerName, realBirthday, playerId } = payload || {};
          const pId = playerId || 'p_' + Math.random().toString(36).substring(2, 7);
          const player = {
            id: pId,
            name: playerName || '單兵戰友',
            realBirthday: realBirthday || '01-14',
            roleId: null,
            roleData: null,
            stats: { strength: 1, agility: 1, endurance: 1, intelligence: 1 },
            awards: { merit: 0, small: 0, large: 0, medal: 0 },
            currentTrainingId: null,
            lastTrainingId: null,
            diceResults: null,
            trainingSuccess: null,
            isReady: false
          };
          room.players.push(player);
          room.phase = 'SELECT_ROLE';
          addLog(room, `【個人生涯開局】新兵「${player.name}」已獨自入伍，即刻挑選代表身分！`);
          rooms.set(newRoomId, room);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, roomId: newRoomId, playerId: pId, room }));
          return;
        }

        const room = rooms.get(normalizedRoomId);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '房間不存在' }));
          return;
        }

        let handled = false;

        // 玩家加入
        if (action === 'join_room') {
          const { playerName, realBirthday, playerId: clientPlayerId } = payload;
          if (room.players.length >= 4 && !room.players.some(p => p.id === clientPlayerId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '房間已滿 (最多4人)' }));
            return;
          }
          const pId = clientPlayerId || 'p_' + Math.random().toString(36).substring(2, 7);
          let player = room.players.find(p => p.id === pId);
          if (!player) {
            player = {
              id: pId,
              name: playerName || `新兵 ${room.players.length + 1}`,
              realBirthday: realBirthday || '01-01',
              roleId: null,
              roleData: null,
              stats: { strength: 1, agility: 1, endurance: 1, intelligence: 1 },
              awards: { merit: 0, small: 0, large: 0, medal: 0 },
              currentTrainingId: null,
              lastTrainingId: null,
              diceResults: null,
              trainingSuccess: null,
              isReady: false
            };
            room.players.push(player);
            addLog(room, `【新兵報到】「${player.name}」已加入作戰序列。`);
          } else {
            player.name = playerName || player.name;
            player.realBirthday = realBirthday || player.realBirthday;
          }
          handled = true;
          broadcastRoom(room.roomId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, playerId: pId, room }));
          return;
        }

        // 開始選角
        if (action === 'start_role_selection') {
          const minPlayers = room.config.systemSettings.minPlayersToStart || 1;
          if (room.players.length < minPlayers) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `至少需要 ${minPlayers} 名玩家加入！` }));
            return;
          }
          room.phase = 'SELECT_ROLE';
          addLog(room, '【階段推進】進入「招募階段」，請挑選代表身分。');
          handled = true;
        }

        // 玩家選角 (支援自訂姓名與生日覆蓋)
        if (action === 'select_role') {
          const { playerId, roleId, customName, customBirthday } = payload;
          const player = room.players.find(p => p.id === playerId);
          const roleConfig = room.config.roles.find(r => r.id === roleId);
          if (player && roleConfig) {
            const taken = room.players.some(p => p.id !== playerId && p.roleId === roleId);
            if (taken) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: '該角色已被其他戰友選取！' }));
              return;
            }
            player.roleId = roleId;
            // 複製一份並以玩家自訂姓名與生日替換
            const customRole = JSON.parse(JSON.stringify(roleConfig));
            if (customName && customName.trim()) {
              player.name = customName.trim();
              customRole.soldierName = customName.trim();
            }
            if (customBirthday && customBirthday.trim()) {
              player.realBirthday = customBirthday.trim();
              customRole.birthday = customBirthday.trim();
              customRole.birthdayText = customBirthday.trim();
            }
            player.roleData = customRole;
            player.stats = { ...roleConfig.initialStats };
            player.isReady = true;
            addLog(room, `【身分定讞】玩家「${player.name}」確認擔任【${customRole.name} - ${customRole.soldierName}】。`);
            handled = true;
          }
        }

        // 主辦方確認選角完成並計算順位
        if (action === 'finalize_roles') {
          const unassigned = room.players.some(p => !p.roleId);
          if (unassigned) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '尚有玩家未挑選角色！' }));
            return;
          }

          let minDiff = 999;
          let firstIdx = 0;
          room.players.forEach((p, idx) => {
            const roleBday = p.roleData.birthday;
            const realBday = p.realBirthday;
            const diff = getBirthdayDistance(roleBday, realBday);
            p.birthdayDistance = diff;
            if (diff < minDiff) {
              minDiff = diff;
              firstIdx = idx;
            }
          });

          room.firstPlayerIndex = firstIdx;
          room.round = 1;
          room.intensityMultiplier = 1;
          room.phase = 'SELECT_TRAINING';
          addLog(room, `【先鋒順位】「${room.players[firstIdx].name}」真實生日與角色生日差距僅 ${minDiff} 天，榮膺先鋒！進入第 1 回合訓練選擇。`);
          handled = true;
        }

        // 選擇訓練
        if (action === 'choose_training') {
          const { playerId, trainingId } = payload;
          const player = room.players.find(p => p.id === playerId);
          const training = room.config.trainings.find(t => t.id === trainingId);
          if (player && training) {
            player.currentTrainingId = trainingId;
            player.diceResults = null;
            player.trainingSuccess = null;
            addLog(room, `【訓練指派】「${player.name}」前往【${training.name}】場地。`);
            handled = true;
          }
        }

        // 推進到事件抽卡
        if (action === 'proceed_to_event') {
          const notReady = room.players.some(p => !p.currentTrainingId);
          if (notReady) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '尚有人員未分配訓練項目！' }));
            return;
          }
          room.phase = 'EVENT';
          addLog(room, '【戰況更新】全體人員就位完畢，由當前首位玩家抽取事件卡！');
          handled = true;
        }

        // 抽事件卡
        if (action === 'draw_event') {
          if (room.usedEventIds.length >= room.config.events.length) {
            room.usedEventIds = [];
          }
          const available = room.config.events.filter(e => !room.usedEventIds.includes(e.id));
          const ev = available[Math.floor(Math.random() * available.length)];
          room.usedEventIds.push(ev.id);
          room.currentEvent = ev;
          room.eventHistory.unshift(ev);
          room.phase = 'ROLL_TRAINING';

          addLog(room, `【突發狀況】事件卡 #${ev.id}【${ev.name}】：${ev.description}（影響：${ev.effect}）`);

          // 立即結算型事件
          if (ev.effectType === 'grant_reward') {
            const rew = ev.effectPayload.reward;
            const amt = ev.effectPayload.amount || 1;
            room.players.forEach(p => { p.awards[rew] = (p.awards[rew] || 0) + amt; });
            addLog(room, `【突發獎勵】全體官兵榮獲 ${rew === 'small' ? '小功' : '獎勵'} x${amt}！`);
          }
          if (ev.effectType === 'direct_stat_gain') {
            const st = ev.effectPayload.stat;
            const amt = ev.effectPayload.amount || 1;
            room.players.forEach(p => { p.stats[st] = (p.stats[st] || 1) + amt; });
            addLog(room, `【素質強化】全體官兵 ${st} 屬性增加 ${amt} 點！`);
          }
          handled = true;
        }

        // 玩家訓練擲骰
        if (action === 'roll_training_dice') {
          const { playerId } = payload;
          const player = room.players.find(p => p.id === playerId);
          if (player && player.currentTrainingId) {
            const training = room.config.trainings.find(t => t.id === player.currentTrainingId);
            let targetSuccesses = training.targetSuccesses || 2;
            const intensity = Math.floor((room.round - 1) / (room.config.systemSettings.intensityDoubleEveryRounds || 5)) + 1;
            targetSuccesses *= intensity;

            // 事件修改
            if (room.currentEvent && room.currentEvent.effectType === 'override_target_success') {
              targetSuccesses = room.currentEvent.effectPayload.target || 1;
            }
            if (room.currentEvent && room.currentEvent.effectType === 'conditional_target_increase') {
              if (room.currentEvent.effectPayload.affectedTrainings?.includes(training.id)) {
                targetSuccesses += room.currentEvent.effectPayload.increase || 1;
              }
            }

            const mainStat = training.requiredStats[0];
            let diceCount = Math.max(1, player.stats[mainStat] || 1);

            // 角色技能與事件加乘
            const sameTrainingPlayers = room.players.filter(p => p.currentTrainingId === player.currentTrainingId);
            if (player.roleId === 'role_1') {
              if (training.requiredStats.includes('endurance')) diceCount += 1;
              if (sameTrainingPlayers.length > 1) diceCount += 1;
            }
            if (player.roleId === 'role_2') {
              if (sameTrainingPlayers.length === 1) diceCount += 1;
              if (training.requiredStats.includes('agility')) diceCount += 1;
            }
            if (player.roleId === 'role_3') {
              if (training.requiredStats.includes('strength')) diceCount += 1;
            }
            // 領導力：有社會人士同組時其他人也+1
            if (sameTrainingPlayers.some(p => p.roleId === 'role_3') && sameTrainingPlayers.length > 1) {
              if (player.roleId !== 'role_3') diceCount += 1;
            }
            if (player.roleId === 'role_4') {
              if (training.requiredStats.includes('intelligence')) diceCount += 1;
              if (player.lastTrainingId === player.currentTrainingId) diceCount += 1;
            }

            if (room.currentEvent && room.currentEvent.effectType === 'dice_bonus') {
              diceCount += room.currentEvent.effectPayload.amount || 1;
            }

            const threshold = room.config.systemSettings.diceSuccessThreshold || 4;
            const rolls = [];
            let successes = 0;
            const autoWin = room.currentEvent && room.currentEvent.effectType === 'auto_success';

            if (autoWin) {
              successes = targetSuccesses;
              for (let i = 0; i < diceCount; i++) rolls.push({ value: 6, isSuccess: true });
            } else {
              for (let i = 0; i < diceCount; i++) {
                const val = Math.floor(Math.random() * 6) + 1;
                const ok = val >= threshold;
                if (ok) successes++;
                rolls.push({ value: val, isSuccess: ok });
              }
              if (room.currentEvent && room.currentEvent.effectType === 'success_reduction') {
                successes = Math.max(0, successes - (room.currentEvent.effectPayload.amount || 1));
              }
            }

            const passed = autoWin || (successes >= targetSuccesses);
            player.diceResults = {
              rolls,
              diceCount,
              successes,
              targetSuccesses,
              passed
            };
            player.trainingSuccess = passed;

            addLog(room, `【訓練判定】「${player.name}」投擲 ${diceCount} 顆骰子，命中面 ${successes}/${targetSuccesses} ── ${passed ? '✓ 考核通過！' : '✗ 考核未通過'}`);
            handled = true;
          }
        }

        // 結算訓練屬性成長
        if (action === 'resolve_training_phase') {
          room.players.forEach(p => {
            const training = room.config.trainings.find(t => t.id === p.currentTrainingId);
            if (p.trainingSuccess && training) {
              Object.entries(training.rewards || {}).forEach(([stat, val]) => {
                p.stats[stat] = (p.stats[stat] || 1) + val;
              });
              if (room.currentEvent && room.currentEvent.effectType === 'on_success_stat_gain') {
                p.stats.strength += 1;
              }
              if (room.currentEvent && room.currentEvent.effectType === 'base_eval_event') {
                p.stats.endurance += 1;
              }
            } else {
              if (room.config.systemSettings.failurePenaltyStatEnabled) {
                const keys = ['strength', 'agility', 'endurance', 'intelligence'];
                const maxK = keys.reduce((a, b) => p.stats[a] > p.stats[b] ? a : b);
                p.stats[maxK] = Math.max(1, p.stats[maxK] - 1);
              }
              if (room.currentEvent && room.currentEvent.effectType === 'on_failure_stat_loss') {
                const keys = ['strength', 'agility', 'endurance', 'intelligence'];
                const maxK = keys.reduce((a, b) => p.stats[a] > p.stats[b] ? a : b);
                p.stats[maxK] = Math.max(1, p.stats[maxK] - 1);
              }
            }
            p.lastTrainingId = p.currentTrainingId;
            ['strength', 'agility', 'endurance', 'intelligence'].forEach(k => {
              p.stats[k] = Math.max(room.config.systemSettings.minStatValue || 1, p.stats[k]);
            });
          });

          room.phase = 'DRAW_MISSION';
          addLog(room, '【結算完成】全體人員體魄素質提升！準備抽取實戰任務。');
          handled = true;
        }

        // 抽取任務卡
        if (action === 'draw_mission') {
          if (room.usedMissionIds.length >= room.config.missions.length) {
            room.usedMissionIds = [];
          }
          const avail = room.config.missions.filter(m => !room.usedMissionIds.includes(m.id));
          const mission = avail[Math.floor(Math.random() * avail.length)];
          room.usedMissionIds.push(mission.id);
          room.currentMission = mission;
          room.missionHistory.unshift(mission);
          room.teamMissionDicePool = {};
          room.phase = 'RESOLVE_MISSION';

          addLog(room, `【作戰指令】任務卡 #${mission.order || mission.id}【${mission.name}】：${mission.description}（目標：${mission.conditionsDescription}）`);
          handled = true;
        }

        // 團隊任務投擲
        if (action === 'roll_mission_dice') {
          const { playerId, chosenStat } = payload;
          const player = room.players.find(p => p.id === playerId);
          if (player) {
            const statKey = chosenStat || 'strength';
            const diceCount = Math.max(1, player.stats[statKey] || 1);
            const threshold = room.config.systemSettings.diceSuccessThreshold || 4;
            const rolls = [];
            let successes = 0;
            for (let i = 0; i < diceCount; i++) {
              const val = Math.floor(Math.random() * 6) + 1;
              const ok = val >= threshold;
              if (ok) successes++;
              rolls.push({ value: val, isSuccess: ok });
            }
            room.teamMissionDicePool[player.id] = {
              playerName: player.name,
              statKey,
              diceCount,
              rolls,
              successes
            };
            addLog(room, `【任務擲骰】「${player.name}」依據【${statKey}】投擲 ${diceCount} 顆骰子，貢獻 ${successes} 顆成功面！`);
            handled = true;
          }
        }

        // 結算任務
        if (action === 'resolve_mission_phase') {
          const mission = room.currentMission;
          if (mission) {
            const qualifiedPlayers = [];

            if (mission.type === 'individual_stat_check') {
              room.players.forEach(p => {
                let ok = true;
                Object.entries(mission.conditionCheck.statMin || {}).forEach(([st, minVal]) => {
                  if ((p.stats[st] || 0) < minVal) ok = false;
                });
                if (ok) qualifiedPlayers.push(p);
              });
            } else if (mission.type === 'competitive_highest') {
              const baseK = Object.keys(mission.conditionCheck.baseMin || {})[0];
              const baseMin = mission.conditionCheck.baseMin[baseK];
              const compK = mission.conditionCheck.compareStat;
              const elig = room.players.filter(p => (p.stats[baseK] || 0) >= baseMin);
              if (elig.length > 0) {
                let maxVal = -1;
                elig.forEach(e => {
                  if ((e.stats[compK] || 0) > maxVal) maxVal = e.stats[compK] || 0;
                });
                elig.forEach(e => {
                  if ((e.stats[compK] || 0) === maxVal) qualifiedPlayers.push(e);
                });
              }
            } else if (mission.type === 'coop_dice_pool') {
              let totalSuccesses = 0;
              Object.values(room.teamMissionDicePool).forEach(d => { totalSuccesses += d.successes || 0; });
              const baseRequired = mission.conditionCheck.teamTotalRequired || 8;
              let required = baseRequired;
              if (room.config.systemSettings.soloCoopTaskScale && room.players.length < 4) {
                required = Math.max(2, Math.round(baseRequired * (room.players.length / 4)));
              }
              if (totalSuccesses >= required) {
                addLog(room, `【任務大獲全勝】團隊共同取得 ${totalSuccesses} 顆成功面（達到 ${required} 顆目標，原標 ${baseRequired} 顆）！`);
                if (mission.conditionCheck.rewardAllPlayers) {
                  room.players.forEach(p => {
                    Object.entries(mission.conditionCheck.rewardAllPlayers).forEach(([a, c]) => {
                      p.awards[a] = (p.awards[a] || 0) + c;
                    });
                  });
                }
                if (mission.conditionCheck.rewardTopPlayer) {
                  let topPId = null;
                  let maxSc = -1;
                  Object.entries(room.teamMissionDicePool).forEach(([pId, dat]) => {
                    if (dat.successes > maxSc) { maxSc = dat.successes; topPId = pId; }
                  });
                  room.players.forEach(p => {
                    if (p.id === topPId) {
                      Object.entries(mission.conditionCheck.rewardTopPlayer).forEach(([a, c]) => {
                        p.awards[a] = (p.awards[a] || 0) + c;
                      });
                    } else if (mission.conditionCheck.rewardOtherPlayers) {
                      Object.entries(mission.conditionCheck.rewardOtherPlayers).forEach(([a, c]) => {
                        p.awards[a] = (p.awards[a] || 0) + c;
                      });
                    }
                  });
                }
              } else {
                addLog(room, `【任務惜敗】團隊取得 ${totalSuccesses} 顆成功面，未達 ${required} 顆門檻，未能獲得功獎。`);
              }
            } else if (mission.type === 'individual_quad_test') {
              room.players.forEach(p => {
                const req = mission.conditionCheck.quadRequiredSuccess || 3;
                const pass = ['strength', 'agility', 'endurance', 'intelligence'].every(k => (p.stats[k] || 0) >= req);
                if (pass) qualifiedPlayers.push(p);
              });
            }

            if (mission.reward && qualifiedPlayers.length > 0) {
              qualifiedPlayers.forEach(p => {
                Object.entries(mission.reward).forEach(([a, c]) => {
                  p.awards[a] = (p.awards[a] || 0) + c;
                });
              });
              addLog(room, `【榮譽嘉獎】合格人員：${qualifiedPlayers.map(p => p.name).join('、')}，獲授【${mission.rewardDescription}】！`);
            }
          }
          room.phase = 'AWARDS_VICTORY';
          handled = true;
        }

        // 累功換章與勝利判定
        if (action === 'resolve_awards_and_victory') {
          const rates = room.config.systemSettings.pointsPerAwardLevel || { meritToSmall: 3, smallToLarge: 3, largeToMedal: 3 };
          let victoryPlayers = [];

          room.players.forEach(p => {
            // 3 嘉獎 => 1 小功
            if (p.awards.merit >= rates.meritToSmall) {
              const addSmall = Math.floor(p.awards.merit / rates.meritToSmall);
              p.awards.merit = p.awards.merit % rates.meritToSmall;
              p.awards.small += addSmall;
            }
            // 3 小功 => 1 大功
            if (p.awards.small >= rates.smallToLarge) {
              const addLarge = Math.floor(p.awards.small / rates.smallToLarge);
              p.awards.small = p.awards.small % rates.smallToLarge;
              p.awards.large += addLarge;
            }
            // 3 大功 => 1 寶星勳章
            if (p.awards.large >= rates.largeToMedal) {
              const addMedal = Math.floor(p.awards.large / rates.largeToMedal);
              p.awards.large = p.awards.large % rates.largeToMedal;
              p.awards.medal += addMedal;
            }

            if (p.awards.medal >= (room.config.systemSettings.victoryConditionMedals || 1)) {
              victoryPlayers.push(p);
            }
          });

          if (victoryPlayers.length > 0) {
            const scoreCalc = (p) => (p.awards.medal * 27) + (p.awards.large * 9) + (p.awards.small * 3) + p.awards.merit;
            victoryPlayers.sort((a, b) => scoreCalc(b) - scoreCalc(a));
            const topScore = scoreCalc(victoryPlayers[0]);
            const winners = victoryPlayers.filter(p => scoreCalc(p) === topScore);

            room.phase = 'MEDAL_CELEBRATION'; // 彈出榮譽士兵受封畫面，可選完賽或其餘人繼續
            room.recentMedalWinners = winners.map(w => ({
              id: w.id,
              name: w.name,
              roleName: w.roleData?.name,
              soldierName: w.roleData?.soldierName,
              awards: { ...w.awards },
              score: topScore
            }));
            room.winners = room.recentMedalWinners;
            addLog(room, `【榮譽士兵誕生】恭喜官兵【${winners.map(w => w.name).join(' 與 ')}】榮獲一星寶星獎章，率先成為首批榮譽士兵！`);
          } else {
            room.round += 1;
            room.intensityMultiplier = Math.floor((room.round - 1) / (room.config.systemSettings.intensityDoubleEveryRounds || 5)) + 1;
            room.firstPlayerIndex = (room.firstPlayerIndex + 1) % room.players.length;
            room.players.forEach(p => {
              p.currentTrainingId = null;
              p.diceResults = null;
              p.trainingSuccess = null;
            });
            room.currentEvent = null;
            room.currentMission = null;
            room.teamMissionDicePool = {};
            room.lastAwardFailedNeedEncourage = true; // 標記未換成勳章，觸發勉勵故事指引
            room.phase = 'SELECT_TRAINING';
            addLog(room, `【晉升新回合】進入第 ${room.round} 回合！功績尚未積滿，全連弟兄百煉成鋼，繼續受訓！首位行動者輪替至「${room.players[room.firstPlayerIndex].name}」。`);
          }
          handled = true;
        }

        // 其餘官兵繼續挑戰下一枚勳章
        if (action === 'continue_game_for_remaining') {
          room.round += 1;
          room.intensityMultiplier = Math.floor((room.round - 1) / (room.config.systemSettings.intensityDoubleEveryRounds || 5)) + 1;
          room.firstPlayerIndex = (room.firstPlayerIndex + 1) % room.players.length;
          room.players.forEach(p => {
            p.currentTrainingId = null;
            p.diceResults = null;
            p.trainingSuccess = null;
          });
          room.currentEvent = null;
          room.currentMission = null;
          room.teamMissionDicePool = {};
          room.phase = 'SELECT_TRAINING';
          addLog(room, `【再接再厲】榮譽士兵已載入英雄榜！其餘戰友進入第 ${room.round} 回合，繼續爭取專屬榮譽勳章！`);
          handled = true;
        }

        // 正式結束遊戲
        if (action === 'finalize_game_over') {
          room.phase = 'GAME_OVER';
          handled = true;
        }

        // 後台管理員修改玩家資料
        if (action === 'admin_edit_player') {
          const { playerId, stats, awards } = payload;
          const player = room.players.find(p => p.id === playerId);
          if (player) {
            if (stats) Object.assign(player.stats, stats);
            if (awards) Object.assign(player.awards, awards);
            addLog(room, `【裁判修正】主辦方修正了「${player.name}」的數據。`);
            handled = true;
          }
        }

        // 重新開始遊戲
        if (action === 'restart_game') {
          room.phase = 'SELECT_ROLE';
          room.round = 1;
          room.intensityMultiplier = 1;
          room.currentEvent = null;
          room.currentMission = null;
          room.eventHistory = [];
          room.missionHistory = [];
          room.usedEventIds = [];
          room.usedMissionIds = [];
          room.teamMissionDicePool = {};
          room.winners = null;
          room.players.forEach(p => {
            p.roleId = null;
            p.roleData = null;
            p.stats = { strength: 1, agility: 1, endurance: 1, intelligence: 1 };
            p.awards = { merit: 0, small: 0, large: 0, medal: 0 };
            p.currentTrainingId = null;
            p.lastTrainingId = null;
            p.diceResults = null;
            p.trainingSuccess = null;
            p.isReady = false;
          });
          addLog(room, '【戰事重啟】主辦方已重置遊戲室，重新開啟招募選角！');
          handled = true;
        }

        if (handled) {
          broadcastRoom(room.roomId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, room }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '未知的操作或無效狀態' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    });
    return;
  }

  // 靜態檔案服務
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  // 防止路徑遍歷
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: 若找不到對應檔案且沒有副檔名，回傳 index.html
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`\n======================================================`);
  console.log(`★《勇者的召喚》臺灣志願役士兵桌遊 Web 系統已啟動！`);
  console.log(`★ 本機遊玩網址： http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`★ 同區網連線網址（手機/平板可直接開）： http://${ip}:${PORT}`);
  });
  console.log(`★ 後台管理設定： http://localhost:${PORT}/#admin`);
  console.log(`======================================================\n`);
});

module.exports = { server, rooms, activeConfig };
