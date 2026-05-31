// Upstash Redis Service Module
// Uses Upstash REST API for storing/retrieving data

const UPSTASH_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

async function makeUpstashRequest(command, key, value = null) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn('Upstash credentials not configured');
    return null;
  }

  try {
    const body = value 
      ? [command, key, JSON.stringify(value)]
      : [command, key];

    const response = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Upstash request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Upstash error:', error);
    return null;
  }
}

// Save site content to Upstash
export async function saveSiteContentToUpstash(content) {
  try {
    const result = await makeUpstashRequest('SET', 'cms:content', content);
    if (result) {
      console.log('Content saved to Upstash');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving content:', error);
    return false;
  }
}

// Load site content from Upstash
export async function loadSiteContentFromUpstash() {
  try {
    const result = await makeUpstashRequest('GET', 'cms:content');
    if (result) {
      console.log('Content loaded from Upstash');
      return JSON.parse(result);
    }
    return null;
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
}

// Save theme to Upstash
export async function saveThemeToUpstash(theme) {
  try {
    const result = await makeUpstashRequest('SET', 'cms:theme', theme);
    if (result) {
      console.log('Theme saved to Upstash');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
}

// Load theme from Upstash
export async function loadThemeFromUpstash() {
  try {
    const result = await makeUpstashRequest('GET', 'cms:theme');
    if (result) {
      console.log('Theme loaded from Upstash');
      return JSON.parse(result);
    }
    return null;
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}
