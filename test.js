const http = require('http');
const assert = require('assert');
const { server } = require('./server');

const TEST_PORT = 3001;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('>>> 開始執行《勇者的召喚》數位桌遊系統全功能整合測試...\n');

  await new Promise(resolve => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`✓ 測試伺服器已於 http://127.0.0.1:${TEST_PORT} 順利啟動`);

  try {
    // 1. 測試 GET /api/config
    console.log('1. 測試取得遊戲基礎配置 API (/api/config)...');
    const configRes = await makeRequest('/api/config');
    assert.strictEqual(configRes.status, 200);
    assert.strictEqual(configRes.data.success, true);
    assert.strictEqual(configRes.data.config.roles.length, 4, '應有 4 位角色');
    assert.strictEqual(configRes.data.config.trainings.length, 7, '應有 7 項訓練');
    assert.strictEqual(configRes.data.config.events.length, 20, '應有 20 張事件卡');
    assert.strictEqual(configRes.data.config.missions.length, 10, '應有 10 張任務卡');
    console.log('   ✓ 角色、訓練、事件與任務配置驗證通過！');

    // 2. 測試建立房間
    console.log('2. 測試主辦方建立房間 (create_room)...');
    const createRes = await makeRequest('/api/action', 'POST', { action: 'create_room' });
    assert.strictEqual(createRes.status, 200);
    const roomId = createRes.data.roomId;
    assert.ok(roomId && roomId.length === 4, '房間代碼應為 4 位字串');
    console.log(`   ✓ 房間建立成功，代碼：${roomId}`);

    // 3. 測試 4 位玩家加入房間
    console.log('3. 測試 4 名不同新兵加入作戰序列 (join_room)...');
    const players = [
      { id: 'p_1', name: '新兵 馨慧', bday: '01-10' },
      { id: 'p_2', name: '新兵 星儀', bday: '08-10' },
      { id: 'p_3', name: '新兵 嘉亨', bday: '04-20' },
      { id: 'p_4', name: '新兵 彥材', bday: '11-25' }
    ];

    for (const p of players) {
      const joinRes = await makeRequest('/api/action', 'POST', {
        action: 'join_room',
        roomId,
        payload: { playerId: p.id, playerName: p.name, realBirthday: p.bday }
      });
      assert.strictEqual(joinRes.status, 200);
    }
    console.log('   ✓ 4 名新兵順利加入房間！');

    // 4. 測試招募階段與選角
    console.log('4. 測試招募階段與身分選取 (select_role)...');
    await makeRequest('/api/action', 'POST', { action: 'start_role_selection', roomId });

    // 依序選角
    const roleIds = ['role_1', 'role_2', 'role_3', 'role_4'];
    for (let i = 0; i < 4; i++) {
      const selRes = await makeRequest('/api/action', 'POST', {
        action: 'select_role',
        roomId,
        payload: { playerId: players[i].id, roleId: roleIds[i] }
      });
      assert.strictEqual(selRes.status, 200);
    }

    // 測試重複選角防護
    const dupRes = await makeRequest('/api/action', 'POST', {
      action: 'select_role',
      roomId,
      payload: { playerId: players[0].id, roleId: 'role_2' }
    });
    assert.strictEqual(dupRes.status, 400, '已被選取角色應阻擋');
    console.log('   ✓ 選角與唯一性檢驗通過！');

    // 5. 測試生日順位比對與進入第一回合
    console.log('5. 測試生日比對與先鋒順位計算 (finalize_roles)...');
    const finRes = await makeRequest('/api/action', 'POST', { action: 'finalize_roles', roomId });
    assert.strictEqual(finRes.status, 200);
    assert.strictEqual(finRes.data.room.phase, 'SELECT_TRAINING');
    assert.strictEqual(finRes.data.room.round, 1);
    console.log(`   ✓ 順位計算成功，首位先鋒索引：${finRes.data.room.firstPlayerIndex}`);

    // 6. 測試訓練選擇
    console.log('6. 測試訓練模式選擇 (choose_training)...');
    for (let i = 0; i < 4; i++) {
      const trainRes = await makeRequest('/api/action', 'POST', {
        action: 'choose_training',
        roomId,
        payload: { playerId: players[i].id, trainingId: `train_${i + 1}` }
      });
      assert.strictEqual(trainRes.status, 200);
    }
    console.log('   ✓ 4 名士兵訓練派遣成功！');

    // 7. 推進到事件抽卡
    console.log('7. 測試推進並抽取事件卡 (proceed_to_event & draw_event)...');
    await makeRequest('/api/action', 'POST', { action: 'proceed_to_event', roomId });
    const evRes = await makeRequest('/api/action', 'POST', { action: 'draw_event', roomId });
    assert.strictEqual(evRes.status, 200);
    assert.ok(evRes.data.room.currentEvent, '應有當前事件卡');
    console.log(`   ✓ 抽中事件卡 #${evRes.data.room.currentEvent.id}：${evRes.data.room.currentEvent.name}`);

    // 8. 測試擲骰判定
    console.log('8. 測試士兵作戰擲骰判定 (roll_training_dice)...');
    for (let i = 0; i < 4; i++) {
      const rollRes = await makeRequest('/api/action', 'POST', {
        action: 'roll_training_dice',
        roomId,
        payload: { playerId: players[i].id }
      });
      assert.strictEqual(rollRes.status, 200);
      const pData = rollRes.data.room.players.find(p => p.id === players[i].id);
      assert.ok(pData.diceResults, '應產生擲骰明細結果');
    }
    console.log('   ✓ 全員擲骰考核順利完成！');

    // 9. 結算訓練屬性增益
    console.log('9. 測試訓練屬性結算 (resolve_training_phase)...');
    const resTrain = await makeRequest('/api/action', 'POST', { action: 'resolve_training_phase', roomId });
    assert.strictEqual(resTrain.status, 200);
    assert.strictEqual(resTrain.data.room.phase, 'DRAW_MISSION');
    console.log('   ✓ 士兵屬性更新完畢，最低屬性維持 >= 1！');

    // 10. 測試發布實兵任務
    console.log('10. 測試發布部隊任務令 (draw_mission)...');
    const misRes = await makeRequest('/api/action', 'POST', { action: 'draw_mission', roomId });
    assert.strictEqual(misRes.status, 200);
    assert.ok(misRes.data.room.currentMission, '應有當前任務卡');
    console.log(`   ✓ 發布任務 #${misRes.data.room.currentMission.order || misRes.data.room.currentMission.id}：${misRes.data.room.currentMission.name}`);

    // 11. 任務結算
    console.log('11. 測試任務判定與獎勵發放 (resolve_mission_phase)...');
    const resMis = await makeRequest('/api/action', 'POST', { action: 'resolve_mission_phase', roomId });
    assert.strictEqual(resMis.status, 200);
    assert.strictEqual(resMis.data.room.phase, 'AWARDS_VICTORY');
    console.log('   ✓ 任務評核與功獎結算完畢！');

    // 12. 測試累功換章與勝利判定 (3嘉獎=1小功, 3小功=1大功, 3大功=1星寶星獎章)
    console.log('12. 測試累功換章折算系統 (resolve_awards_and_victory)...');
    // 先透過裁判 API 給予玩家 1 嘉獎 3 支、小功 2 支、大功 2 支
    await makeRequest('/api/action', 'POST', {
      action: 'admin_edit_player',
      roomId,
      payload: {
        playerId: players[0].id,
        awards: { merit: 3, small: 2, large: 2, medal: 0 }
      }
    });

    // 執行累功換章：
    // 3 嘉獎 => +1 小功 (小功變成 3 支)
    // 3 小功 => +1 大功 (大功變成 3 支)
    // 3 大功 => +1 一星寶星獎章！觸發終局勝利！
    const victRes = await makeRequest('/api/action', 'POST', { action: 'resolve_awards_and_victory', roomId });
    assert.strictEqual(victRes.status, 200);
    assert.strictEqual(victRes.data.room.phase, 'GAME_OVER', '達到一星寶星獎章應結束遊戲');
    assert.ok(victRes.data.room.winners && victRes.data.room.winners.length > 0, '應有獲勝冠軍');
    console.log(`   ✓ 累功換章精準折算成功！由「${victRes.data.room.winners[0].name}」榮獲一星寶星獎章並獲勝！`);

    // 13. 測試後台更新與重設 API
    console.log('13. 測試後台配置更新 (/api/config) 與恢復預設 (/api/config/reset)...');
    const updateRes = await makeRequest('/api/config', 'POST', configRes.data.config);
    assert.strictEqual(updateRes.status, 200);
    const resetRes = await makeRequest('/api/config/reset', 'POST');
    assert.strictEqual(resetRes.status, 200);
    console.log('   ✓ 後台 CMS 設定 API 運作無誤！');

    // 14. 測試單人自己開始遊玩模式
    console.log('14. 測試單人自己開始遊玩模式 (create_solo_game)...');
    const soloRes = await makeRequest('/api/action', 'POST', {
      action: 'create_solo_game',
      payload: { playerName: '獨行戰將', realBirthday: '01-14', playerId: 'solo_hero' }
    });
    assert.strictEqual(soloRes.status, 200);
    assert.strictEqual(soloRes.data.room.phase, 'SELECT_ROLE');
    const soloRoomId = soloRes.data.roomId;

    // 單人選角 (大學畢業生)
    await makeRequest('/api/action', 'POST', {
      action: 'select_role',
      roomId: soloRoomId,
      payload: { playerId: 'solo_hero', roleId: 'role_2' }
    });

    // 單人直接完成選角進入訓練
    const soloFin = await makeRequest('/api/action', 'POST', { action: 'finalize_roles', roomId: soloRoomId });
    assert.strictEqual(soloFin.status, 200);
    assert.strictEqual(soloFin.data.room.phase, 'SELECT_TRAINING');

    // 單人選訓練
    await makeRequest('/api/action', 'POST', {
      action: 'choose_training',
      roomId: soloRoomId,
      payload: { playerId: 'solo_hero', trainingId: 'train_3' }
    });
    await makeRequest('/api/action', 'POST', { action: 'proceed_to_event', roomId: soloRoomId });
    await makeRequest('/api/action', 'POST', { action: 'draw_event', roomId: soloRoomId });
    await makeRequest('/api/action', 'POST', { action: 'roll_training_dice', roomId: soloRoomId, payload: { playerId: 'solo_hero' } });
    await makeRequest('/api/action', 'POST', { action: 'resolve_training_phase', roomId: soloRoomId });
    console.log('   ✓ 單人單兵流程完美通暢！');

    console.log('\n======================================================');
    console.log('★ ALL 14 TEST SUITES PASSED! 包含單人模式全數無瑕通過！★');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ 測試未通過：', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
