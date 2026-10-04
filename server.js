const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024
}));

const blockDir = path.join(__dirname, 'img/block');
if (!fs.existsSync(blockDir)) {
  fs.mkdirSync(blockDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, blockDir);
  },
  filename: function (req, file, cb) {
    const baseName = path.basename(file.originalname);
    cb(null, baseName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(blockDir).map(file => {
      const stat = fs.statSync(path.join(blockDir, file));
      return {
        name: file,
        size: stat.size,
        modified: stat.mtime
      };
    });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/upload', upload.array('files', 20), (req, res) => {
  const uploaded = req.files || [];
  const results = [];

  for (const file of uploaded) {
    const filePath = file.path;
    const fileName = file.filename;
    
    const rootPath = path.join(__dirname, fileName);
    try {
      if (!fs.existsSync(rootPath)) {
        fs.symlinkSync(path.join('img/block', fileName), rootPath);
      }
    } catch (e) {}

    if (fileName.toLowerCase().endsWith('.mp4')) {
      const thumbName = fileName.replace(/\.mp4$/i, '_thumb.jpg');
      const thumbPath = path.join(blockDir, thumbName);
      exec(`ffmpeg -ss 00:00:02 -i "${filePath}" -vframes 1 -q:v 2 "${thumbPath}" -y`, (err) => {
        if (!err) {
          try {
            const rootThumb = path.join(__dirname, thumbName);
            if (!fs.existsSync(rootThumb)) {
              fs.symlinkSync(path.join('img/block', thumbName), rootThumb);
            }
            // Also create shortened alias e.g. show7_v1_thumb.jpg from show7_video1_thumb.jpg
            const shortThumbName = thumbName.replace(/video(\d+)/i, 'v$1');
            if (shortThumbName !== thumbName) {
              const shortThumbPath = path.join(blockDir, shortThumbName);
              if (!fs.existsSync(shortThumbPath)) {
                fs.copyFileSync(thumbPath, shortThumbPath);
              }
              const rootShortThumb = path.join(__dirname, shortThumbName);
              if (!fs.existsSync(rootShortThumb)) {
                fs.symlinkSync(path.join('img/block', shortThumbName), rootShortThumb);
              }
            }
          } catch (e) {}
        }
      });
    }

    results.push({
      name: fileName,
      size: file.size,
      status: 'uploaded'
    });
  }

  res.json({ success: true, files: results });
});

// Fallback resolver for media assets in img/block or root directory
app.use('/img/block', (req, res, next) => {
  const blockFile = path.join(blockDir, req.path);
  if (!fs.existsSync(blockFile)) {
    const rootFile = path.join(__dirname, req.path);
    if (fs.existsSync(rootFile) && fs.statSync(rootFile).isFile()) {
      return res.sendFile(rootFile);
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, '.'), {
  setHeaders: (res, pathStr) => {
    if (pathStr.endsWith('.html') || pathStr === path.join(__dirname, '.')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (pathStr.match(/\.(webp|jpg|jpeg|png|gif|svg|woff2|woff|ttf|mp4)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    } else if (pathStr.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
