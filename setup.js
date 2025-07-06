const fs = require('fs');

['uploads', 'downloads', 'logs'].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(`Created folder: ${dir}`);
    }
});
