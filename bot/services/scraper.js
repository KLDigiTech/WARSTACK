// ============================================
// SERVICE — scraper.js
// Scrape les stats BF6 depuis tracker.gg
// avec Puppeteer (bypass anti-bot)
// ============================================

const puppeteer = require('puppeteer');

async function scrapeTrackerGG(profileUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Simule un vrai navigateur
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🌐 Chargement du profil...');
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Attendre que les stats se chargent
    await page.waitForSelector('.stat', { timeout: 10000 }).catch(() => {
      console.log('Sélecteur .stat non trouvé, on continue...');
    });

    // Capture tout le texte de la page pour analyser
    const content = await page.evaluate(() => {
      const stats = {};
      
      // Cherche tous les éléments avec des stats
      document.querySelectorAll('[class*="stat"]').forEach(el => {
        const label = el.querySelector('[class*="label"]')?.textContent?.trim();
        const value = el.querySelector('[class*="value"]')?.textContent?.trim();
        if (label && value) stats[label] = value;
      });

      return stats;
    });

    console.log('Stats trouvées:', content);
    return content;

  } catch (error) {
    console.error('❌ Puppeteer error:', error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeTrackerGG };