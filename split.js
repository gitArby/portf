const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const componentsDir = path.join(__dirname, 'components');

if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir);
}

let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Array of targets to extract
const targets = [
    { name: 'nav', startStr: '<nav class="main-nav" id="main-nav">', endStr: '</nav>' },
    { name: 'home', startStr: '<div id="home-view"', endStr: '</div>\n        <!-- About View -->' }, // Hacky end for div
    { name: 'about', startStr: '<section id="about-view"', endStr: '</section>' },
    { name: 'skills', startStr: '<section id="skills-view"', endStr: '</section>' },
    { name: 'certificates', startStr: '<section id="certificates-view"', endStr: '</section>' },
    { name: 'calculator', startStr: '<section id="calculator-view"', endStr: '</section>' },
    { name: 'experience', startStr: '<section id="experience-view"', endStr: '</section>' },
    { name: 'lol-stats', startStr: '<section id="lol-stats-view"', endStr: '</section>' },
    { name: 'games', startStr: '<section id="games-view"', endStr: '</section>' },
    { name: 'projects', startStr: '<section id="projects-view"', endStr: '</section>' },
    { name: 'ipsum', startStr: '<section id="ipsum-view"', endStr: '</section>' },
    { name: 'faq', startStr: '<section id="faq-view"', endStr: '</section>' },
    { name: 'contact', startStr: '<section id="contact-view"', endStr: '</section>' },
    { name: 'footer', startStr: '<footer class="footer">', endStr: '</footer>' }
];

targets.forEach(target => {
    const startIndex = html.indexOf(target.startStr);
    if (startIndex === -1) {
        console.warn(`Could not find start string for ${target.name}`);
        return;
    }
    
    // For div#home-view we use a specific hacky end, for others just the next closing tag matching the start tag type
    let endIndex;
    if (target.name === 'home') {
        endIndex = html.indexOf('<!-- About View -->', startIndex);
        if (endIndex !== -1) {
            // Include closing div
            const chunk = html.substring(startIndex, endIndex).trim();
            html = html.substring(0, startIndex) + `        <load src="./components/${target.name}.html" />\n        ` + html.substring(endIndex);
            fs.writeFileSync(path.join(componentsDir, `${target.name}.html`), chunk, 'utf8');
            return;
        }
    } else {
        endIndex = html.indexOf(target.endStr, startIndex) + target.endStr.length;
    }

    if (endIndex < target.endStr.length) {
        console.warn(`Could not find end string for ${target.name}`);
        return;
    }

    const chunk = html.substring(startIndex, endIndex);
    
    // Replace in original HTML
    const replacement = `        <load src="./components/${target.name}.html" />`;
    html = html.substring(0, startIndex) + replacement + html.substring(endIndex);

    fs.writeFileSync(path.join(componentsDir, `${target.name}.html`), chunk, 'utf8');
    console.log(`Extracted ${target.name}.html`);
});

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Split successful.');
