// 《勇者的召喚》前端遊戲核心邏輯

// 各階段故事性軍旅敘事手記與行動指引 (無第X章，主題式敘事)
const PHASE_BRIEFINGS = {
  'LOBBY': {
    title: '【營區大門的清晨】',
    tag: '軍旅序曲．入伍集結',
    story: '清晨六點，軍營大門伴隨著鐵門滾輪聲緩緩拉開，晨霧中瀰漫著青草露水與緊張期待的氣息。來自台灣各地的年輕弟兄們背著行囊陸續步入大禮堂，即將告別舒適圈，展開這段考驗意志、淬鍊體魄的志願役士兵生涯。輔導長面帶微笑，指揮著值星班長發放兵籍資料表。',
    actionPrompt: '🎯【新兵任務】：拿出手機或行動設備，輸入作戰室代號完成報到！全員到齊後，班長即刻宣布開拔！',
    tips: '💡 班長叮嚀：若是獨自一人前來挑戰，首頁亦備有「單兵生涯模式」，隨時可隻身踏上榮譽征途！'
  },
  'SELECT_ROLE': {
    title: '【迷彩的起跑線】',
    tag: '身分招募．天生我材',
    story: '大禮堂的投影片閃爍，招募員精神抖擻地介紹各管道特色：「部隊需要各路人才！不管事高中畢業的活力充沛、體能驚人；大學畢業的博學冷靜、擅長敏銳判斷；在社會闖蕩多年的沉著穩健、極具領導魄力；而身懷資訊戰略專長的則思維縝密、長於科技運籌。」每個人帶來不同的天賦與技能，在部隊中找到屬於自己的定位。',
    actionPrompt: '🎯【新兵任務】：請填寫您的真實姓名與生日，並挑選代表身分，替代人物資料開啟專屬傳奇！',
    tips: '💡 班長叮嚀：選定身分後，系統將比對角色生日與你的真實生日，相隔最近者將獲選為「本輪先鋒第一棒」！'
  },
  'SELECT_TRAINING': {
    title: '【操場上的迷彩哨音】',
    tag: '部隊操課．專長鍛鍊',
    story: '「嗶——！各連注意，依課表帶開進行專長訓練！」值星官清脆哨聲劃破天際。大操場上長跑連隊步伐整齊、口號震天；重訓室內槓鈴與汗水交織；五百公尺障礙場鐵絲網泥濘飛濺；靶場更傳來 175 公尺步槍射擊的震撼巨響。每一次的課目選擇，都是向極限挑戰、打造鋼鐵體魄的決策。',
    actionPrompt: '🎯【新兵任務】：評估自身的強項，選定本回合欲派遣挑戰的訓練場地（跑步、重力、障礙、狙擊、快射、戰備演練、應變演練）！',
    tips: '⚠️ 連長警示：部隊訓練是循序漸進的！每經過 5 個回合，因訓練強度升級，通過考核所需之骰子成功面將會自動加倍！'
  },
  'EVENT': {
    title: '【迷彩日常的酸甜苦辣】',
    tag: '突發事件．軍旅驚喜',
    story: '「報告連長！營區外傳來機車引擎聲！」剛下課的弟兄們驚喜歡呼——原來是傳說中的「小蜜蜂阿鳳姐」騎車來賣熱騰騰的肉粽與冰奶茶，神救援瞬間補滿全連士氣！但軍旅生活總是充滿意料之外，有時可能突逢大雷雨裝備淋濕、半夜衛哨值勤疲憊萬分、或是營區跳電得緊急搶修。這些酸甜苦辣的日常瑣事，考驗著大家的抗壓與應變力。',
    actionPrompt: '🎯【新兵任務】：由首位玩家翻開突發事件卡！共同承擔本日部隊遭遇的突發情境與影響！',
    tips: '💡 班長叮嚀：同甘共苦是國軍的傳統，所有突發事件效果均由全連官兵共同承擔與面對！'
  },
  'ROLL_TRAINING': {
    title: '【汗水凝結的驗收時刻】',
    tag: '考核檢定．命運之骰',
    story: '「深呼吸，視線透過覘孔對準目標靶心，食指平穩扣住扳機！」教官手持碼表在旁嚴肅評核。陽光灑在士兵黝黑堅毅的臉龐上，額頭滴落的每一顆汗水，都將在此刻轉化為真實的成果。身旁的同袍為你加油打氣，專屬特長技能也在此時爆發。拿起象徵榮耀與機率的作戰骰，成敗在此一舉！',
    actionPrompt: '🎯【新兵任務】：點擊「🎲 投擲作戰判定骰」！擲出代表國徽金星芒（4點以上）的命中面，拿下合格評定！',
    tips: '💡 班長叮嚀：考核通過者，下一動將獲得對應的力量、靈敏、體力或智慧素質實質飛躍提升！'
  },
  'DRAW_MISSION': {
    title: '【戰備鈴響！實兵任務來臨】',
    tag: '實兵考驗．出動指令',
    story: '急促的戰備警報突然在各營舍大樓響起！「全副武裝，五分鐘後司令台前集合完畢！」這不再是平日單純的體能鍛鍊，而是真正的部隊實兵任務考驗！不管是颱風過後投入地方搶救災害重建家園、暗夜中的數十公里負重急行軍、營區防護反特攻演練，還是規格宏大的三軍聯合漢光演習，考驗著士兵平日精練的本領。',
    actionPrompt: '🎯【新兵任務】：全員就戰鬥位置！抽取部隊任務令，了解本次作戰的考核目標與獲勝功獎！',
    tips: '💡 班長叮嚀：任務包含「個人素質檢核」、「競賽爭冠」以及「全連同心協力投骰達標」三大作戰型態！'
  },
  'RESOLVE_MISSION': {
    title: '【凱旋歸營與榮譽勳表】',
    tag: '任務驗收．功獎榮光',
    story: '夕陽餘暉灑滿營區道路，各連弟兄邁著疲累卻驕傲的步伐凱旋歸營。司令台上，旅長親自宣讀本次任務立功官兵名單：「在救災第一線奮不顧身的弟兄、在射擊鑑測命中滿靶的射手、以及齊心協力完成漢光任務的全體班兵，你們是部隊的驕傲！」榮譽的嘉獎與小功、大功功獎，在此刻光榮頒發！',
    actionPrompt: '🎯【新兵任務】：檢核任務達成情況！合格士兵榮獲部隊頒發功獎，累積個人榮耀成就！',
    tips: '💡 班長叮嚀：平日積累的嘉獎小功，在下個環節將能折換成璀璨閃爍的晉升勳章！'
  },
  'AWARDS_VICTORY': {
    title: '【榮耀加冕．寶星勳章的光芒】',
    tag: '累功換章．全軍凱旋',
    story: '部隊講求功獎分明，積沙成塔。「3 支嘉獎折換 1 支小功，3 支小功晉升 1 支大功，而累積滿 3 支大功的勇者，將獲頒國軍最高榮譽代表——『一星寶星獎章』！」榮譽軍旗在風中飄揚，配掛上一星寶星獎章的士兵，不僅證明了自己的蛻變與成長，更將成為全軍模範勇者，贏得最終勝利！',
    actionPrompt: '🎯【新兵任務】：點擊「⭐ 執行累功換章」，系統將折算累積功績！若有官兵取得一星寶星獎章，即刻敲響全軍勝利凱歌！',
    tips: '★ 終局判定：若有多位官兵同時獲得一星寶星獎章，將依總計功獎積分一較高下，共享全軍表揚！'
  }
};

// 7 種訓練專屬故事指引
const TRAINING_STORIES = {
  'train_1': {
    title: '【三千公尺長跑極限考驗】',
    story: '烈日當頭，營區大操場的紅土跑道上塵土微揚。「一！二！一！二！」全連步伐整齊、呼吸急促，汗水早已浸濕迷彩上衣。這是對心肺極限與意志耐力的終極淬鍊，唯有超越體能瓶頸，方能蛻變為具備鋼鐵耐力的前線士兵！',
    actionPrompt: '🎯【新兵考核】：投擲體力判定骰，展現長跑耐力！'
  },
  'train_2': {
    title: '【健身房的鋼鐵淬鍊】',
    story: '體育館健身房內金屬撞擊聲鏗鏘作響。握緊冰冷沉重的槓鈴，深蹲、臥推與硬舉交替進行，手臂與大腿肌肉在極限重量下緊繃燃燒。汗水滴落在橡膠地墊上，每一次的推舉，都在累積突破重圍的強悍爆發力！',
    actionPrompt: '🎯【新兵考核】：投擲力量判定骰，爆發重訓力量！'
  },
  'train_3': {
    title: '【五百障礙泥濘突破】',
    story: '雙腳踩進濕滑泥地，前方是三公尺高牆、獨木橋與低姿匍匐鐵絲網！「低姿、前進！」身著迷彩服的士兵在碎石泥濘中貼地前進，手肘膝蓋緊密配合，既要靈巧敏捷躲過障礙，又要保持冷靜判斷最短穿越路線！',
    actionPrompt: '🎯【新兵考核】：投擲靈敏判定骰，身手俐落通過障礙！'
  },
  'train_4': {
    title: '【175公尺臥姿步槍精準射擊】',
    story: '「射擊線預備！左線預備、右線預備、全線預備——開保險，開始射擊！」趴在臥射土台上，微調呼吸與心跳，視線專注透過覘孔對準遠方 175 公尺人形靶心，食指平穩均勻扣下扳機，槍響瞬間驗證射手的沉著與智謀！',
    actionPrompt: '🎯【新兵考核】：投擲智慧判定骰，精準命中靶心！'
  },
  'train_5': {
    title: '【近戰CQB快速反應射擊】',
    story: '步入近戰戰鬥屋，四周空間狹窄險惡。轉角瞬間靶標突然彈出！「辨識、抬槍、瞄準、射擊！」動作如行雲流水，毫秒之間完成目標鎖定與連續射擊，極致考驗射手的高壓反應速度與精準控槍能力！',
    actionPrompt: '🎯【新兵考核】：投擲靈敏與力量判定骰，展現極限反應速度！'
  },
  'train_6': {
    title: '【班作戰指揮防線演練】',
    story: '「煙幕彈掩護！一兵推進火力掩護，二兵搶佔側翼高地！」防空戰備哨音劃破天空，班長展開戰術地圖，帶領全班構築交叉火網。面對模擬敵軍進襲，考驗著士兵的臨戰指揮思維、隊形變換與頑強戰鬥意志！',
    actionPrompt: '🎯【新兵考核】：投擲智慧與力量判定骰，構築堅強戰術防線！'
  },
  'train_7': {
    title: '【營區緊急突發應變處置】',
    story: '「警報！營區突發緊急狀況，全連即刻出動應變！」各班兵攜帶搶險與戰術器材飛奔至集結點，分工合作進行損管控制、傷患後送與防禦佈署。在混亂緊張的突發情境中，唯有團隊協作與過人體力才能化險為夷！',
    actionPrompt: '🎯【新兵考核】：投擲體力與靈敏判定骰，迅速排除營區突發危機！'
  }
};

// 10 種部隊任務專屬故事指引
const MISSION_STORIES = {
  'mission_1': {
    title: '【部隊生活環境整肅大出操】',
    story: '「各班注意，將訓練場地與各連營舍徹底清整復原！」完成高強度操課後，官兵們拿著掃具洗刷器材、檢整場地。看似平凡的清潔出操，實則是培養軍人注重細節、嚴守紀律與環境整潔的核心基礎。',
    actionPrompt: '🎯【任務目標】：靈敏 3 點及體力 3 點以上合格！'
  },
  'mission_2': {
    title: '【全連武器裝備年度大檢閱】',
    story: '「槍枝零附件逐一拆解、擦拭上油，光學器材與重兵器全面校正！」每年一度的盛大裝檢來臨，裝備就是軍人的第二生命。高級長官親臨靶溝與兵工庫逐一抽查，唯有平日維保細心、力量與智慧兼備的連隊才能榮獲績優！',
    actionPrompt: '🎯【任務目標】：力量 3 點及智慧 3 點以上合格！'
  },
  'mission_3': {
    title: '【個人內務豆腐乾棉被之戰】',
    story: '晨檢時間到，值星官手持木板走進寢室，仔細測量床鋪棉被的邊角直線。「棉被要捏出線、摺成稜角分明的豆腐乾！」內務是軍人自律的最高體現，在嚴格評比中奪得全連第一的士兵，將是眾人景仰的模範標竿！',
    actionPrompt: '🎯【任務目標】：智慧達 4 以上，且靈敏最高者成功！'
  },
  'mission_4': {
    title: '【全軍年度基本體能大鑑測】',
    story: '國軍三項體能大鑑測正式登場！兩分鐘伏地挺身、仰臥起坐與三千公尺跑步，測驗官手按碼表嚴格計次。「加油！堅持下去！」在同袍的震天吶喊聲中，體魄最強大的勇士將超越極限，奪下全連冠軍榮耀！',
    actionPrompt: '🎯【任務目標】：體力達 4 以上，且力量最高者成功！'
  },
  'mission_5': {
    title: '【步槍實彈滿靶神射手對決】',
    story: '實彈射擊鑑測現場，氣氛肅殺凝重。臥姿上膛、微風輕拂靶場，每一發子彈的彈道都考驗著精準計算與沉著心理。報靶台傳來陣陣歡呼，在眾多神射手之中，唯有技壓全場的頂尖射手能榮獲連長頒發小功表揚！',
    actionPrompt: '🎯【任務目標】：靈敏達 4 以上，且智慧最高者成功！'
  },
  'mission_6': {
    title: '【星光下的負重暗夜急行軍】',
    story: '夜色深沉，全連弟兄背負二十公斤重裝，頭戴鋼盔在無月光的山林道中隱密推進。遠方蟲鳴與沉重的呼吸聲交織，黑暗中考驗著方向辨識、肌耐力與意志力，堅持走到終點且體力最佳的士兵將脫穎而出！',
    actionPrompt: '🎯【任務目標】：力量達 4 以上，且體力最高者成功！'
  },
  'mission_7': {
    title: '【營區反特攻安全防衛演習】',
    story: '「防空警報鳴響！營區周界突發不明滲透威脅！」營長下達全營防護警戒動員令。所有玩家官兵必須緊急討論協商，選定一項最具優勢的素質聯合出擊，合力擲骰構築防護網，共同確保營區安全！',
    actionPrompt: '🎯【任務目標】：全體討論選定一項素質分別判定，合計成功面達 8 顆即全體過關！'
  },
  'mission_8': {
    title: '【風災馳援！前進災區搶救家園】',
    story: '強烈颱風過境，地方鄉鎮遭遇土石流與淹水災情。「苦民所苦，疾民所疾！」國軍部隊聞聲馳援，弟兄們跳進泥濘濁水協助清理道路、搶救物資、安置災民。全連同舟共濟合力擲骰達標，為災區居民重建溫暖家園！',
    actionPrompt: '🎯【任務目標】：全體討論選定一項素質判定，合計成功面達 10 顆即全體榮立小功兩次！'
  },
  'mission_9': {
    title: '【兵科專業基地進訓總鑑測】',
    story: '部隊移防進駐專業訓練基地，迎來長達數週的魔鬼鑑測期！每一位官兵都必須分別接受戰技（力量）、體能（體力）、射擊（靈敏）與專業技能（智慧）四項全能大考驗，全部過關者方能取得基地合格認證！',
    actionPrompt: '🎯【任務目標】：每位玩家 4 項素質各進行測試，判定成功面均達 3 顆以上即獲大功乙次！'
  },
  'mission_10': {
    title: '【三軍聯合實兵漢光演習】',
    story: '國軍年度最重要的實兵實彈戰役——「漢光演習」震撼登場！陸海空三軍聯合指揮，戰車轟鳴、戰機呼嘯，全體官兵在各作戰區堅守陣地。唯有全連發揮最強默契、集中最強素質聯合擲骰達標，方能圓滿完成重大演習任務！',
    actionPrompt: '🎯【任務目標】：全體討論選定一項素質判定，合計成功面達 12 顆即全體獲大功乙次！'
  }
};

// 累功換章未成功時的勉勵故事
const RETRY_BRIEFING = {
  title: '【百煉成鋼．整裝再出發】',
  tag: '勉勵精進．砥礪前行',
  story: '「功績尚未積滿，革命仍須努力！」值星官拍了拍弟兄們的肩膀，語氣充滿肯定與期許：「軍人的榮譽不是一蹴可幾的，每一滴流在操場的汗水都不會白流！」弟兄們迅速整理好迷彩服與鋼盔，眼神中閃爍著更加堅毅的光芒，準備迎接下一輪更精實的訓練與任務，繼續向一星寶星獎章大步邁進！',
  actionPrompt: '🎯【部隊集結】：整裝完畢！進入下一輪訓練課目，百煉成鋼！',
  tips: '💡 班長叮嚀：繼續累積嘉獎與小功，離最高榮譽一星寶星獎章越來越近了！'
};

let lastAnnouncedPhase = null;
let isDiceRollingAnimation = false;

// 取得當前環節應當顯示的故事手記
function getCurrentPhaseStory(phase) {
  if (phase === 'SELECT_TRAINING' && currentRoom?.lastAwardFailedNeedEncourage) {
    return RETRY_BRIEFING;
  }
  if (phase === 'ROLL_TRAINING') {
    const me = currentRoom?.players?.find(p => p.id === myPlayerId) || currentRoom?.players?.[0];
    const tid = me?.currentTrainingId || currentRoom?.players?.[0]?.currentTrainingId;
    if (tid && TRAINING_STORIES[tid]) {
      return { ...PHASE_BRIEFINGS['ROLL_TRAINING'], ...TRAINING_STORIES[tid] };
    }
  }
  if (phase === 'RESOLVE_MISSION' || phase === 'DRAW_MISSION') {
    const mid = currentRoom?.currentMission?.id;
    if (mid && MISSION_STORIES[mid]) {
      return { ...PHASE_BRIEFINGS[phase], ...MISSION_STORIES[mid] };
    }
  }
  return PHASE_BRIEFINGS[phase];
}

function renderBriefingBanner(phase) {
  const info = getCurrentPhaseStory(phase);
  if (!info) return '';
  return `
    <div class="phase-briefing-banner">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
        <span class="briefing-tag">${info.tag}</span>
        <button class="btn btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="showBriefingModal('${phase}')">📖 展開軍旅故事手記</button>
      </div>
      <div class="briefing-title">📜 ${info.title}</div>
      <div style="font-size:0.9rem; color:var(--text-main); font-style:italic; line-height:1.5; margin-bottom:8px; background:rgba(0,0,0,0.25); padding:8px 12px; border-left:3px solid var(--tactical-accent); border-radius:4px;">
        "${info.story}"
      </div>
      <div class="briefing-desc" style="color:#ffd166; font-size:0.95rem;">${info.actionPrompt}</div>
      <div class="briefing-tip" style="margin-top:4px;">${info.tips || ''}</div>
    </div>
  `;
}

function showBriefingModal(phase) {
  const info = getCurrentPhaseStory(phase);
  if (!info) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog" style="text-align:left; max-width:580px; border-color:var(--tactical-accent);">
      <div style="display:inline-block; background:var(--tactical-accent); color:#111; font-weight:900; font-size:0.8rem; padding:3px 10px; border-radius:4px; margin-bottom:10px;">${info.tag}</div>
      <h3 style="color:#ffd166; font-size:1.6rem; margin-bottom:12px;">${info.title}</h3>
      
      <div style="background:rgba(0,0,0,0.35); border-left:4px solid #52b788; padding:12px 14px; border-radius:6px; font-size:0.95rem; color:#e2e8f0; line-height:1.65; margin-bottom:16px; font-style:italic;">
        "${info.story}"
      </div>

      <div style="background:rgba(45, 106, 79, 0.3); border:1px solid var(--tactical-accent); padding:10px 14px; border-radius:6px; margin-bottom:14px; font-weight:700; color:#fff;">
        ${info.actionPrompt}
      </div>

      <div style="background:rgba(0,0,0,0.25); border:1px dashed var(--border-camo); padding:8px 12px; border-radius:6px; font-size:0.85rem; color:#ffd166; margin-bottom:20px;">
        ${info.tips || '各連注意，遵從班長口令行動！'}
      </div>

      <button class="btn btn-primary" style="width:100%; justify-content:center; font-size:1.1rem; padding:12px;" onclick="this.closest('.modal-overlay').remove()">
        我準備好了！
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

function checkAndAutoShowBriefing(phase) {
  if (phase && phase !== lastAnnouncedPhase && phase !== 'LOBBY') {
    lastAnnouncedPhase = phase;
    showBriefingModal(phase);
  }
}

let gameConfig = null;
let currentRoom = null;
let currentRole = null; // 'HOST' | 'PLAYER' | 'SOLO'
let myPlayerId = localStorage.getItem('coh_player_id') || ('p_' + Math.random().toString(36).substring(2, 7));
localStorage.setItem('coh_player_id', myPlayerId);

let sseConnection = null;
let broadcastChannel = null;
try {
  broadcastChannel = new BroadcastChannel('coh_room_channel');
  broadcastChannel.onmessage = (e) => {
    if (e.data && e.data.type === 'room:update') {
      if (currentRoom && e.data.room && currentRoom.roomId === e.data.room.roomId) {
        currentRoom = e.data.room;
        renderCurrentView();
      }
    }
  };
} catch(e) {}

// 初始化
async function initApp() {
  await fetchConfig();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// 取得最新配置
async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.success) {
      gameConfig = data.config;
    }
  } catch (err) {
    console.warn('Using offline config fallback', err);
  }
}

// 路由處理
function handleRoute() {
  const hash = window.location.hash || '#lobby';
  const app = document.getElementById('app');

  if (hash.startsWith('#host')) {
    currentRole = 'HOST';
    renderHostScreen();
  } else if (hash.startsWith('#play')) {
    currentRole = 'PLAYER';
    renderPlayerScreen();
  } else if (hash.startsWith('#solo')) {
    currentRole = 'SOLO';
    renderSoloScreen();
  } else if (hash.startsWith('#admin')) {
    renderAdminScreen();
  } else {
    currentRole = null;
    renderLobbyScreen();
  }
}

function navigateTo(hash) {
  window.location.hash = hash;
}

// API 封裝
async function sendAction(action, payload = {}) {
  if (!currentRoom) return;
  try {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, roomId: currentRoom.roomId, payload })
    });
    const data = await res.json();
    if (data.success && data.room) {
      currentRoom = data.room;
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'room:update', room: currentRoom });
      renderCurrentView();
    } else if (!data.success) {
      alert(data.message || '操作未成功');
    }
  } catch (e) {
    console.error('API Error:', e);
  }
}

// 觸發具備 3D 轉動動畫的擲骰
async function triggerAnimatedDiceRoll(playerId) {
  if (isDiceRollingAnimation) return;
  isDiceRollingAnimation = true;
  renderCurrentView(); // 觸發轉動動畫狀態

  setTimeout(async () => {
    isDiceRollingAnimation = false;
    await sendAction('roll_training_dice', { playerId });
  }, 850);
}

// 觸發協同任務的轉動擲骰
async function triggerAnimatedMissionRoll(playerId, chosenStat) {
  if (isDiceRollingAnimation) return;
  isDiceRollingAnimation = true;
  renderCurrentView();

  setTimeout(async () => {
    isDiceRollingAnimation = false;
    await sendAction('roll_mission_dice', { playerId, chosenStat });
  }, 850);
}

// SSE 連線
function connectRoomSSE(roomId) {
  if (sseConnection) {
    sseConnection.close();
  }
  sseConnection = new EventSource(`/api/events?roomId=${roomId}`);
  sseConnection.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'room:update') {
        currentRoom = data.room;
        renderCurrentView();
      }
    } catch (err) {}
  };
}

function renderCurrentView() {
  const hash = window.location.hash || '#lobby';
  if (currentRoom) {
    checkAndAutoShowBriefing(currentRoom.phase);
  }
  if (hash.startsWith('#host')) renderHostScreen();
  else if (hash.startsWith('#play')) renderPlayerScreen();
  else if (hash.startsWith('#solo')) renderSoloScreen();
}

// -------------------------------------------------------------
// 1. 首頁大廳視圖 (Lobby)
// -------------------------------------------------------------
function renderLobbyScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="hero-banner">
      <h1>《勇者的召喚》</h1>
      <div class="hero-subtitle">臺灣志願役士兵招募與訓練 數位戰術桌遊</div>
      <p style="max-width: 700px; margin: 0 auto; color: var(--text-muted);">
        化身高中畢業、大學畢業、社會人士或專業技術菁英，投身志願役軍旅生活！<br>
        歷經精實訓練、突發事件考驗與實兵任務，累積嘉獎與大小功，角逐最高榮譽「一星寶星獎章」！
      </p>
    </div>

    <div class="lobby-modes-grid">
      <!-- 一個人自己玩 (單人單兵挑戰) -->
      <div class="mode-card" style="border-color:#52b788; background:linear-gradient(145deg, #1f2d24 0%, #17221b 100%);" onclick="startSinglePlayerGame()">
        <div>
          <div style="display:inline-block; background:#52b788; color:#111; font-size:0.75rem; font-weight:900; padding:2px 8px; border-radius:4px; margin-bottom:8px;">★ 推薦模式</div>
          <h3 style="color:#74c69d;">🎮 一個人自己玩 (單兵生涯)</h3>
          <p>無需等待其他人！一人立即自訂姓名與生日，挑選身分開始軍旅冒險，訓練、擲骰、事件與任務全自動一體化！</p>
        </div>
        <button class="btn btn-primary" style="width:100%; justify-content:center; font-size:1.05rem;">一人直接開始遊玩</button>
      </div>

      <!-- 主辦方開房 -->
      <div class="mode-card" onclick="createHostRoom()">
        <div>
          <h3>🛡️ 主辦方建立房間</h3>
          <p>作為戰情指揮中心 / 投影大螢幕！掌控遊戲節奏、推進訓練與任務、實時監控官兵數據。</p>
        </div>
        <button class="btn" style="width:100%; justify-content:center;">建立作戰指揮室</button>
      </div>

      <!-- 參加方加入 -->
      <div class="mode-card" onclick="showJoinModal()">
        <div>
          <h3>🎖️ 參加方加入遊戲</h3>
          <p>新兵報到！使用手機或電腦輸入 4 位數代號加入戰局，自訂真實姓名生日並挑選身分。</p>
        </div>
        <button class="btn btn-gold" style="width:100%; justify-content:center;">新兵報到入伍</button>
      </div>

      <!-- 四人同螢幕演練 -->
      <div class="mode-card" onclick="startSoloMode()">
        <div>
          <h3>⚔️ 四人同螢幕演練</h3>
          <p>一人分飾 4 名新兵戰友，適合教學示範或策略推演桌遊全部角色互動。</p>
        </div>
        <button class="btn" style="width:100%; justify-content:center;">啟動四人演練</button>
      </div>

      <!-- 後台管理 -->
      <div class="mode-card" onclick="navigateTo('#admin')">
        <div>
          <h3>⚙️ 後台管理系統</h3>
          <p>完整自訂 4 大身分、7 大訓練、20 張事件卡、10 張任務卡、單人遊玩設置及規則！</p>
        </div>
        <button class="btn" style="width:100%; justify-content:center;">進入管理後台</button>
      </div>
    </div>
  `;
}

// 單人直接開玩 (個人軍旅生涯挑戰)
async function startSinglePlayerGame() {
  try {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_solo_game',
        payload: { playerName: '志願役戰士', realBirthday: '01-14', playerId: myPlayerId }
      })
    });
    const data = await res.json();
    if (data.success) {
      currentRoom = data.room;
      connectRoomSSE(data.roomId);
      navigateTo(`#play?room=${data.roomId}`);
    } else {
      alert('無法開啟單人遊戲：' + data.message);
    }
  } catch (e) {
    alert('單人開局失敗：' + e.message);
  }
}

// 主辦方建立房間
async function createHostRoom() {
  try {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_room' })
    });
    const data = await res.json();
    if (data.success) {
      currentRoom = data.room;
      connectRoomSSE(data.roomId);
      navigateTo(`#host?room=${data.roomId}`);
    }
  } catch (e) {
    alert('無法建立房間：' + e.message);
  }
}

// 彈出加入房間視窗
function showJoinModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog">
      <h3 style="color:#ffd166; font-size:1.6rem; margin-bottom:16px;">新兵報到入伍手續</h3>
      <div class="form-group" style="text-align:left;">
        <label>作戰室 4 位代碼 (Room Code)</label>
        <input type="text" id="join-room-input" class="form-control" placeholder="例如：ABCD" maxlength="4" style="text-transform:uppercase; font-size:1.3rem; letter-spacing:3px;">
      </div>
      <div class="form-group" style="text-align:left;">
        <label>入伍士兵姓名或暱稱（替代人物姓名）</label>
        <input type="text" id="join-name-input" class="form-control" placeholder="請輸入您的真實姓名或暱稱" value="新兵戰友">
      </div>
      <div class="form-group" style="text-align:left;">
        <label>您的真實生日 (月-日，用於順位優先權判定)</label>
        <input type="text" id="join-birthday-input" class="form-control" placeholder="格式如：05-20" value="05-20">
      </div>
      <div style="display:flex; gap:12px; margin-top:20px;">
        <button class="btn" style="flex:1; justify-content:center;" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="executeJoinRoom()">確認報到</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function executeJoinRoom() {
  const roomId = document.getElementById('join-room-input').value.trim().toUpperCase();
  const name = document.getElementById('join-name-input').value.trim();
  const bday = document.getElementById('join-birthday-input').value.trim();
  if (!roomId || roomId.length !== 4) {
    alert('請輸入有效的 4 位數房間代碼！');
    return;
  }

  try {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_room',
        roomId,
        payload: { playerName: name, realBirthday: bday, playerId: myPlayerId }
      })
    });
    const data = await res.json();
    if (data.success) {
      currentRoom = data.room;
      connectRoomSSE(roomId);
      document.querySelector('.modal-overlay')?.remove();
      navigateTo(`#play?room=${roomId}`);
    } else {
      alert(data.message || '加入失敗');
    }
  } catch (e) {
    alert('連線失敗：' + e.message);
  }
}

// -------------------------------------------------------------
// 2. 主辦方大螢幕視圖 (Host Screen)
// -------------------------------------------------------------
function renderHostScreen() {
  if (!currentRoom) {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const rId = urlParams.get('room');
    if (rId) {
      connectRoomSSE(rId);
      fetch(`/api/config`).then(() => renderCurrentView());
    } else {
      navigateTo('#lobby');
    }
    return;
  }

  const app = document.getElementById('app');
  const phase = currentRoom.phase;
  const currentIp = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const joinUrl = `${window.location.protocol}//${currentIp}${port}/#play?room=${currentRoom.roomId}`;

  app.innerHTML = `
    <!-- 頂部資訊列 -->
    <div class="room-header-bar">
      <div class="room-badge-group">
        <div>
          <span style="font-size:0.8rem; color:var(--text-muted); display:block;">房間連線代碼</span>
          <div class="room-code-badge">${currentRoom.roomId}</div>
        </div>
        <div class="round-info-pill">
          第 <strong>${currentRoom.round}</strong> 回合 ｜ 訓練強度：<strong>x${currentRoom.intensityMultiplier}</strong>
        </div>
        <div style="font-size:0.85rem; color:var(--text-muted);">
          玩家加入網址：<span style="color:#74c69d; font-weight:700;">${joinUrl}</span>
        </div>
      </div>
      <div>
        <button class="btn btn-danger btn-sm" onclick="sendAction('restart_game')">重置遊戲</button>
        <button class="btn btn-sm" onclick="navigateTo('#lobby')">離開房間</button>
      </div>
    </div>

    <!-- 階段指示器 -->
    <div class="phase-stepper">
      <div class="phase-step ${phase === 'LOBBY' ? 'active' : 'passed'}">1. 新兵集結</div>
      <div class="phase-step ${phase === 'SELECT_ROLE' ? 'active' : ''}">2. 身分招募</div>
      <div class="phase-step ${phase === 'SELECT_TRAINING' ? 'active' : ''}">3. 訓練指派</div>
      <div class="phase-step ${phase === 'EVENT' ? 'active' : ''}">4. 突發事件</div>
      <div class="phase-step ${phase === 'ROLL_TRAINING' ? 'active' : ''}">5. 訓練判定</div>
      <div class="phase-step ${phase === 'DRAW_MISSION' || phase === 'RESOLVE_MISSION' ? 'active' : ''}">6. 實兵任務</div>
      <div class="phase-step ${phase === 'AWARDS_VICTORY' || phase === 'MEDAL_CELEBRATION' ? 'active' : ''}">7. 累功換章</div>
    </div>

    <!-- 環節作戰指示橫幅 -->
    ${renderBriefingBanner(phase)}

    <!-- 4位士兵狀況看板 -->
    <div class="players-dock">
      ${renderSoldiersList(currentRoom.players, true)}
    </div>

    <!-- 主戰情區域 -->
    <div class="battlefield-stage">
      <div class="main-ops-board">
        ${renderHostPhaseOperations()}
      </div>

      <!-- 戰情報導日誌 -->
      <div class="intel-logs-panel">
        <h4>📡 國軍作戰通訊即時紀錄</h4>
        <div class="logs-scroll-area">
          ${currentRoom.gameLogs.map(l => `
            <div class="log-entry">
              <span class="time">${l.timestamp}</span>
              ${l.text}
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- 終局獲勝/榮譽士兵彈窗 -->
    ${(currentRoom.phase === 'MEDAL_CELEBRATION' || currentRoom.phase === 'GAME_OVER') ? renderMedalCelebrationModal() : ''}
  `;
}

// 主辦方各階段主要操作
function renderHostPhaseOperations() {
  const p = currentRoom.phase;

  if (p === 'LOBBY') {
    return `
      <div style="text-align:center; padding: 40px 20px;">
        <h3 style="color:#ffd166; font-size:1.8rem; margin-bottom:12px;">作戰指揮中心就緒</h3>
        <p style="color:var(--text-muted); margin-bottom:24px;">
          目前已報到新兵：<strong>${currentRoom.players.length} / 4</strong> 名。<br>
          新兵可在手機端輸入代碼【<strong>${currentRoom.roomId}</strong>】加入，或一人直接開始！
        </p>
        <button class="btn btn-primary" style="font-size:1.15rem; padding:12px 30px;" onclick="sendAction('start_role_selection')">
          🚀 人員到齊，開啟招募選角
        </button>
      </div>
    `;
  }

  if (p === 'SELECT_ROLE') {
    const unselected = currentRoom.players.filter(pl => !pl.roleId);
    return `
      <div>
        <h3 style="color:#ffd166; margin-bottom:8px;">招募階段（身分選擇中）</h3>
        <p style="color:var(--text-muted); margin-bottom:16px;">
          請各新兵在個人終端輸入自訂姓名與生日，並挑選身分（高中畢業、大學畢業、社會人士、專業人士）。
        </p>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:8px; margin-bottom:20px;">
          未選角人數：<strong>${unselected.length}</strong> 人
          ${unselected.map(u => `<span style="margin-left:8px; color:#e76f51;">[${u.name}]</span>`).join('')}
        </div>
        <button class="btn btn-primary" ${unselected.length > 0 ? 'disabled' : ''} onclick="sendAction('finalize_roles')">
          ✓ 全員選角完畢，比對生日決定順位並開始訓練
        </button>
      </div>
    `;
  }

  if (p === 'SELECT_TRAINING') {
    const unassigned = currentRoom.players.filter(pl => !pl.currentTrainingId);
    return `
      <div>
        <h3 style="color:#ffd166; margin-bottom:8px;">第 ${currentRoom.round} 回合：選擇訓練模式</h3>
        <p style="color:var(--text-muted); margin-bottom:16px;">
          本回合先鋒順位：<strong>${currentRoom.players[currentRoom.firstPlayerIndex]?.name || '無'}</strong>。<br>
          請各位戰友在終端選定欲派遣的訓練項目。
        </p>
        <div style="background:rgba(0,0,0,0.3); padding:14px; border-radius:8px; margin-bottom:16px;">
          未完成指派：<strong>${unassigned.length}</strong> 人
          ${unassigned.map(u => `<span style="margin-left:8px; color:#e76f51;">[${u.name}]</span>`).join('')}
        </div>
        <button class="btn btn-primary" ${unassigned.length > 0 ? 'disabled' : ''} onclick="sendAction('proceed_to_event')">
          ⏩ 全員訓練就位，進入突發事件階段
        </button>
      </div>
    `;
  }

  if (p === 'EVENT') {
    return `
      <div style="text-align:center; padding:30px 10px;">
        <h3 style="color:#ffd166; font-size:1.6rem; margin-bottom:12px;">突發事件階段</h3>
        <p style="color:var(--text-muted); margin-bottom:20px;">
          軍旅生活充滿各項不可預期的突發生活瑣事！請抽取本回合事件卡。
        </p>
        <button class="btn btn-gold" style="font-size:1.15rem; padding:12px 30px;" onclick="sendAction('draw_event')">
          🃏 抽取本回合事件卡
        </button>
      </div>
    `;
  }

  if (p === 'ROLL_TRAINING') {
    return `
      <div>
        ${currentRoom.currentEvent ? renderEventCard(currentRoom.currentEvent) : ''}
        <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="color:#fff;">訓練考核判定中</h4>
            <p style="color:var(--text-muted); font-size:0.9rem;">
              請各官兵在終端投擲作戰骰，檢核是否達成通過標準。
            </p>
          </div>
          <button class="btn btn-primary" onclick="sendAction('resolve_training_phase')">
            ⚖️ 結算本輪訓練與屬性增益
          </button>
        </div>
      </div>
    `;
  }

  if (p === 'DRAW_MISSION') {
    return `
      <div style="text-align:center; padding:30px 10px;">
        <h3 style="color:#ffd166; font-size:1.6rem; margin-bottom:12px;">部隊任務發布階段</h3>
        <p style="color:var(--text-muted); margin-bottom:20px;">
          經過嚴格訓練後，各部隊將接受各項實兵任務檢驗！請抽取本回合任務令。
        </p>
        <button class="btn btn-primary" style="font-size:1.15rem; padding:12px 30px;" onclick="sendAction('draw_mission')">
          🎖️ 抽取本回合任務令
        </button>
      </div>
    `;
  }

  if (p === 'RESOLVE_MISSION') {
    return `
      <div>
        ${currentRoom.currentMission ? renderMissionCard(currentRoom.currentMission) : ''}
        <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="color:#fff;">實兵任務評核與協同判定</h4>
            <p style="color:var(--text-muted); font-size:0.9rem;">
              檢核官兵各項素質標準或團隊聯合擲骰貢獻。
            </p>
          </div>
          <button class="btn btn-gold" onclick="sendAction('resolve_mission_phase')">
            🏅 判定任務是否成功並發放功獎
          </button>
        </div>
      </div>
    `;
  }

  if (p === 'AWARDS_VICTORY') {
    return `
      <div style="text-align:center; padding:30px 10px;">
        <h3 style="color:#ffd166; font-size:1.6rem; margin-bottom:12px;">累功換章與勝利判定</h3>
        <p style="color:var(--text-muted); margin-bottom:20px;">
          折算準則：<strong>3 支嘉獎 = 1 支小功</strong>、<strong>3 支小功 = 1 支大功</strong>、<strong>3 支大功 = 一星寶星獎章</strong>！<br>
          官兵榮獲「一星寶星獎章」將晉升為榮譽士兵！其餘人員亦可選擇繼續受訓爭取下一枚勳章。
        </p>
        <button class="btn btn-gold" style="font-size:1.15rem; padding:14px 34px;" onclick="sendAction('resolve_awards_and_victory')">
          ⭐ 執行累功換章並檢驗勳章
        </button>
      </div>
    `;
  }

  return '';
}

// 渲染卡片 (事件卡)
function renderEventCard(ev) {
  return `
    <div class="tactical-drawn-card">
      <span class="card-tag-pill">突發事件 #${ev.id}</span>
      <div class="card-title-lg">${ev.name}</div>
      <div class="card-desc-box">${ev.description}</div>
      <div class="card-effect-alert">
        ⚡ 效果及影響：${ev.effect}
      </div>
    </div>
  `;
}

// 渲染卡片 (任務卡)
function renderMissionCard(m) {
  return `
    <div class="tactical-drawn-card" style="border-color:#52b788;">
      <span class="card-tag-pill" style="background:#52b788; color:#111;">部隊任務 #${m.order || m.id}</span>
      <div class="card-title-lg">${m.name}</div>
      <div class="card-desc-box">${m.description}</div>
      <div style="background:rgba(45, 106, 79, 0.25); border-left:4px solid #52b788; padding:10px 14px; border-radius:4px; margin-bottom:10px;">
        🎯 任務目標：<strong>${m.conditionsDescription}</strong>
      </div>
      <div style="color:#ffd166; font-weight:700;">
        🎁 任務獎勵：${m.rewardDescription}
      </div>
    </div>
  `;
}

// 渲染士兵列表
function renderSoldiersList(players, isHost) {
  if (!players || players.length === 0) {
    return `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted); background:var(--bg-panel); border-radius:8px;">尚無新兵加入，等待連線中...</div>`;
  }

  return players.map((p, idx) => {
    const isFirst = idx === currentRoom.firstPlayerIndex;
    const role = p.roleData;
    const avatarSvg = role ? GAME_ASSETS.avatars[role.id] : `<div style="color:var(--text-muted); font-size:0.8rem; text-align:center;">未選角</div>`;

    return `
      <div class="soldier-dossier-card ${isFirst ? 'is-active-player' : ''}">
        ${isFirst ? '<span style="position:absolute; top:6px; right:8px; background:#ffd166; color:#111; font-size:0.7rem; font-weight:900; padding:1px 6px; border-radius:3px;">本輪先鋒</span>' : ''}
        <div class="soldier-card-top">
          <div class="soldier-avatar-box">
            ${avatarSvg}
          </div>
          <div class="soldier-meta">
            <h4>${p.name}</h4>
            <div class="soldier-role-sub">${role ? `${role.name} (${role.soldierName})` : '正在挑選身分'}</div>
            <div class="soldier-birthday-tag">生日: ${p.realBirthday || '未填'}</div>
          </div>
        </div>

        <!-- 4維能力值 -->
        <div class="stats-grid-gauges">
          <div class="stat-item-badge">
            <span class="stat-name">力量</span>
            <span class="stat-value">${p.stats.strength}</span>
          </div>
          <div class="stat-item-badge">
            <span class="stat-name">靈敏</span>
            <span class="stat-value">${p.stats.agility}</span>
          </div>
          <div class="stat-item-badge">
            <span class="stat-name">體力</span>
            <span class="stat-value">${p.stats.endurance}</span>
          </div>
          <div class="stat-item-badge">
            <span class="stat-name">智慧</span>
            <span class="stat-value">${p.stats.intelligence}</span>
          </div>
        </div>

        <!-- 功獎徽章欄 -->
        <div class="awards-strip">
          <div class="award-token-item" title="嘉獎 (3支可換1小功)">
            <span class="award-token-name">嘉獎</span>
            <span class="award-token-count">${p.awards.merit}</span>
          </div>
          <div class="award-token-item" title="小功 (3支可換1大功)">
            <span class="award-token-name">小功</span>
            <span class="award-token-count">${p.awards.small}</span>
          </div>
          <div class="award-token-item" title="大功 (3支可換一星寶星獎章)">
            <span class="award-token-name">大功</span>
            <span class="award-token-count">${p.awards.large}</span>
          </div>
          <div class="award-token-item" title="一星寶星獎章 (勝利標的)">
            <span class="award-token-name">勳章</span>
            <span class="award-token-count ${p.awards.medal > 0 ? 'has-medal' : ''}">${p.awards.medal}</span>
          </div>
        </div>

        ${p.currentTrainingId ? `
          <div style="margin-top:10px; font-size:0.8rem; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:4px; display:flex; justify-content:space-between;">
            <span>目前訓練：${currentRoom.config.trainings.find(t=>t.id===p.currentTrainingId)?.name}</span>
            <span>${p.trainingSuccess !== null ? (p.trainingSuccess ? '🟢 通過' : '🔴 未過') : '⏳ 待判定'}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// 3. 參加方玩家手機/個人端 (Player Screen)
// -------------------------------------------------------------
function renderPlayerScreen() {
  if (!currentRoom) {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const rId = urlParams.get('room');
    if (rId) {
      connectRoomSSE(rId);
      sendAction('join_room', { playerName: '新兵戰友', realBirthday: '05-20', playerId: myPlayerId });
    } else {
      navigateTo('#lobby');
    }
    return;
  }

  const app = document.getElementById('app');
  const me = currentRoom.players.find(p => p.id === myPlayerId) || currentRoom.players[0] || {};
  const phase = currentRoom.phase;

  app.innerHTML = `
    <!-- 手機端頂部 -->
    <div class="room-header-bar" style="padding:10px 14px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.85rem; color:var(--text-muted);">房號: <strong>${currentRoom.roomId}</strong></span>
        <span class="round-info-pill" style="padding:2px 8px; font-size:0.8rem;">R${currentRoom.round} (x${currentRoom.intensityMultiplier})</span>
      </div>
      <div>
        <span style="font-size:0.9rem; font-weight:700; color:#ffd166;">${me.name || '戰友'}</span>
      </div>
    </div>

    <!-- 環節作戰指示橫幅 -->
    ${renderBriefingBanner(phase)}

    <!-- 個人角色卡/軍籍圖板 -->
    ${me.roleData ? renderMyDossier(me) : ''}

    <!-- 階段行動區域 -->
    <div style="margin-top:16px;">
      ${renderPlayerPhaseActions(me, phase)}
    </div>

    <!-- 終局獲勝/榮譽士兵彈窗 -->
    ${(currentRoom.phase === 'MEDAL_CELEBRATION' || currentRoom.phase === 'GAME_OVER') ? renderMedalCelebrationModal() : ''}
  `;
}

// 玩家個人軍籍圖板
function renderMyDossier(me) {
  const role = me.roleData;
  return `
    <div class="soldier-dossier-card" style="border-color:var(--tactical-accent); margin-bottom:16px;">
      <div class="soldier-card-top">
        <div class="soldier-avatar-box" style="width:70px; height:80px;">
          ${GAME_ASSETS.avatars[role.id]}
        </div>
        <div class="soldier-meta">
          <h4>${me.name} <small style="color:#ffd166;">[${role.name}]</small></h4>
          <div style="font-size:0.85rem; color:var(--text-muted);">${role.soldierName} ｜ 生日：${role.birthdayText}</div>
          <div style="font-size:0.75rem; color:#74c69d; margin-top:3px;">
            技能1：${role.skills[0].name} ｜ 技能2：${role.skills[1].name}
          </div>
        </div>
      </div>

      <!-- 四維屬性刻度 -->
      <div class="stats-grid-gauges">
        <div class="stat-item-badge">
          <span class="stat-name">力量 STR</span>
          <span class="stat-value">${me.stats.strength}</span>
        </div>
        <div class="stat-item-badge">
          <span class="stat-name">靈敏 AGI</span>
          <span class="stat-value">${me.stats.agility}</span>
        </div>
        <div class="stat-item-badge">
          <span class="stat-name">體力 END</span>
          <span class="stat-value">${me.stats.endurance}</span>
        </div>
        <div class="stat-item-badge">
          <span class="stat-name">智慧 INT</span>
          <span class="stat-value">${me.stats.intelligence}</span>
        </div>
      </div>

      <!-- 獎章功績 -->
      <div class="awards-strip">
        <div class="award-token-item">
          <span class="award-token-name">嘉獎</span>
          <span class="award-token-count">${me.awards.merit}</span>
        </div>
        <div class="award-token-item">
          <span class="award-token-name">小功</span>
          <span class="award-token-count">${me.awards.small}</span>
        </div>
        <div class="award-token-item">
          <span class="award-token-name">大功</span>
          <span class="award-token-count">${me.awards.large}</span>
        </div>
        <div class="award-token-item">
          <span class="award-token-name">寶星勳章</span>
          <span class="award-token-count ${me.awards.medal > 0 ? 'has-medal' : ''}">${me.awards.medal}</span>
        </div>
      </div>
    </div>
  `;
}

// 玩家在各階段操作
function renderPlayerPhaseActions(me, phase) {
  const isSoloUser = currentRoom.players.length === 1 || currentRoom.isSolo;

  if (phase === 'LOBBY') {
    return `
      <div style="text-align:center; padding:30px; background:var(--bg-panel); border-radius:8px;">
        <h3 style="color:#ffd166;">已加入作戰序列</h3>
        <p style="color:var(--text-muted); margin-top:8px;">
          ${isSoloUser ? '目前為單人軍旅生涯模式，點擊下方即可立即出發！' : '等待主辦方啟動招募階段...'}
        </p>
        ${isSoloUser ? `
          <button class="btn btn-primary" style="margin-top:16px; font-size:1.1rem;" onclick="sendAction('start_role_selection')">
            🚀 開始挑選代表身分
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'SELECT_ROLE') {
    return `
      <div style="background:var(--bg-panel); border-radius:10px; padding:16px;">
        <h3 style="color:#ffd166; margin-bottom:6px;">身分招募：自訂姓名與挑選身分</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:14px;">
          輸入您的個人資料以替代人物預設檔，並挑選專屬特長身分：
        </p>

        <!-- 自訂個人姓名與生日 -->
        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-camo); border-radius:8px; padding:12px; margin-bottom:16px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem; color:#ffd166;">您的姓名或暱稱</label>
            <input type="text" id="custom-soldier-name" class="form-control" style="font-size:0.9rem;" value="${me.name || '新兵戰士'}" placeholder="例如：陳大明">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem; color:#ffd166;">您的真實生日 (月-日)</label>
            <input type="text" id="custom-soldier-bday" class="form-control" style="font-size:0.9rem;" value="${me.realBirthday || '05-20'}" placeholder="例如：05-20">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:12px;">
          ${currentRoom.config.roles.map(r => {
            const isTaken = currentRoom.players.some(p => p.id !== me.id && p.roleId === r.id);
            const isSelected = me.roleId === r.id;
            return `
              <div class="training-card-item ${isSelected ? 'selected' : ''}" style="${isTaken ? 'opacity:0.4; pointer-events:none;' : ''}" onclick="selectRoleWithCustomData('${me.id}', '${r.id}')">
                <div style="display:flex; gap:12px; align-items:center;">
                  <div style="width:60px; height:70px;">${GAME_ASSETS.avatars[r.id]}</div>
                  <div style="flex-grow:1;">
                    <div style="display:flex; justify-content:space-between;">
                      <h4 style="color:#fff;">${r.name}</h4>
                      <span style="font-size:0.75rem; color:#ffd166;">身分特長</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin:4px 0;">
                      ${r.characteristics}
                    </div>
                    <div style="font-size:0.75rem; color:#74c69d;">
                      初始：力${r.initialStats.strength} 敏${r.initialStats.agility} 體${r.initialStats.endurance} 智${r.initialStats.intelligence}
                    </div>
                    <div style="font-size:0.75rem; color:#f4a261; margin-top:3px;">
                      ✦ ${r.skills[0].name}：${r.skills[0].description}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${isSoloUser && me.roleId ? `
          <button class="btn btn-primary" style="width:100%; margin-top:16px; font-size:1.15rem; padding:12px;" onclick="sendAction('finalize_roles')">
            🚀 身分選定完成，開始第 1 回合訓練！
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'SELECT_TRAINING') {
    return `
      <div style="background:var(--bg-panel); border-radius:10px; padding:16px;">
        <h3 style="color:#ffd166; margin-bottom:6px;">選擇訓練模式</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:12px;">
          選定本回合欲執行的基礎訓練項目：
        </p>
        <div class="trainings-selector-grid">
          ${currentRoom.config.trainings.map(t => {
            const isCur = me.currentTrainingId === t.id;
            const rewText = Object.entries(t.rewards).map(([k,v]) => `${k==='strength'?'力':k==='agility'?'敏':k==='endurance'?'體':'智'}+${v}`).join(', ');
            return `
              <div class="training-card-item ${isCur ? 'selected' : ''}" onclick="sendAction('choose_training', { playerId: '${me.id}', trainingId: '${t.id}' })">
                <div class="training-title-row">
                  <div class="training-icon-mini">${GAME_ASSETS.trainings[t.id] || ''}</div>
                  <h5>${t.name}</h5>
                </div>
                <div class="training-condition-text">${t.description}</div>
                <div style="font-size:0.75rem; color:#ffd166; margin-bottom:4px;">需達標：${t.targetSuccesses * currentRoom.intensityMultiplier} 顆命中面</div>
                <span class="training-rewards-tag">獎勵：${rewText}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${isSoloUser && me.currentTrainingId ? `
          <button class="btn btn-primary" style="width:100%; margin-top:16px; font-size:1.1rem; padding:12px;" onclick="sendAction('proceed_to_event')">
            ⏩ 訓練指派完畢，進入突發事件！
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'EVENT') {
    return `
      <div style="text-align:center; padding:30px; background:var(--bg-panel); border-radius:8px;">
        <h3 style="color:#ffd166;">突發事件即將揭曉</h3>
        <p style="color:var(--text-muted); margin-top:8px;">
          ${isSoloUser ? '軍旅生活中各項生活瑣事考驗著新兵！請揭曉本回合事件。' : '等待主辦方抽取事件卡...'}
        </p>
        ${isSoloUser ? `
          <button class="btn btn-gold" style="font-size:1.15rem; padding:12px 30px; margin-top:16px;" onclick="sendAction('draw_event')">
            🃏 抽取突發事件卡
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'ROLL_TRAINING') {
    const curTraining = currentRoom.config.trainings.find(t => t.id === me.currentTrainingId);
    return `
      <div style="background:var(--bg-panel); border-radius:10px; padding:16px;">
        ${currentRoom.currentEvent ? renderEventCard(currentRoom.currentEvent) : ''}
        
        <div class="dice-arena-box">
          <h4 style="color:#fff; margin-bottom:6px;">訓練考核：【${curTraining?.name || '訓練'}】</h4>
          <p style="color:var(--text-muted); font-size:0.85rem;">
            點擊下方按鈕擲骰，軍徽星芒為命中面朝上！
          </p>

          ${isDiceRollingAnimation ? `
            <div class="dice-list-flex">
              ${[1,2,3,4].map(() => GAME_ASSETS.renderRollingDice()).join('')}
            </div>
            <div style="color:#ffd166; font-weight:800; font-size:1.1rem; margin-top:10px;">🎲 作戰骰劇烈滾動中...</div>
          ` : (me.diceResults ? `
            <div class="dice-list-flex">
              ${me.diceResults.rolls.map(r => GAME_ASSETS.renderDice(r.value, r.isSuccess)).join('')}
            </div>
            <div style="font-size:1.2rem; font-weight:800; color:${me.diceResults.passed ? '#52b788' : '#d90429'}; margin-top:10px;">
              ${me.diceResults.passed ? '🎉 訓練成功通過！' : '❌ 未達標，訓練失敗'} (成功面：${me.diceResults.successes} / 目標：${me.diceResults.targetSuccesses})
            </div>
            ${isSoloUser ? `
              <button class="btn btn-primary" style="width:100%; margin-top:18px; font-size:1.1rem; padding:12px;" onclick="sendAction('resolve_training_phase')">
                ⚖️ 結算訓練屬性增益並接受任務
              </button>
            ` : ''}
          ` : `
            <div style="margin:24px 0;">
              <button class="btn btn-primary" style="font-size:1.2rem; padding:12px 36px;" onclick="triggerAnimatedDiceRoll('${me.id}')">
                🎲 投擲作戰判定骰
              </button>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  if (phase === 'DRAW_MISSION') {
    return `
      <div style="text-align:center; padding:30px; background:var(--bg-panel); border-radius:8px;">
        <h3 style="color:#ffd166;">準備接受部隊任務</h3>
        <p style="color:var(--text-muted); margin-top:8px;">
          ${isSoloUser ? '經過基礎訓練，即刻接受國軍實兵實兵任務考驗！' : '等待主辦方發布任務令...'}
        </p>
        ${isSoloUser ? `
          <button class="btn btn-primary" style="font-size:1.15rem; padding:12px 30px; margin-top:16px;" onclick="sendAction('draw_mission')">
            🎖️ 抽取本回合部隊任務
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'RESOLVE_MISSION') {
    const mis = currentRoom.currentMission;
    const isCoop = mis?.type === 'coop_dice_pool';
    const myRoll = currentRoom.teamMissionDicePool[me.id];

    return `
      <div style="background:var(--bg-panel); border-radius:10px; padding:16px;">
        ${mis ? renderMissionCard(mis) : ''}

        ${isCoop ? `
          <div class="dice-arena-box">
            <h4 style="color:#ffd166; margin-bottom:8px;">協同作戰任務判定</h4>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:12px;">
              選擇一項你最有把握的素質進行投擲，為部隊任務貢獻命中面數：
            </p>
            ${isDiceRollingAnimation ? `
              <div class="dice-list-flex">
                ${[1,2,3,4].map(() => GAME_ASSETS.renderRollingDice()).join('')}
              </div>
              <div style="color:#ffd166; font-weight:800;">🎲 團隊協同擲骰翻滾中...</div>
            ` : (myRoll ? `
              <div class="dice-list-flex">
                ${myRoll.rolls.map(r => GAME_ASSETS.renderDice(r.value, r.isSuccess)).join('')}
              </div>
              <div style="color:#74c69d; font-weight:700;">你已貢獻 ${myRoll.successes} 顆成功面！</div>
            ` : `
              <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                <button class="btn btn-sm" onclick="triggerAnimatedMissionRoll('${me.id}', 'strength')">力量 (${me.stats.strength}骰)</button>
                <button class="btn btn-sm" onclick="triggerAnimatedMissionRoll('${me.id}', 'agility')">靈敏 (${me.stats.agility}骰)</button>
                <button class="btn btn-sm" onclick="triggerAnimatedMissionRoll('${me.id}', 'endurance')">體力 (${me.stats.endurance}骰)</button>
                <button class="btn btn-sm" onclick="triggerAnimatedMissionRoll('${me.id}', 'intelligence')">智慧 (${me.stats.intelligence}骰)</button>
              </div>
            `)}
          </div>
        ` : ''}

        ${isSoloUser ? `
          <button class="btn btn-gold" style="width:100%; margin-top:16px; font-size:1.1rem; padding:12px;" onclick="sendAction('resolve_mission_phase')">
            🏅 判定任務是否成功並發放功獎
          </button>
        ` : ''}
      </div>
    `;
  }

  if (phase === 'AWARDS_VICTORY') {
    return `
      <div style="text-align:center; padding:30px; background:var(--bg-panel); border-radius:8px;">
        <h3 style="color:#ffd166;">回合累功換章結算</h3>
        <p style="color:var(--text-muted); margin-top:8px;">
          ${isSoloUser ? '檢核嘉獎換小功、小功換大功、大功換寶星勳章！' : '等待主辦方完成勳章換算...'}
        </p>
        ${isSoloUser ? `
          <button class="btn btn-gold" style="font-size:1.15rem; padding:12px 30px; margin-top:16px;" onclick="sendAction('resolve_awards_and_victory')">
            ⭐ 執行累功換章並檢驗勝利
          </button>
        ` : ''}
      </div>
    `;
  }

  return '';
}

// 帶自訂姓名與生日選角
function selectRoleWithCustomData(playerId, roleId) {
  const customName = document.getElementById('custom-soldier-name')?.value?.trim() || '';
  const customBday = document.getElementById('custom-soldier-bday')?.value?.trim() || '';
  sendAction('select_role', { playerId, roleId, customName, customBirthday: customBday });
}

// -------------------------------------------------------------
// 4. 單機同螢幕演練模式 (Solo / Pass & Play)
// -------------------------------------------------------------
async function startSoloMode() {
  await createHostRoom();
  const names = ['新兵 馨慧', '新兵 星儀', '新兵 嘉亨', '新兵 彥材'];
  const bdays = ['01-14', '08-15', '04-25', '11-30'];
  for (let i = 0; i < 4; i++) {
    await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_room',
        roomId: currentRoom.roomId,
        payload: { playerName: names[i], realBirthday: bdays[i], playerId: `solo_${i}` }
      })
    });
  }
  navigateTo(`#solo?room=${currentRoom.roomId}`);
}

function renderSoloScreen() {
  if (!currentRoom) {
    navigateTo('#lobby');
    return;
  }
  renderHostScreen();
}

// -------------------------------------------------------------
// 5. 後台管理系統 (Admin CMS)
// -------------------------------------------------------------
let activeAdminTab = 'roles';

function checkIsAdminLoggedIn() {
  return sessionStorage.getItem('coh_admin_token') === 'authenticated' && sessionStorage.getItem('coh_admin_user') === 'shiun8282';
}

function renderAdminLoginScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="max-width:440px; margin: 50px auto; background:var(--bg-panel); border:2px solid var(--border-camo); border-radius:12px; padding:32px; box-shadow:0 12px 40px rgba(0,0,0,0.6); text-align:center;">
      <div style="font-size:3rem; margin-bottom:8px;">🔐</div>
      <h2 style="color:#ffd166; font-size:1.7rem; margin-bottom:6px;">國軍戰情管理身分認證</h2>
      <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:24px;">後台管制區域：請輸入指揮官憑證以存取系統數據</p>
      
      <div id="admin-login-error" style="display:none; background:rgba(217,4,41,0.2); border:1px solid #d90429; color:#ff6b6b; padding:8px 12px; border-radius:6px; font-size:0.85rem; margin-bottom:16px;"></div>

      <div class="form-group" style="text-align:left;">
        <label>管理者帳號</label>
        <input type="text" id="admin-username-input" class="form-control" placeholder="請輸入管理者帳號" autocomplete="off" autofocus>
      </div>

      <div class="form-group" style="text-align:left;">
        <label>管理密碼</label>
        <input type="password" id="admin-password-input" class="form-control" placeholder="請輸入管理密碼" onkeydown="if(event.key==='Enter') executeAdminLogin()">
      </div>

      <div style="display:flex; gap:12px; margin-top:24px;">
        <button class="btn" style="flex:1; justify-content:center;" onclick="navigateTo('#lobby')">返回首頁</button>
        <button class="btn btn-primary" style="flex:1; justify-content:center; font-weight:700;" onclick="executeAdminLogin()">認證登入</button>
      </div>
    </div>
  `;
}

function executeAdminLogin() {
  const user = document.getElementById('admin-username-input').value.trim();
  const pass = document.getElementById('admin-password-input').value.trim();
  const errBox = document.getElementById('admin-login-error');

  if (user === 'shiun8282' && pass === '82828282') {
    sessionStorage.setItem('coh_admin_token', 'authenticated');
    sessionStorage.setItem('coh_admin_user', 'shiun8282');
    renderAdminScreen();
  } else {
    errBox.style.display = 'block';
    errBox.innerText = '❌ 帳號或密碼錯誤，請重新確認！';
  }
}

function adminLogout() {
  sessionStorage.removeItem('coh_admin_token');
  sessionStorage.removeItem('coh_admin_user');
  navigateTo('#lobby');
}

function renderAdminScreen() {
  if (!checkIsAdminLoggedIn()) {
    renderAdminLoginScreen();
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="color:#ffd166; font-size:2rem;">🛡️ 《勇者的召喚》後台數據管理中心</h2>
        <div style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
          在此可自由修改所有角色背景數據、訓練強度、20張事件卡、10張任務卡與折算規則！
          <span style="display:inline-block; margin-left:10px; background:#1b4332; border:1px solid #52b788; color:#74c69d; font-size:0.75rem; padding:2px 8px; border-radius:4px;">
            👤 已認證管理者：<strong>shiun8282</strong>
          </span>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-gold" onclick="saveAdminConfig()">💾 儲存所有更動</button>
        <button class="btn btn-danger" onclick="resetAdminConfig()">↺ 恢復桌遊預設值</button>
        <button class="btn" onclick="exportConfigJson()">📥 匯出 JSON</button>
        <button class="btn" onclick="document.getElementById('import-file-input').click()">📤 匯入 JSON</button>
        <input type="file" id="import-file-input" style="display:none;" onchange="importConfigJson(event)" accept=".json">
        <button class="btn" onclick="adminLogout()">🚪 登出</button>
      </div>
    </div>

    <!-- 標籤切換列 -->
    <div class="admin-tabs">
      <button class="admin-tab-btn ${activeAdminTab==='roles'?'active':''}" onclick="switchAdminTab('roles')">官兵身分角色 (4位)</button>
      <button class="admin-tab-btn ${activeAdminTab==='trainings'?'active':''}" onclick="switchAdminTab('trainings')">訓練模式 (7種)</button>
      <button class="admin-tab-btn ${activeAdminTab==='events'?'active':''}" onclick="switchAdminTab('events')">突發事件庫 (20張)</button>
      <button class="admin-tab-btn ${activeAdminTab==='missions'?'active':''}" onclick="switchAdminTab('missions')">作戰任務令 (10張)</button>
      <button class="admin-tab-btn ${activeAdminTab==='system'?'active':''}" onclick="switchAdminTab('system')">勳章規則與折算比率</button>
    </div>

    <div class="admin-tab-content">
      ${renderAdminTabContent()}
    </div>
  `;
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  renderAdminScreen();
}

function renderAdminTabContent() {
  if (!gameConfig) return '<p>載入配置中...</p>';

  if (activeAdminTab === 'roles') {
    return `
      <div class="admin-cards-list">
        ${gameConfig.roles.map((r, idx) => `
          <div class="admin-item-card">
            <h4 style="color:#ffd166; margin-bottom:10px;">身分 #${idx+1}：${r.name}</h4>
            <div class="form-group">
              <label>身分別名稱</label>
              <input type="text" class="form-control" value="${r.name}" onchange="gameConfig.roles[${idx}].name=this.value">
            </div>
            <div class="form-group">
              <label>士兵姓名</label>
              <input type="text" class="form-control" value="${r.soldierName}" onchange="gameConfig.roles[${idx}].soldierName=this.value">
            </div>
            <div class="form-group">
              <label>生日文字</label>
              <input type="text" class="form-control" value="${r.birthdayText}" onchange="gameConfig.roles[${idx}].birthdayText=this.value">
            </div>
            <div class="form-group">
              <label>背景故事</label>
              <textarea class="form-control" rows="2" onchange="gameConfig.roles[${idx}].background=this.value">${r.background}</textarea>
            </div>
            <div class="form-group">
              <label>個性特點</label>
              <input type="text" class="form-control" value="${r.characteristics}" onchange="gameConfig.roles[${idx}].characteristics=this.value">
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px;">
              <div>
                <label style="font-size:0.75rem;">力量</label>
                <input type="number" class="form-control" value="${r.initialStats.strength}" onchange="gameConfig.roles[${idx}].initialStats.strength=Number(this.value)">
              </div>
              <div>
                <label style="font-size:0.75rem;">靈敏</label>
                <input type="number" class="form-control" value="${r.initialStats.agility}" onchange="gameConfig.roles[${idx}].initialStats.agility=Number(this.value)">
              </div>
              <div>
                <label style="font-size:0.75rem;">體力</label>
                <input type="number" class="form-control" value="${r.initialStats.endurance}" onchange="gameConfig.roles[${idx}].initialStats.endurance=Number(this.value)">
              </div>
              <div>
                <label style="font-size:0.75rem;">智慧</label>
                <input type="number" class="form-control" value="${r.initialStats.intelligence}" onchange="gameConfig.roles[${idx}].initialStats.intelligence=Number(this.value)">
              </div>
            </div>
            <div style="margin-top:12px;">
              <label style="font-size:0.8rem; color:#74c69d;">技能 1：${r.skills[0].name}</label>
              <input type="text" class="form-control" style="font-size:0.8rem; margin-top:2px;" value="${r.skills[0].description}" onchange="gameConfig.roles[${idx}].skills[0].description=this.value">
            </div>
            <div style="margin-top:8px;">
              <label style="font-size:0.8rem; color:#74c69d;">技能 2：${r.skills[1].name}</label>
              <input type="text" class="form-control" style="font-size:0.8rem; margin-top:2px;" value="${r.skills[1].description}" onchange="gameConfig.roles[${idx}].skills[1].description=this.value">
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (activeAdminTab === 'trainings') {
    return `
      <div class="admin-cards-list">
        ${gameConfig.trainings.map((t, idx) => `
          <div class="admin-item-card">
            <h4 style="color:#ffd166; margin-bottom:10px;">訓練 #${idx+1}：${t.name}</h4>
            <div class="form-group">
              <label>訓練名稱</label>
              <input type="text" class="form-control" value="${t.name}" onchange="gameConfig.trainings[${idx}].name=this.value">
            </div>
            <div class="form-group">
              <label>內容說明</label>
              <textarea class="form-control" rows="2" onchange="gameConfig.trainings[${idx}].description=this.value">${t.description}</textarea>
            </div>
            <div class="form-group">
              <label>通過標準骰數 (成功面數量)</label>
              <input type="number" class="form-control" value="${t.targetSuccesses}" onchange="gameConfig.trainings[${idx}].targetSuccesses=Number(this.value)">
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (activeAdminTab === 'events') {
    return `
      <div class="admin-cards-list">
        ${gameConfig.events.map((e, idx) => `
          <div class="admin-item-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 style="color:#ffd166;">事件卡 #${e.id}：${e.name}</h4>
            </div>
            <div class="form-group">
              <label>事件名稱</label>
              <input type="text" class="form-control" value="${e.name}" onchange="gameConfig.events[${idx}].name=this.value">
            </div>
            <div class="form-group">
              <label>情境描寫</label>
              <textarea class="form-control" rows="2" onchange="gameConfig.events[${idx}].description=this.value">${e.description}</textarea>
            </div>
            <div class="form-group">
              <label>效果及影響說明</label>
              <input type="text" class="form-control" value="${e.effect}" onchange="gameConfig.events[${idx}].effect=this.value">
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (activeAdminTab === 'missions') {
    return `
      <div class="admin-cards-list">
        ${gameConfig.missions.map((m, idx) => `
          <div class="admin-item-card">
            <h4 style="color:#52b788; margin-bottom:8px;">任務令 #${m.order || m.id}：${m.name}</h4>
            <div class="form-group">
              <label>任務名稱</label>
              <input type="text" class="form-control" value="${m.name}" onchange="gameConfig.missions[${idx}].name=this.value">
            </div>
            <div class="form-group">
              <label>任務描述</label>
              <textarea class="form-control" rows="2" onchange="gameConfig.missions[${idx}].description=this.value">${m.description}</textarea>
            </div>
            <div class="form-group">
              <label>達成目標說明</label>
              <input type="text" class="form-control" value="${m.conditionsDescription}" onchange="gameConfig.missions[${idx}].conditionsDescription=this.value">
            </div>
            <div class="form-group">
              <label>獎勵說明</label>
              <input type="text" class="form-control" value="${m.rewardDescription}" onchange="gameConfig.missions[${idx}].rewardDescription=this.value">
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (activeAdminTab === 'system') {
    const s = gameConfig.systemSettings;
    return `
      <div style="max-width:600px;">
        <h4 style="color:#ffd166; margin-bottom:14px;">國軍功獎累計與折算規則</h4>
        <div class="form-group">
          <label>幾支【嘉獎】折換 1 支【小功】？</label>
          <input type="number" class="form-control" value="${s.pointsPerAwardLevel.meritToSmall}" onchange="gameConfig.systemSettings.pointsPerAwardLevel.meritToSmall=Number(this.value)">
        </div>
        <div class="form-group">
          <label>幾支【小功】折換 1 支【大功】？</label>
          <input type="number" class="form-control" value="${s.pointsPerAwardLevel.smallToLarge}" onchange="gameConfig.systemSettings.pointsPerAwardLevel.smallToLarge=Number(this.value)">
        </div>
        <div class="form-group">
          <label>幾支【大功】折換 1 座【一星寶星獎章】？</label>
          <input type="number" class="form-control" value="${s.pointsPerAwardLevel.largeToMedal}" onchange="gameConfig.systemSettings.pointsPerAwardLevel.largeToMedal=Number(this.value)">
        </div>
        <div class="form-group">
          <label>最少開局人數（設為 1 即可一個人自己開始遊玩）</label>
          <input type="number" class="form-control" min="1" max="4" value="${s.minPlayersToStart || 1}" onchange="gameConfig.systemSettings.minPlayersToStart=Number(this.value)">
        </div>
        <div class="form-group">
          <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
            <input type="checkbox" ${s.soloCoopTaskScale !== false ? 'checked' : ''} onchange="gameConfig.systemSettings.soloCoopTaskScale=this.checked">
            <span style="color:#74c69d; font-weight:700;">單人/少人數遊玩時，團隊合作任務目標自動依人數縮放（一人也能順暢通關）</span>
          </label>
        </div>
        <div class="form-group">
          <label>訓練強度加倍週期（每幾回合通過難度加倍？）</label>
          <input type="number" class="form-control" value="${s.intensityDoubleEveryRounds}" onchange="gameConfig.systemSettings.intensityDoubleEveryRounds=Number(this.value)">
        </div>
        <div class="form-group">
          <label>骰子幾點以上為【命中面朝上】？(1-6點)</label>
          <input type="number" class="form-control" min="1" max="6" value="${s.diceSuccessThreshold}" onchange="gameConfig.systemSettings.diceSuccessThreshold=Number(this.value)">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" ${s.failurePenaltyStatEnabled ? 'checked' : ''} onchange="gameConfig.systemSettings.failurePenaltyStatEnabled=this.checked">
            啟用進階規則：訓練失敗時任一素質扣 1 點
          </label>
        </div>
      </div>
    `;
  }

  return '';
}

// 儲存修改
async function saveAdminConfig() {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameConfig)
    });
    const data = await res.json();
    if (data.success) {
      alert('✓ 遊戲設定已成功儲存並同步至所有作戰房間！');
    } else {
      alert('儲存失敗：' + data.message);
    }
  } catch (e) {
    alert('儲存發生錯誤：' + e.message);
  }
}

// 恢復預設值
async function resetAdminConfig() {
  if (!confirm('確定要將所有數據恢復為原版桌遊設定嗎？')) return;
  try {
    const res = await fetch('/api/config/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      gameConfig = data.config;
      renderAdminScreen();
      alert('✓ 已成功重設回桌遊原版配置！');
    }
  } catch (e) {
    alert('重設失敗：' + e.message);
  }
}

// 匯出 JSON
function exportConfigJson() {
  const blob = new Blob([JSON.stringify(gameConfig, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `call_of_heroes_config_${Date.now()}.json`;
  a.click();
}

// 匯入 JSON
function importConfigJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.roles && imported.trainings) {
        gameConfig = imported;
        renderAdminScreen();
        alert('✓ 配置匯入成功，請點擊「儲存所有更動」寫入伺服器！');
      } else {
        alert('檔案格式錯誤：缺少必要的 roles 或 trainings 欄位。');
      }
    } catch (err) {
      alert('JSON 解析失敗：' + err.message);
    }
  };
  reader.readAsText(file);
}

// 榮譽士兵功勳受封 / 終局勝利結算彈窗
function renderMedalCelebrationModal() {
  const winners = currentRoom.recentMedalWinners || currentRoom.winners || [];
  const remainingPlayers = currentRoom.players?.filter(p => !winners.some(w => w.id === p.id && p.awards.medal >= 1)) || [];
  const hasRemaining = remainingPlayers.length > 0;

  return `
    <div class="modal-overlay">
      <div class="modal-dialog" style="max-width:620px;">
        <div class="victory-trophy-img">${GAME_ASSETS.awards.medal}</div>
        <h2 style="color:#ffd166; font-size:2rem; margin-bottom:6px;">★ 榮譽士兵功勳受封 ★</h2>
        <div style="font-size:1.1rem; color:#fff; margin-bottom:14px;">
          恭喜以下官兵榮獲【一星寶星獎章】，積存功勳卓著，率先榮膺國軍「榮譽士兵」！
        </div>
        <div style="background:rgba(0,0,0,0.45); padding:16px; border-radius:8px; margin-bottom:20px; border:1px solid #ffd166;">
          ${winners.map(w => `
            <div style="font-size:1.35rem; font-weight:800; color:#ffd166; margin-bottom:4px;">
              🎖️ ${w.name} (${w.soldierName})
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              一星寶星獎章 x${w.awards?.medal || 1} ｜ 大功 x${w.awards?.large || 0} ｜ 小功 x${w.awards?.small || 0} ｜ 嘉獎 x${w.awards?.merit || 0}
            </div>
          `).join('')}
        </div>

        <div style="display:flex; gap:12px; flex-direction:column;">
          ${hasRemaining ? `
            <button class="btn btn-gold" style="font-size:1.1rem; padding:12px;" onclick="sendAction('continue_game_for_remaining')">
              ⚔️ 榮譽士兵留名！剩下的弟兄繼續受訓挑戰下一座勳章
            </button>
          ` : ''}
          <button class="btn btn-primary" style="font-size:1rem; padding:10px;" onclick="sendAction('finalize_game_over')">
            🏆 圓滿結束戰事（結算全軍總排行）
          </button>
          <button class="btn" style="font-size:0.95rem; padding:8px;" onclick="sendAction('restart_game')">
            🔄 重新開啟新戰局
          </button>
        </div>
      </div>
    </div>
  `;
}

// 啟動應用程式
window.addEventListener('DOMContentLoaded', initApp);
