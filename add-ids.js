const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let counter = 1;
const updatedHtml = html.replace(/<([a-zA-Z0-9]+)([^>]*?)>/g, (match, tag, attrs) => {
    // Skip closing tags or self-closing parts alone (already handled by regex capturing the start tag)
    // Ignore script, style, meta, link, head, html, iframe, br, hr
    const ignoredTags = ['html', 'head', 'meta', 'link', 'script', 'style', 'br', 'hr', 'iframe', 'svg', 'path'];
    if (ignoredTags.includes(tag.toLowerCase())) return match;
    
    // If it already has an ID, skip
    if (/ id=["']/.test(attrs)) return match;

    // Generate an ID
    const newId = `el-${tag.toLowerCase()}-${counter++}`;
    
    // Add the ID
    return `<${tag} id="${newId}"${attrs}>`;
});

fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log('Added IDs. Total added:', counter - 1);
