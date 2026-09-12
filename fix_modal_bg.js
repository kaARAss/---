const fs = require('fs');
let js = fs.readFileSync('seats.js', 'utf8');

// replace the background styles
js = js.replace("eventTickets.style.backgroundImage = `linear-gradient(rgba(15,15,15,0.85), rgba(15,15,15,0.95)), url(${image})`;", "eventTickets.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';\n        eventTickets.style.backdropFilter = 'blur(10px)';\n        eventTickets.style.webkitBackdropFilter = 'blur(10px)';");
js = js.replace("eventTickets.style.backgroundSize = 'cover';", "");
js = js.replace("eventTickets.style.backgroundPosition = 'center';", "");
js = js.replace("eventTickets.style.backgroundColor = 'rgba(20, 20, 20, 0.95)';", "eventTickets.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';\n        eventTickets.style.backdropFilter = 'blur(10px)';\n        eventTickets.style.webkitBackdropFilter = 'blur(10px)';");

fs.writeFileSync('seats.js', js);
console.log('Fixed modal background to translucent blur');
