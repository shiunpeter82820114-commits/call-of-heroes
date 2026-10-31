// 內建向量圖示與角色像素插圖庫 (還原桌遊設計與國軍戰術風格)
const GAME_ASSETS = {
  // 角色像素頭像/立繪
  avatars: {
    role_1: `<svg viewBox="0 0 100 120" class="hero-avatar-svg">
      <defs>
        <linearGradient id="camo1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3d5a3b"/>
          <stop offset="50%" stop-color="#556b2f"/>
          <stop offset="100%" stop-color="#283618"/>
        </linearGradient>
      </defs>
      <!-- 身體/迷彩服 -->
      <path d="M25 65 L75 65 L85 115 L15 115 Z" fill="url(#camo1)" stroke="#1a2410" stroke-width="2"/>
      <rect x="42" y="65" width="16" height="50" fill="#2d371e"/>
      <!-- 衣領與徽章 -->
      <polygon points="35,65 50,78 45,65" fill="#bc6c25"/>
      <polygon points="65,65 50,78 55,65" fill="#bc6c25"/>
      <!-- 頭部/脖子 -->
      <rect x="43" y="55" width="14" height="15" fill="#fcd5b4"/>
      <!-- 臉部 -->
      <rect x="30" y="25" width="40" height="36" rx="4" fill="#fedcc0"/>
      <!-- 眼睛/微笑容 -->
      <rect x="38" y="38" width="6" height="5" fill="#2c1d11"/>
      <rect x="56" y="38" width="6" height="5" fill="#2c1d11"/>
      <path d="M44 50 Q50 54 56 50" stroke="#a74a38" stroke-width="2" fill="none"/>
      <!-- 青春短髮 (楊馨慧) -->
      <path d="M26 25 Q50 10 74 25 L75 38 L68 34 L62 25 L38 25 L32 34 L25 38 Z" fill="#222"/>
      <rect x="25" y="28" width="5" height="14" fill="#222"/>
      <rect x="70" y="28" width="5" height="14" fill="#222"/>
      <!-- 學生兵徽章 -->
      <circle cx="50" cy="85" r="4" fill="#e9d8a6"/>
      <text x="50" y="116" font-size="8" fill="#e9d8a6" text-anchor="middle" font-weight="bold">楊馨慧</text>
    </svg>`,

    role_2: `<svg viewBox="0 0 100 120" class="hero-avatar-svg">
      <defs>
        <linearGradient id="camo2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4a5759"/>
          <stop offset="50%" stop-color="#3d5a3b"/>
          <stop offset="100%" stop-color="#2b303a"/>
        </linearGradient>
      </defs>
      <!-- 大學畢業生 (林星儀) - 文青眼鏡、雙書 -->
      <path d="M25 65 L75 65 L85 115 L15 115 Z" fill="url(#camo2)" stroke="#1a2410" stroke-width="2"/>
      <!-- 手抱書籍 -->
      <rect x="62" y="70" width="16" height="30" rx="2" fill="#9b2226" transform="rotate(-10 62 70)"/>
      <rect x="68" y="72" width="14" height="26" fill="#f4a261" transform="rotate(-10 68 72)"/>
      <rect x="43" y="55" width="14" height="15" fill="#faedcd"/>
      <rect x="30" y="24" width="40" height="36" rx="3" fill="#faedcd"/>
      <!-- 眼鏡 -->
      <rect x="34" y="34" width="13" height="10" rx="2" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="53" y="34" width="13" height="10" rx="2" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="47" y1="39" x2="53" y2="39" stroke="#333" stroke-width="2"/>
      <circle cx="40" cy="39" r="2" fill="#222"/>
      <circle cx="60" cy="39" r="2" fill="#222"/>
      <!-- 齊瀏海短髮 -->
      <path d="M26 24 C35 12 65 12 74 24 L75 35 L68 28 L32 28 L25 35 Z" fill="#3d2618"/>
      <text x="50" y="116" font-size="8" fill="#e9d8a6" text-anchor="middle" font-weight="bold">林星儀</text>
    </svg>`,

    role_3: `<svg viewBox="0 0 100 120" class="hero-avatar-svg">
      <defs>
        <linearGradient id="camo3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#283618"/>
          <stop offset="50%" stop-color="#606c38"/>
          <stop offset="100%" stop-color="#1b2a1a"/>
        </linearGradient>
      </defs>
      <!-- 社會人士 (蔡嘉亨) - 沉穩、手持板手/壯碩體格 -->
      <path d="M22 62 L78 62 L90 115 L10 115 Z" fill="url(#camo3)" stroke="#1a2410" stroke-width="2.5"/>
      <!-- 手持板手 -->
      <path d="M12 65 L22 80 L18 105 L10 105 Z" fill="#6c757d"/>
      <circle cx="16" cy="65" r="7" fill="#adb5bd"/>
      <rect x="13" y="60" width="6" height="6" fill="#495057"/>
      <rect x="42" y="52" width="16" height="15" fill="#e0a96d"/>
      <rect x="28" y="20" width="44" height="40" rx="4" fill="#e0a96d"/>
      <!-- 沉著眼神與鬍渣痕跡 -->
      <rect x="36" y="34" width="7" height="4" fill="#1b120c"/>
      <rect x="57" y="34" width="7" height="4" fill="#1b120c"/>
      <line x1="33" y1="30" x2="45" y2="33" stroke="#2b1e16" stroke-width="2"/>
      <line x1="67" y1="30" x2="55" y2="33" stroke="#2b1e16" stroke-width="2"/>
      <path d="M44 48 H56" stroke="#8c4b28" stroke-width="2"/>
      <!-- 俐落寸頭 -->
      <path d="M27 24 Q50 14 73 24 L74 27 L26 27 Z" fill="#2b1e16"/>
      <text x="50" y="116" font-size="8" fill="#e9d8a6" text-anchor="middle" font-weight="bold">蔡嘉亨</text>
    </svg>`,

    role_4: `<svg viewBox="0 0 100 120" class="hero-avatar-svg">
      <defs>
        <linearGradient id="camo4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3a5a40"/>
          <stop offset="50%" stop-color="#588157"/>
          <stop offset="100%" stop-color="#344e41"/>
        </linearGradient>
      </defs>
      <!-- 專業人士 (黃彥材) - 科技戰術感、微型顯示耳機 -->
      <path d="M24 64 L76 64 L86 115 L14 115 Z" fill="url(#camo4)" stroke="#1a2410" stroke-width="2"/>
      <rect x="43" y="54" width="14" height="15" fill="#f5cac3"/>
      <rect x="30" y="22" width="40" height="38" rx="4" fill="#f5cac3"/>
      <!-- 專業分析眼神與科技耳機 -->
      <circle cx="39" cy="36" r="3" fill="#1d3557"/>
      <circle cx="61" cy="36" r="3" fill="#1d3557"/>
      <rect x="25" y="32" width="5" height="12" rx="2" fill="#0077b6"/>
      <path d="M26 42 Q32 50 40 48" stroke="#00b4d8" stroke-width="2" fill="none"/>
      <!-- 旁分俐落髮型 -->
      <path d="M26 23 C38 12 72 16 75 24 L76 33 L70 26 L26 28 Z" fill="#1c2541"/>
      <text x="50" y="116" font-size="8" fill="#e9d8a6" text-anchor="middle" font-weight="bold">黃彥材</text>
    </svg>`
  },

  // 榮譽勳章與功獎圖卡
  awards: {
    merit: `<svg viewBox="0 0 80 100" class="award-svg">
      <rect x="5" y="5" width="70" height="90" rx="6" fill="#2b3e2b" stroke="#606c38" stroke-width="3"/>
      <rect x="12" y="12" width="56" height="40" rx="3" fill="#a4ac86"/>
      <circle cx="40" cy="32" r="14" fill="#dda15e" stroke="#bc6c25" stroke-width="2"/>
      <polygon points="40,22 43,29 50,30 45,35 46,42 40,38 34,42 35,35 30,30 37,29" fill="#fefae0"/>
      <rect x="15" y="60" width="50" height="22" rx="3" fill="#d4a373"/>
      <text x="40" y="75" font-size="11" fill="#283618" text-anchor="middle" font-weight="900">嘉獎乙次</text>
    </svg>`,

    small: `<svg viewBox="0 0 80 100" class="award-svg">
      <rect x="5" y="5" width="70" height="90" rx="6" fill="#1b2a1a" stroke="#d4af37" stroke-width="3"/>
      <rect x="12" y="12" width="56" height="40" rx="3" fill="#283618"/>
      <!-- 銀星與月桂冠 -->
      <circle cx="40" cy="32" r="15" fill="#e0e1dd" stroke="#778da9" stroke-width="2"/>
      <polygon points="40,20 44,28 53,30 47,36 48,45 40,40 32,45 33,36 27,30 36,28" fill="#f8f9fa"/>
      <rect x="15" y="60" width="50" height="22" rx="3" fill="#f4a261"/>
      <text x="40" y="75" font-size="11" fill="#1f2421" text-anchor="middle" font-weight="900">小功乙次</text>
    </svg>`,

    large: `<svg viewBox="0 0 80 100" class="award-svg">
      <rect x="5" y="5" width="70" height="90" rx="6" fill="#3d0000" stroke="#ffd700" stroke-width="3.5"/>
      <rect x="12" y="12" width="56" height="40" rx="3" fill="#580c10"/>
      <!-- 金星勳表 -->
      <circle cx="40" cy="32" r="16" fill="#ffb703" stroke="#fb8500" stroke-width="2"/>
      <polygon points="40,18 44,28 54,30 46,37 48,47 40,41 32,47 34,37 26,30 36,28" fill="#fff3b0"/>
      <rect x="15" y="60" width="50" height="22" rx="3" fill="#e76f51"/>
      <text x="40" y="75" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">大功乙次</text>
    </svg>`,

    medal: `<svg viewBox="0 0 90 110" class="award-svg medal-gold-glow">
      <defs>
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff75e"/>
          <stop offset="50%" stop-color="#ffd700"/>
          <stop offset="100%" stop-color="#b8860b"/>
        </radialGradient>
      </defs>
      <rect x="5" y="5" width="80" height="100" rx="8" fill="#14213d" stroke="url(#goldGlow)" stroke-width="4"/>
      <!-- 彩帶 -->
      <polygon points="25,12 65,12 60,35 45,45 30,35" fill="#e63946"/>
      <line x1="45" y1="12" x2="45" y2="45" stroke="#f1faee" stroke-width="4"/>
      <!-- 一星寶星立體勳章 -->
      <circle cx="45" cy="55" r="18" fill="url(#goldGlow)" stroke="#fff" stroke-width="2"/>
      <polygon points="45,40 50,51 62,52 53,60 55,71 45,65 35,71 37,60 28,52 40,51" fill="#fff"/>
      <circle cx="45" cy="55" r="5" fill="#1d3557"/>
      <rect x="10" y="80" width="70" height="20" rx="4" fill="#ffd700"/>
      <text x="45" y="94" font-size="10" fill="#000" text-anchor="middle" font-weight="900">一星寶星獎章</text>
    </svg>`
  },

  // 訓練模式圖示
  trainings: {
    train_1: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#2b9348"/><path d="M22 45 L32 30 L40 38 L48 20" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="32" cy="18" r="5" fill="#fff"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">跑步</text></svg>`,
    train_2: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#e76f51"/><rect x="12" y="27" width="36" height="6" fill="#fff"/><circle cx="15" cy="30" r="10" fill="#333" stroke="#fff" stroke-width="2"/><circle cx="45" cy="30" r="10" fill="#333" stroke="#fff" stroke-width="2"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">重力</text></svg>`,
    train_3: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#e9c46a"/><path d="M12 40 L24 22 L36 40 L48 22" stroke="#264653" stroke-width="4" stroke-linecap="round" fill="none"/><text x="30" y="55" font-size="8" fill="#264653" text-anchor="middle">障礙</text></svg>`,
    train_4: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#2a9d8f"/><circle cx="30" cy="30" r="16" fill="none" stroke="#fff" stroke-width="3"/><line x1="30" y1="8" x2="30" y2="52" stroke="#fff" stroke-width="2"/><line x1="8" y1="30" x2="52" y2="30" stroke="#fff" stroke-width="2"/><circle cx="30" cy="30" r="4" fill="#e63946"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">狙擊</text></svg>`,
    train_5: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#f4a261"/><path d="M20 35 L40 25 L35 45 Z" fill="#fff"/><circle cx="42" cy="20" r="4" fill="#d90429"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">快射</text></svg>`,
    train_6: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#457b9d"/><path d="M15 42 L30 18 L45 42 Z" fill="#fff" stroke="#1d3557" stroke-width="2"/><polygon points="30,22 34,32 42,32 36,38 38,46 30,41 22,46 24,38 18,32 26,32" fill="#ffd166"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">戰備</text></svg>`,
    train_7: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#9b5de5"/><path d="M18 42 C18 25 42 25 42 42" stroke="#fff" stroke-width="4" fill="none"/><polygon points="30,12 36,22 24,22" fill="#fff"/><text x="30" y="55" font-size="8" fill="#fff" text-anchor="middle">應變</text></svg>`
  },

  // 骰子渲染器 (成功面以金色國徽/星芒代表，普通面以常規點數代表)
  renderDice: function(value, isSuccess) {
    if (isSuccess) {
      return `<div class="tactical-die success-die" title="點數 ${value} (成功面朝上)">
        <svg viewBox="0 0 40 40" class="die-star-svg">
          <circle cx="20" cy="20" r="17" fill="#2d6a4f"/>
          <polygon points="20,6 24,15 34,16 26,23 28,33 20,28 12,33 14,23 6,16 16,15" fill="#ffd166" stroke="#fff" stroke-width="1"/>
          <circle cx="20" cy="20" r="4" fill="#fff"/>
        </svg>
        <span class="die-val-tag">${value}</span>
      </div>`;
    } else {
      return `<div class="tactical-die fail-die" title="點數 ${value}">
        <span class="die-number">${value}</span>
      </div>`;
    }
  },

  renderRollingDice: function() {
    return `<div class="tactical-die rolling" style="background:#2d4a22; border-color:#ffd166;">
      <span class="die-number" style="font-size:1.6rem;">🎲</span>
    </div>`;
  }
};
