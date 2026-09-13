const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Remove the button HTML
html = html.replace(/<div id="scrollToTopBtn"[\s\S]*?<\/div>/, '');

// Remove the script tag
html = html.replace(/<script src="\.\/scroll-button\.js"><\/script>/, '');

fs.writeFileSync('index.html', html);
console.log('Scroll to top button removed.');
