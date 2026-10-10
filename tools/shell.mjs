// tools/shell.mjs
// Dựng khung trang mới (head + sprite + header + bản tin + footer) từ lich-hoi-nghi.html.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(fileURLToPath(new URL('../site/lich-hoi-nghi.html', import.meta.url)), 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const pageShell = ({ title, description, css = [], scripts = [], main = '<main><!--MAIN--></main>' }) => {
    const mainAt = SRC.indexOf('<main');
    const mainEnd = SRC.indexOf('</main>') + '</main>'.length;
    const footEnd = SRC.indexOf('</footer>') + '</footer>'.length;
    const head = SRC.slice(0, mainAt)
        .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)} | UIT ConFinder</title>`)
        .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(description)}">`)
        .replace(/\s*<link rel="stylesheet" href="css\/(?:states|pages)\.css">/g, '')
        .replace(/\s*<script src="js\/[^"]+"><\/script>/g, '')
        .replace('<link rel="stylesheet" href="css/conference.css">', () =>
            ['conference', ...css].map(c => `<link rel="stylesheet" href="css/${c}.css">`).join('\n    '));
    const tail = SRC.slice(mainEnd, footEnd);
    const scriptTags = scripts.map(s => `<script src="js/${s}.js"></script>`).join('\n');
    return `${head}${main}${tail}\n${scriptTags}\n</body>\n</html>\n`;
};
