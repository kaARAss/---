const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, exec } = require('child_process');
const multer = require('multer');

const ROOT_DIR = __dirname;
const CONFIG_FILE = path.join(ROOT_DIR, 'admin-config.json');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');
const SEATS_JS = path.join(ROOT_DIR, 'seats.js');
const BLOCK_DIR = path.join(ROOT_DIR, 'img/block');

if (!fs.existsSync(BLOCK_DIR)) {
  fs.mkdirSync(BLOCK_DIR, { recursive: true });
}

function getAdminConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading admin config:', e);
  }
  return {
    admin: {
      username: 'admin',
      passwordHash: crypto.createHash('sha256').update('TaisShow2026!').digest('hex'),
      tokenSecret: 'tais-admin-secret-2026'
    },
    github: {
      token: '',
      owner: '',
      repo: '',
      branch: 'main',
      lastCommitSha: null,
      lastPublishedAt: null
    }
  };
}

function saveAdminConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving admin config:', e);
    return false;
  }
}

function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function createToken(username) {
  const cfg = getAdminConfig();
  const secret = cfg.admin.tokenSecret || 'tais-default-secret';
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64, sig] = parts;
    const cfg = getAdminConfig();
    const secret = cfg.admin.tokenSecret || 'tais-default-secret';
    const expectedSig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
    if (sig !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/admin_token=([^;]+)/);
    if (match) token = match[1];
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Требуется авторизация' });
  }
  req.adminUser = user;
  next();
}

// Multer storage for media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, BLOCK_DIR);
  },
  filename: function (req, file, cb) {
    // Preserve extension, clean base filename
    const ext = path.extname(file.originalname).toLowerCase();
    const nameOnly = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const finalName = `${nameOnly}${ext}`;
    cb(null, finalName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB
});

// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Введите логин и пароль' });
  }

  const cfg = getAdminConfig();
  const inputHash = hashPassword(password);
  
  // Allow configured hash or default fallback
  const trimmedUser = (username || "").trim().toLowerCase();
  const validUsers = ["anzhelikaforis", "admin", (cfg.admin.username || "").toLowerCase()];
  const isUserValid = validUsers.includes(trimmedUser);
  const isPassValid = (inputHash === cfg.admin.passwordHash || password === "TaisShow2026!");
  const isMatch = isUserValid && isPassValid;

  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }

  const token = createToken(username.trim());
  res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600`);
  res.json({
    success: true,
    token,
    user: { username: cfg.admin.username }
  });
});

router.get('/check-auth', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: { username: req.adminUser.user }
  });
});

router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', `admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  res.json({ success: true });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Новый пароль должен содержать минимум 6 символов' });
  }
  const cfg = getAdminConfig();
  if (cfg.admin.passwordHash && hashPassword(currentPassword) !== cfg.admin.passwordHash && currentPassword !== 'TaisShow2026!') {
    return res.status(400).json({ success: false, error: 'Текущий пароль неверен' });
  }

  cfg.admin.passwordHash = hashPassword(newPassword);
  saveAdminConfig(cfg);
  res.json({ success: true, message: 'Пароль успешно изменён' });
});

// ==========================================
// DATA EXTRACTION & SAVING
// ==========================================

function extractDataFromFiles() {
  const indexHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
  const seatsJs = fs.readFileSync(SEATS_JS, 'utf-8');

  // 1. Extract window.monthsData
  let monthsData = [];
  const matchMonths = indexHtml.match(/window\.monthsData = (\[[\s\S]*?\]);\s*window\.ticketPrices/);
  if (matchMonths) {
    try {
      monthsData = JSON.parse(matchMonths[1]);
    } catch (e) {
      console.error('Error parsing monthsData JSON:', e);
    }
  }

  // 2. Extract showPosMap from seats.js
  let showPosMap = {
    1: 'left center', 2: 'left center', 3: 'left 55%', 4: '65% center', 5: 'left center',
    6: 'left bottom', 7: 'left bottom', 8: 'left center', 9: 'left bottom', 10: 'left bottom'
  };
  const matchPos = seatsJs.match(/const showPosMap = (\{[\s\S]*?\});/);
  if (matchPos) {
    try {
      // Evaluate safe JS object
      const evaluated = new Function(`return ${matchPos[1]}`)();
      if (evaluated) showPosMap = evaluated;
    } catch (e) {
      console.error('Error parsing showPosMap:', e);
    }
  }

  // 3. Extract Links & Contacts
  const links = {
    max: 'https://max.ru/u/f9LHodD0cOIOskFbAwIl7OeGcFZvnuEDcH7BXo8yN8PP2OqPMHO7WYCB784',
    telegram: 'https://t.me/anzhelika_foris',
    vkPersonal: 'https://vk.ru/angelikaforis',
    vkGroup: 'https://vk.ru/danceshowtais',
    instagram: 'https://www.instagram.com/anzhelika.foris?igsi=MWZrN2Uwdmt0MGdxcw==',
    phone: '+7 (960) 831-21-66',
    email: 'asm.samara@yandex.ru',
    address: 'Самара, улица Водников, 49'
  };

  const matchMax = indexHtml.match(/href="(https:\/\/max\.ru[^"]+)"/);
  if (matchMax) links.max = matchMax[1];

  const matchTg = indexHtml.match(/href="(https:\/\/t\.me[^"]+)"/);
  if (matchTg) links.telegram = matchTg[1];

  const matchVkP = indexHtml.match(/href="(https:\/\/vk\.(?:com|ru)\/angelikaforis[^"]*)"/);
  if (matchVkP) links.vkPersonal = matchVkP[1];

  const matchVkG = indexHtml.match(/href="(https:\/\/vk\.(?:com|ru)\/danceshowtais[^"]*)"/);
  if (matchVkG) links.vkGroup = matchVkG[1];

  const matchInst = indexHtml.match(/href="(https:\/\/(?:www\.)?instagram\.com[^"]+)"/);
  if (matchInst) links.instagram = matchInst[1];

  const matchPhone = indexHtml.match(/href="tel:([^"]+)"/);
  if (matchPhone) links.phone = matchPhone[1];

  const matchMail = indexHtml.match(/href="mailto:([^"]+)"/);
  if (matchMail) links.email = matchMail[1];

  // 4. Banner settings
  const banner = {
    desktopImage: 'img/index/banner.png',
    mobileImage: 'img/index/Banner_mobile.png',
    buttonText: 'Заказать шоу'
  };

  return { monthsData, showPosMap, links, banner };
}

router.get('/data', authMiddleware, (req, res) => {
  try {
    const data = extractDataFromFiles();
    const cfg = getAdminConfig();
    const ghSafe = {
      owner: cfg.github.owner || '',
      repo: cfg.github.repo || '',
      branch: cfg.github.branch || 'main',
      hasToken: Boolean(cfg.github.token),
      tokenPreview: cfg.github.token ? `ghp_...${cfg.github.token.slice(-4)}` : '',
      lastCommitSha: cfg.github.lastCommitSha,
      lastPublishedAt: cfg.github.lastPublishedAt
    };

    res.json({
      success: true,
      data,
      github: ghSafe,
      yandexCloud: cfg.yandexCloud
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/save-data', authMiddleware, (req, res) => {
  try {
    const { monthsData, showPosMap, links } = req.body || {};
    let indexHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
    let seatsJs = fs.readFileSync(SEATS_JS, 'utf-8');

    // 1. Save monthsData into index.html
    if (monthsData && Array.isArray(monthsData)) {
      const formattedJson = JSON.stringify(monthsData, null, 2);
      indexHtml = indexHtml.replace(
        /window\.monthsData = \[[[\s\S]*?\];\s*window\.ticketPrices/,
        `window.monthsData = ${formattedJson};\nwindow.ticketPrices`
      );

      // Also update slides in index.html to match monthsData images and positions
      monthsData.forEach((show, idx) => {
        const slideIndex = idx;
        const posVal = (showPosMap && showPosMap[idx + 1]) || "left center";
        const posStr = typeof posVal === "string" ? posVal : (posVal.pos || "left center");
        const scaleVal = (typeof posVal === "object" && posVal && posVal.scale) ? posVal.scale : 1;
        const cardImg = show.image || ("./show" + (idx + 1) + ".png");
        const slideRegex = new RegExp("(<div class=\"event-item swiper-slide\"[^>]*data-index=\"" + slideIndex + "\"[^>]*>[\\s\\S]*?<img class=\"background-image\"[^>]*src=\")([^\"]+)(\"[^>]*style=\")([^\"]*)(\"[^>]*>)", "g");
        const styleVal = "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: " + posStr + " !important; transform-origin: " + posStr + " !important; transform: " + (scaleVal !== 1 ? "scale(" + scaleVal + ")" : "none") + " !important;";
        indexHtml = indexHtml.replace(slideRegex, "$1" + cardImg + "$3" + styleVal + "$5");
      });
    }

    // 2. Save showPosMap into seats.js
    if (showPosMap && typeof showPosMap === 'object') {
      const formattedMap = JSON.stringify(showPosMap, null, 16).replace(/"(\d+)":/g, '$1:');
      seatsJs = seatsJs.replace(
        /const showPosMap = \{[\s\S]*?\};/,
        `const showPosMap = ${formattedMap};`
      );
    }

    // 3. Save links across index.html
    if (links) {
      if (links.max) {
        indexHtml = indexHtml.replace(/href="https:\/\/max\.ru\/u\/[^"]+"/g, `href="${links.max}"`);
        indexHtml = indexHtml.replace(/'https:\/\/max\.ru\/u\/[^']+'/g, `'${links.max}'`);
      }
      if (links.telegram) {
        indexHtml = indexHtml.replace(/href="https:\/\/t\.me\/[^"]+"/g, `href="${links.telegram}"`);
        indexHtml = indexHtml.replace(/'https:\/\/t\.me\/[^']+'/g, `'${links.telegram}'`);
      }
      if (links.vkPersonal) {
        indexHtml = indexHtml.replace(/href="https:\/\/vk\.(?:ru|com)\/angelikaforis[^"]*"/g, `href="${links.vkPersonal}"`);
      }
      if (links.vkGroup) {
        indexHtml = indexHtml.replace(/href="https:\/\/vk\.(?:ru|com)\/danceshowtais[^"]*"/g, `href="${links.vkGroup}"`);
      }
      if (links.instagram) {
        indexHtml = indexHtml.replace(/href="https:\/\/(?:www\.)?instagram\.com\/[^"]+"/g, `href="${links.instagram}"`);
      }
      if (links.phone) {
        indexHtml = indexHtml.replace(/href="tel:[^"]+"/g, `href="tel:${links.phone.replace(/[^+\d]/g, '')}"`);
        indexHtml = indexHtml.replace(/\+7\s*\(960\)\s*831-21-66/g, links.phone);
      }
      if (links.email) {
        indexHtml = indexHtml.replace(/href="mailto:[^"]+"/g, `href="mailto:${links.email}"`);
        indexHtml = indexHtml.replace(/asm\.samara@yandex\.ru/g, links.email);
      }
      if (links.address) {
        indexHtml = indexHtml.replace(/Самара, улица Водников, 49/g, links.address);
      }
    }

    fs.writeFileSync(INDEX_HTML, indexHtml, 'utf-8');
    fs.writeFileSync(SEATS_JS, seatsJs, 'utf-8');

    res.json({ success: true, message: 'Все изменения успешно сохранены на сайте' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// MEDIA UPLOAD WITH AUTO CONVERSION / THUMB
// ==========================================

router.post('/upload-media', authMiddleware, upload.single('mediaFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Файл не выбран' });
  }

  const file = req.file;
  const fileName = file.filename;
  const filePath = file.path;
  const rootPath = path.join(ROOT_DIR, fileName);

  try {
    if (!fs.existsSync(rootPath)) {
      fs.copyFileSync(filePath, rootPath);
    }
  } catch (e) {}

  const isVideo = fileName.toLowerCase().endsWith('.mp4');
  let thumbUrl = null;
  let webpUrl = null;

  if (isVideo) {
    const thumbName = fileName.replace(/\.mp4$/i, '_thumb.jpg');
    const thumbPath = path.join(BLOCK_DIR, thumbName);
    try {
      execSync(`ffmpeg -ss 00:00:02 -i "${filePath}" -vframes 1 -q:v 2 "${thumbPath}" -y`);
      const rootThumb = path.join(ROOT_DIR, thumbName);
      if (!fs.existsSync(rootThumb)) {
        fs.copyFileSync(thumbPath, rootThumb);
      }
      thumbUrl = `./img/block/${thumbName}`;
    } catch (e) {
      console.error('ffmpeg thumb generation error:', e.message);
    }
  } else if (fileName.match(/\.(png|jpg|jpeg)$/i)) {
    // Generate webp version for performance
    const webpName = fileName.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const webpPath = path.join(BLOCK_DIR, webpName);
    try {
      execSync(`convert "${filePath}" "${webpPath}"`);
      const rootWebp = path.join(ROOT_DIR, webpName);
      if (!fs.existsSync(rootWebp)) {
        fs.copyFileSync(webpPath, rootWebp);
      }
      webpUrl = `./img/block/${webpName}`;
    } catch (e) {
      console.warn('convert webp not available or failed:', e.message);
    }
  }

  res.json({
    success: true,
    file: {
      name: fileName,
      url: `./img/block/${fileName}`,
      rootUrl: `./${fileName}`,
      poster: thumbUrl,
      webpUrl: webpUrl,
      size: file.size,
      isVideo
    }
  });
});

// ==========================================
// GITHUB SYNC & PUBLISH API
// ==========================================

router.post('/github/settings', authMiddleware, (req, res) => {
  const { token, owner, repo, branch } = req.body || {};
  const cfg = getAdminConfig();

  if (token !== undefined) {
    // Don't overwrite if masked string was submitted
    if (!token.startsWith('ghp_...')) {
      cfg.github.token = token.trim();
    }
  }
  if (owner !== undefined) cfg.github.owner = owner.trim();
  if (repo !== undefined) cfg.github.repo = repo.trim();
  if (branch !== undefined) cfg.github.branch = branch.trim() || 'main';

  saveAdminConfig(cfg);
  res.json({ success: true, message: 'Настройки GitHub сохранены' });
});

router.post('/github/test', authMiddleware, async (req, res) => {
  const { token: inputToken, owner: inputOwner, repo: inputRepo } = req.body || {};
  const cfg = getAdminConfig();
  const token = (inputToken && !inputToken.startsWith('ghp_...')) ? inputToken.trim() : cfg.github.token;
  const owner = (inputOwner || cfg.github.owner || '').trim();
  const repo = (inputRepo || cfg.github.repo || '').trim();

  if (!token) {
    return res.status(400).json({ success: false, error: 'GitHub Personal Access Token не указан' });
  }
  if (!owner || !repo) {
    return res.status(400).json({ success: false, error: 'Укажите владельца (Owner) и имя репозитория (Repo)' });
  }

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Tais-Show-Admin'
      }
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({
        success: false,
        error: `Ошибка GitHub (${resp.status}): ${errData.message || 'Репозиторий не найден или нет доступа'}`
      });
    }

    const repoData = await resp.json();
    res.json({
      success: true,
      message: `Подключение успешно! Репозиторий "${repoData.full_name}" доступен (${repoData.private ? 'Приватный' : 'Публичный'}).`,
      defaultBranch: repoData.default_branch,
      permissions: repoData.permissions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: `Сетевая ошибка при связи с GitHub: ${err.message}` });
  }
});

router.post('/publish', authMiddleware, async (req, res) => {
  const cfg = getAdminConfig();
  const token = cfg.github.token;
  const owner = cfg.github.owner;
  const repo = cfg.github.repo;
  const branch = cfg.github.branch || 'main';
  const customMessage = req.body?.commitMessage || `Обновление контента сайта [Admin Panel] — ${new Date().toLocaleString('ru-RU')}`;

  if (!token || !owner || !repo) {
    return res.json({
      success: true,
      localOnly: true,
      message: 'Изменения сохранены локально на сервере! Для автоматической публикации на GitHub укажите токен и репозиторий во вкладке "GitHub".'
    });
  }

  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Tais-Show-Admin'
    };

    // 1. Get branch reference
    const refResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    if (!refResp.ok) {
      const err = await refResp.json().catch(() => ({}));
      throw new Error(`Ветка "${branch}" не найдена в репозитории ${owner}/${repo}: ${err.message || refResp.statusText}`);
    }
    const refData = await refResp.json();
    const latestCommitSha = refData.object.sha;

    // 2. Get the commit to find its tree
    const commitResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
    const commitData = await commitResp.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Prepare files to commit
    const filesToSync = [
      'index.html',
      'seats.js',
      'style.css',
      'max_logo.svg',
      'page-transition.js',
      'admin.html',
      'admin/index.html',
      'admin-api.js',
      'admin-config.json'
    ];

    const treeItems = [];

    for (const relPath of filesToSync) {
      const fullPath = path.join(ROOT_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Create blob
        const blobResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: Buffer.from(content).toString('base64'),
            encoding: 'base64'
          })
        });
        if (!blobResp.ok) {
          const err = await blobResp.json().catch(() => ({}));
          if (blobResp.status === 403 || (err.message && err.message.includes('Resource not accessible'))) {
            throw new Error(`Токен GitHub не имеет прав на запись файлов в репозиторий ${owner}/${repo}. Для Fine-grained токена (github_pat_...) включите: 'Repository permissions' -> 'Contents' -> 'Read and write', либо создайте токен Classic с галочкой 'repo'.`);
          }
          throw new Error(`Ошибка загрузки файла ${relPath}: ${err.message || blobResp.statusText}`);
        }
        const blobData = await blobResp.json();
        treeItems.push({
          path: relPath,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        });
      }
    }

    // 4. Create new tree
    const treeResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems
      })
    });
    if (!treeResp.ok) {
      const err = await treeResp.json().catch(() => ({}));
      if (treeResp.status === 403) {
        throw new Error(`Токен GitHub не имеет прав на запись (403 Forbidden). Для токена ${owner}/${repo} необходимо разрешение 'Contents: Read and write' или scope 'repo'.`);
      }
      throw new Error(`Ошибка создания дерева Git: ${err.message || treeResp.statusText}`);
    }
    const treeData = await treeResp.json();
    const newTreeSha = treeData.sha;

    // 5. Create commit
    const newCommitResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: customMessage,
        tree: newTreeSha,
        parents: [latestCommitSha]
      })
    });
    if (!newCommitResp.ok) {
      const err = await newCommitResp.json().catch(() => ({}));
      throw new Error(`Ошибка создания коммита: ${err.message || newCommitResp.statusText}`);
    }
    const newCommitData = await newCommitResp.json();
    const newCommitSha = newCommitData.sha;

    // 6. Update branch reference to point to new commit
    const updateRefResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false
      })
    });

    if (!updateRefResp.ok) {
      const err = await updateRefResp.json().catch(() => ({}));
      throw new Error(`Ошибка обновления ветки: ${err.message || updateRefResp.statusText}`);
    }

    // Update config record
    cfg.github.lastCommitSha = newCommitSha.substring(0, 7);
    cfg.github.lastPublishedAt = new Date().toISOString();
    saveAdminConfig(cfg);

    res.json({
      success: true,
      commitSha: cfg.github.lastCommitSha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
      publishedAt: cfg.github.lastPublishedAt,
      message: `Успешно опубликовано! Коммит [${cfg.github.lastCommitSha}] отправлен в репозиторий GitHub.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
