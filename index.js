import * as cheerio from 'cheerio';

const TORBOX_API_KEY = process.env.TORBOX_API_KEY;
const FORUM_URL = 'https://www.1tamilmv.style/index.php?/forums/topic/199652-bigg-boss-tamil-2026-s010-ep51-day-50-true-web-dl-1080p-720p-480p-avc-untouched-25gb-1gb-450mb/';
const SESSION_COOKIE = process.env.SESSION_COOKIE;

async function syncToTorBox() {
  try {
    console.log('Fetching TamilMV forum thread...');
    
    const response = await fetch(FORUM_URL, {
      headers: {
        'Cookie': SESSION_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch forum page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let targetMagnet = '';
    $('a[href^="magnet:?"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('1080p')) {
        targetMagnet = href;
        return false;
      }
    });

    if (!targetMagnet) {
      console.log('No 1080p magnet link found on the page yet.');
      return;
    }

    console.log('Found Magnet Link:', targetMagnet);

    const formData = new FormData();
    formData.append('magnet', targetMagnet);
    formData.append('name', 'Bigg Boss Tamil 2026 1080p');
    formData.append('seed', '1');

    console.log('Sending magnet to TorBox...');
    const torboxResponse = await fetch('https://api.torbox.app/v1/api/torrents/createtorrent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TORBOX_API_KEY}`
      },
      body: formData
    });

    const result = await torboxResponse.json();
    
    if (result.success) {
      console.log('Successfully added torrent to TorBox:', result.detail);
    } else {
      console.error('TorBox API Error:', result.detail || result);
    }

  } catch (error) {
    console.error('Execution error:', error.message);
  }
}

syncToTorBox();
