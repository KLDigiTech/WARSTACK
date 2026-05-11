// ============================================
// SERVICE — scraper.js
// Scrape les stats BF6 depuis tracker.gg
// ============================================

const puppeteer = require('puppeteer');

async function scrapeTrackerGG(platform, identifier) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://tracker.gg/bf6/profile/1023163556057/overview`;
    console.log(`🌐 Scraping: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Attendre que les stats soient présentes
    await page.waitForFunction(() => {
      const els = document.querySelectorAll('span, div');
      for (const el of els) {
        if (el.textContent.trim() === 'Player K/D') return true;
      }
      return false;
    }, { timeout: 15000 });

    const stats = await page.evaluate(() => {
      const result = {};

      // Cherche un label et retourne la valeur associée
      function getStatValue(label) {
        const allEls = Array.from(document.querySelectorAll('span, div, p'));
        for (const el of allEls) {
          if (el.children.length === 0 && el.textContent.trim() === label) {
            // Remonte au parent et cherche un élément frère avec la valeur
            const parent = el.parentElement;
            if (!parent) continue;
            const grandParent = parent.parentElement;
            if (!grandParent) continue;

            // Cherche dans les enfants du parent ou grand-parent
            const candidates = Array.from(grandParent.querySelectorAll('span, div, p'));
            for (const c of candidates) {
              const text = c.textContent.trim();
              if (c.children.length === 0 && text && text !== label && /^[\d,\.%]+$/.test(text.replace(/[hm\s]/g, ''))) {
                return text;
              }
            }
          }
        }
        return null;
      }

      result['kd'] = getStatValue('Player K/D');
      result['kills'] = getStatValue('Player Kills');
      result['deaths'] = getStatValue('Deaths');
      result['wins'] = getStatValue('Wins');
      result['games'] = getStatValue('Matches Played');
      result['winrate'] = getStatValue('Win %');
      result['playtime'] = getStatValue('Time Played');

      return result;
    });

    console.log('Stats extraites:', stats);

    return {
      pseudo: identifier,
      kills: parseFloat(String(stats.kills || '0').replace(/,/g, '')) || 0,
      deaths: parseFloat(String(stats.deaths || '0').replace(/,/g, '')) || 0,
      kd: parseFloat(stats.kd || '0') || 0,
      wins: parseFloat(String(stats.wins || '0').replace(/,/g, '')) || 0,
      games: parseFloat(String(stats.games || '0').replace(/,/g, '')) || 0,
      playtime: stats.playtime || '0h',
      winrate: stats.winrate || '0%',
      source: 'tracker.gg'
    };

  } catch (error) {
    console.error('❌ Scraper error:', error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeTrackerGG };