const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const componentsDir = path.join(__dirname, 'components');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

const views = [
    { name: 'about', startMatch: '<!-- About View -->' },
    { name: 'skills', startMatch: '<!-- Skills View -->' },
    { name: 'certificates', startMatch: '<!-- Certificates View -->' },
    { name: 'calculator', startMatch: '<!-- Calculator View -->' },
    { name: 'experience', startMatch: '<!-- Experience View -->' },
    { name: 'lol-stats', startMatch: '<!-- LoL Stats View -->' },
    { name: 'games', startMatch: '<!-- Games View -->' },
    { name: 'projects', startMatch: '<!-- Projects View -->' },
    { name: 'ipsum', startMatch: '<!-- Ipsum View -->' },
    { name: 'faq', startMatch: '<!-- FAQ View -->' },
    { name: 'contact', startMatch: '<!-- Contact View -->' },
    { name: 'footer', startMatch: '<footer class="footer">' }
];

for (let i = 0; i < views.length; i++) {
    const view = views[i];
    const startIndex = html.indexOf(view.startMatch);
    if (startIndex === -1) {
        console.warn(`Could not find ${view.startMatch}`);
        continue;
    }
    
    let endIndex;
    if (i < views.length - 1) {
        endIndex = html.indexOf(views[i + 1].startMatch, startIndex);
    } else {
        // for footer
        endIndex = html.indexOf('</footer>', startIndex) + 9;
    }

    if (endIndex === -1) {
        if (view.name !== 'footer') {
            endIndex = html.indexOf('</main>', startIndex);
        }
    }

    if (endIndex === -1) {
        console.warn(`Could not find end for ${view.name}`);
        continue;
    }

    const chunk = html.substring(startIndex, endIndex);
    
    // Replace in HTML
    const replacement = `        <load src="./components/${view.name}.html" />\n`;
    html = html.substring(0, startIndex) + replacement + html.substring(endIndex);

    fs.writeFileSync(path.join(componentsDir, `${view.name}.html`), chunk, 'utf8');
    console.log(`Extracted ${view.name}.html`);
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Split 2 successful.');
