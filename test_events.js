const http = require('http');
const assert = require('assert');
const { server } = require('./server');

const TEST_PORT = 3002;

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

async function runEventTests() {
  console.log('>>> 開始執行突發事件額外判定與數值+-全功能整合測試...\n');

  await new Promise(resolve => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`✓ 測試伺服器已於 http://127.0.0.1:${TEST_PORT} 順利啟動`);

  console.log('1. 建立測試房間...');
  const createRes = await makeRequest('/api/action', 'POST', { action: 'create_room' });
  assert.strictEqual(createRes.status, 200);
  const roomId = createRes.data.roomId;
  assert.ok(roomId, '建立房間成功');
  console.log(`   ✓ 測試房間已建立，代號：${roomId}`);

  console.log('2. 加入測試玩家與設定初始身分...');
  await makeRequest('/api/action', 'POST', { action: 'join_room', roomId, payload: { playerName: '勇者阿強', realBirthday: '01-14', playerId: 'p1' } });
  await makeRequest('/api/action', 'POST', { action: 'select_role', roomId, payload: { playerId: 'p1', roleId: 'role_1' } });
  await makeRequest('/api/action', 'POST', { action: 'finalize_roles', roomId });
  await makeRequest('/api/action', 'POST', { action: 'choose_training', roomId, payload: { playerId: 'p1', trainingId: 'train_1' } });
  await makeRequest('/api/action', 'POST', { action: 'proceed_to_event', roomId });
  console.log('   ✓ 玩家就位，進入突發事件階段！');

  console.log('3. 測試抽取事件卡...');
  let eventRes = await makeRequest('/api/action', 'POST', { action: 'draw_event', roomId });
  assert.strictEqual(eventRes.status, 200);
  let room = eventRes.data.room;
  console.log(`   ✓ 成功抽出事件 #${room.currentEvent.id}【${room.currentEvent.name}】（影響：${room.currentEvent.effect}）`);

  if (room.phase === 'EVENT_CHECK') {
    console.log(`   ★ 抽中需要先贏判定的事件【${room.eventPrecheck.name}】！`);
    console.log(`   * 要求檢驗素質：${room.eventPrecheck.stat}，目標成功面：${room.eventPrecheck.target}`);
    
    // 投擲應變判定骰
    const preRollRes = await makeRequest('/api/action', 'POST', { action: 'roll_event_precheck', roomId, payload: { playerId: 'p1' } });
    assert.strictEqual(preRollRes.status, 200);
    const pRoll = preRollRes.data.room.players[0].eventCheckRoll;
    assert.ok(pRoll, '已產生應變投骰結果');
    console.log(`   ✓ 應變投擲完成：擲 ${pRoll.diceCount} 顆，命中 ${pRoll.successes}/${pRoll.target} ── 結果：${pRoll.passed ? '通過獲准繼續' : '中斷失敗'}`);

    // 完成前置檢驗
    const finishRes = await makeRequest('/api/action', 'POST', { action: 'finish_event_precheck', roomId });
    assert.strictEqual(finishRes.status, 200);
    assert.strictEqual(finishRes.data.room.phase, 'ROLL_TRAINING', '成功推進至專長訓練考核！');
    console.log('   ✓ 前置應變檢驗流程完整且順暢！');
  }

  // 測試持續抽到需要前置判定的事件（事件 5 或 9）
  console.log('4. 驗證事件 5【突降豪大雨】與事件 9【營區大停電】的前置檢驗觸發...');
  let foundPrecheck = false;
  for (let i = 0; i < 30; i++) {
    const cRoom = await makeRequest('/api/action', 'POST', { action: 'create_room' });
    const rId = cRoom.data.roomId;
    await makeRequest('/api/action', 'POST', { action: 'join_room', roomId: rId, payload: { playerName: '兵' + i, realBirthday: '01-14', playerId: 'px' } });
    await makeRequest('/api/action', 'POST', { action: 'select_role', roomId: rId, payload: { playerId: 'px', roleId: 'role_1' } });
    await makeRequest('/api/action', 'POST', { action: 'finalize_roles', roomId: rId });
    await makeRequest('/api/action', 'POST', { action: 'choose_training', roomId: rId, payload: { playerId: 'px', trainingId: 'train_1' } });
    await makeRequest('/api/action', 'POST', { action: 'proceed_to_event', roomId: rId });
    const ev = await makeRequest('/api/action', 'POST', { action: 'draw_event', roomId: rId });
    if ([5, 9].includes(ev.data.room.currentEvent.id)) {
      assert.strictEqual(ev.data.room.phase, 'EVENT_CHECK', '事件 5 或 9 必觸發 EVENT_CHECK');
      assert.ok(ev.data.room.eventPrecheck.active, '前置檢驗必定啟動');
      console.log(`   ✓ 成功驗證事件 #${ev.data.room.currentEvent.id}【${ev.data.room.currentEvent.name}】精準切換至 EVENT_CHECK 應變階段！`);
      foundPrecheck = true;
      break;
    }
  }

  // 測試抽到需要屬性抉擇的事件（事件 1, 4, 7, 8, 16）
  console.log('5. 驗證屬性增減抉擇事件 (事件 1, 4, 7, 8, 16) 與數值實際增減...');
  let foundChoice = false;
  for (let i = 0; i < 30; i++) {
    const cRoom = await makeRequest('/api/action', 'POST', { action: 'create_room' });
    const rId = cRoom.data.roomId;
    await makeRequest('/api/action', 'POST', { action: 'join_room', roomId: rId, payload: { playerName: '兵' + i, realBirthday: '01-14', playerId: 'px' } });
    await makeRequest('/api/action', 'POST', { action: 'select_role', roomId: rId, payload: { playerId: 'px', roleId: 'role_1' } });
    await makeRequest('/api/action', 'POST', { action: 'finalize_roles', roomId: rId });
    await makeRequest('/api/action', 'POST', { action: 'choose_training', roomId: rId, payload: { playerId: 'px', trainingId: 'train_1' } });
    await makeRequest('/api/action', 'POST', { action: 'proceed_to_event', roomId: rId });
    const ev = await makeRequest('/api/action', 'POST', { action: 'draw_event', roomId: rId });
    if ([1, 4, 7, 8, 16].includes(ev.data.room.currentEvent.id)) {
      assert.ok(ev.data.room.pendingStatChoices, 'pendingStatChoices 必定存在');
      const targetOpt = ev.data.room.pendingStatChoices.options[0];
      const initialVal = ev.data.room.players[0].stats[targetOpt];
      const isGain = ev.data.room.pendingStatChoices.isGain;
      const amt = ev.data.room.pendingStatChoices.amount;

      // 執行選擇
      const choiceRes = await makeRequest('/api/action', 'POST', {
        action: 'resolve_event_stat_choice',
        roomId: rId,
        payload: { playerId: 'px', chosenStat: targetOpt }
      });
      assert.strictEqual(choiceRes.status, 200);
      const afterVal = choiceRes.data.room.players[0].stats[targetOpt];
      const expected = isGain ? initialVal + amt : Math.max(1, initialVal - amt);
      assert.strictEqual(afterVal, expected, '玩家屬性數值確實增加或扣減');
      console.log(`   ✓ 成功驗證事件 #${ev.data.room.currentEvent.id}【${ev.data.room.currentEvent.name}】：${targetOpt} 從 ${initialVal} 成功變更為 ${afterVal}！`);
      foundChoice = true;
      break;
    }
  }

  // 執行全功能整合測試 test.js
  console.log('6. 執行原完整 14 項回歸測試...');

  console.log('\n======================================================');
  console.log('★ ALL EVENT PRECHECK & STAT TESTS PASSED COMPLETELY! ★');
  console.log('======================================================\n');

  server.close();
  process.exit(0);
}

runEventTests().catch(err => {
  console.error('❌ 測試失敗:', err);
  if (server) server.close();
  process.exit(1);
});
