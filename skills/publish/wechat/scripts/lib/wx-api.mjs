/**
 * 微信公众号 API 纯 Node 封装（零第三方依赖）
 * 源自 wechat-auto-publishing templates/publish.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { basename, extname, isAbsolute, join, resolve } from 'path';

export const WX_API = 'https://api.weixin.qq.com';

/** 清除代理，避免绕开微信 IP 白名单 */
export function clearProxyEnv() {
  for (const k of [
    'http_proxy',
    'https_proxy',
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'all_proxy',
    'ALL_PROXY',
  ]) {
    delete process.env[k];
  }
}

export function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

/**
 * 按优先级合并凭证：process.env > 显式 env 文件列表
 * @param {string[]} envPaths
 */
export function resolveWechatCredentials(envPaths = []) {
  const fromProc = {
    appId: process.env.WECHAT_APP_ID?.trim() || '',
    appSecret: process.env.WECHAT_APP_SECRET?.trim() || '',
  };
  if (fromProc.appId && fromProc.appSecret) {
    return { ...fromProc, source: 'process.env' };
  }

  for (const p of envPaths) {
    if (!p || !existsSync(p)) continue;
    const fileEnv = loadEnvFile(p);
    const appId = fileEnv.WECHAT_APP_ID?.trim() || '';
    const appSecret = fileEnv.WECHAT_APP_SECRET?.trim() || '';
    if (appId && appSecret) {
      return { appId, appSecret, source: p };
    }
  }

  return { appId: '', appSecret: '', source: '' };
}

export function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

export function markdownToHtml(md) {
  let html = md;

  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />',
  );

  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(
    /^##\s+(.+)$/gm,
    '<h2 style="margin-top:1.5em;margin-bottom:0.5em;font-size:18px;font-weight:bold;border-left:4px solid #1e90ff;padding-left:10px;">$1</h2>',
  );
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (
      /^<(h[1-6]|ul|ol|li|img|blockquote|pre|code|hr|div|table|p)/.test(trimmed)
    ) {
      result.push(trimmed);
    } else {
      result.push(`<p style="margin-bottom:1em;line-height:1.8;">${trimmed}</p>`);
    }
  }

  return result.filter((l) => l !== '').join('\n');
}

function buildMultipart(fields, files) {
  const boundary = '----NodeFormBoundary' + Math.random().toString(36).slice(2);
  const parts = [];

  for (const { name, value } of fields || []) {
    parts.push(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`,
    );
  }

  for (const { name, filename, contentType, data } of files || []) {
    const header =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`;
    parts.push({ header, data });
  }

  const buffers = [];
  for (const part of parts) {
    if (typeof part === 'string') {
      buffers.push(Buffer.from(part, 'utf-8'));
    } else {
      buffers.push(Buffer.from(part.header, 'utf-8'));
      buffers.push(Buffer.isBuffer(part.data) ? part.data : Buffer.from(part.data));
      buffers.push(Buffer.from('\r\n', 'utf-8'));
    }
  }
  buffers.push(Buffer.from(`--${boundary}--\r\n`, 'utf-8'));

  return {
    body: Buffer.concat(buffers),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/** 校验真实图片魔数，不信任扩展名 alone */
export function detectImageFormat(filePath) {
  const buf = readFileSync(filePath);
  if (buf.length < 12) return { ok: false, reason: 'file too small' };

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ok: true, ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { ok: true, ext: 'png', mime: 'image/png' };
  }
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) {
    return { ok: true, ext: 'gif', mime: 'image/gif' };
  }
  // WEBP: RIFF....WEBP
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { ok: true, ext: 'webp', mime: 'image/webp' };
  }
  // HEIF / HEIC often starts with ftyp
  const brand = buf.toString('ascii', 4, 8);
  if (brand === 'ftyp') {
    return {
      ok: false,
      reason: 'HEIF/HEIC 不被微信草稿 API 接受，请转为 PNG/JPEG',
    };
  }
  return { ok: false, reason: '未知或不受支持的图片格式' };
}

export async function wxFetch(url, options = {}) {
  console.log(`  -> ${options.method || 'GET'} ${url.split('?')[0]}`);
  const resp = await fetch(url, options);
  const data = await resp.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`微信 API 错误: ${data.errcode} - ${data.errmsg}`);
  }
  return data;
}

export async function getAccessToken(appId, appSecret) {
  const url = `${WX_API}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const data = await wxFetch(url);
  return data.access_token;
}

export async function uploadCoverMaterial(token, coverPath) {
  const format = detectImageFormat(coverPath);
  if (!format.ok) {
    throw new Error(`封面图无效 (${coverPath}): ${format.reason}`);
  }
  const fileData = readFileSync(coverPath);
  const { body, contentType: ct } = buildMultipart(
    [{ name: 'type', value: 'image' }],
    [
      {
        name: 'media',
        filename: `cover.${format.ext}`,
        contentType: format.mime,
        data: fileData,
      },
    ],
  );

  const url = `${WX_API}/cgi-bin/material/add_material?access_token=${token}&type=image`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': ct },
    body,
  });
  return data.media_id;
}

export async function uploadContentImage(token, imagePath) {
  const format = detectImageFormat(imagePath);
  if (!format.ok) {
    throw new Error(`正文图无效 (${imagePath}): ${format.reason}`);
  }
  const fileData = readFileSync(imagePath);
  const filename = `${basename(imagePath, extname(imagePath))}.${format.ext}`;
  const { body, contentType: ct } = buildMultipart(
    [],
    [{ name: 'media', filename, contentType: format.mime, data: fileData }],
  );

  const url = `${WX_API}/cgi-bin/media/uploadimg?access_token=${token}`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': ct },
    body,
  });
  return data.url;
}

/**
 * 解析正文中的本地图片引用并上传替换
 * 支持 ./foo.jpg、foo.jpg、绝对路径
 */
export async function processArticleBody(token, body, articleDir) {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const locals = new Set();
  let match;
  while ((match = imgRegex.exec(body)) !== null) {
    const src = match[2].trim();
    if (/^https?:\/\//i.test(src)) continue;
    locals.add(src);
  }

  const imageUrlMap = {};
  for (const src of locals) {
    const imgPath = isAbsolute(src)
      ? src
      : resolve(articleDir, src.replace(/^\.\//, ''));
    if (!existsSync(imgPath)) {
      console.log(`  警告: 图片不存在 ${src}，跳过`);
      continue;
    }
    console.log(`  上传正文图: ${imgPath}`);
    const wxUrl = await uploadContentImage(token, imgPath);
    imageUrlMap[src] = wxUrl;
  }

  let processed = body;
  for (const [local, wxUrl] of Object.entries(imageUrlMap)) {
    processed = processed.split(local).join(wxUrl);
  }

  return {
    htmlContent: markdownToHtml(processed),
    uploadedImages: Object.keys(imageUrlMap).length,
  };
}

export async function createDraft(token, {
  title,
  content,
  digest,
  author,
  thumbMediaId,
}) {
  const url = `${WX_API}/cgi-bin/draft/add?access_token=${token}`;
  const article = {
    title,
    author: author || '',
    digest: digest || '',
    content,
    thumb_media_id: thumbMediaId,
    need_open_comment: 0,
    only_fans_can_comment: 0,
  };

  return wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] }),
  });
}

export async function freePublish(token, mediaId, { poll = true } = {}) {
  const url = `${WX_API}/cgi-bin/freepublish/submit?access_token=${token}`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_id: mediaId }),
  });
  const publishId = data.publish_id;

  if (!poll) {
    return { publish_id: publishId, publish_status: -2 };
  }

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusUrl = `${WX_API}/cgi-bin/freepublish/get?access_token=${token}`;
    const statusData = await wxFetch(statusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const status = statusData.publish_status;
    console.log(`  第${i + 1}次查询: publish_status=${status}`);
    if (status === 0) {
      const articleId = statusData.article_id;
      const articleUrl =
        statusData.article_detail?.item?.[0]?.article_url || '';
      return {
        publish_id: publishId,
        article_id: articleId,
        article_url: articleUrl,
        publish_status: 0,
      };
    }
    if (status === 2) {
      return {
        publish_id: publishId,
        article_id: statusData.article_id,
        article_url: '',
        publish_status: 2,
      };
    }
    if (status === 1) continue;
    return { publish_id: publishId, publish_status: status };
  }

  return { publish_id: publishId, publish_status: -1 };
}

export function resolveCoverPath(metaCover, articleDir, explicitCover) {
  if (explicitCover) return resolve(explicitCover);
  if (metaCover) {
    const p = isAbsolute(metaCover)
      ? metaCover
      : resolve(articleDir, metaCover.replace(/^\.\//, ''));
    if (existsSync(p)) return p;
  }
  for (const name of ['cover.png', 'cover.jpg', 'cover.jpeg']) {
    const p = join(articleDir, name);
    if (existsSync(p)) return p;
  }
  return '';
}
