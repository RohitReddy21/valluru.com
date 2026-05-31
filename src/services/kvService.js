// Vercel KV Service Module
// This module communicates with API routes to store/retrieve data

const API_BASE = '/api/cms';

// Save site content to Vercel KV
export async function saveSiteContentToKV(content) {
  try {
    const response = await fetch(`${API_BASE}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (!response.ok) throw new Error('Failed to save content');
    console.log('Content saved to Vercel KV');
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
    return false;
  }
}

// Load site content from Vercel KV
export async function loadSiteContentFromKV() {
  try {
    const response = await fetch(`${API_BASE}/content`);
    if (!response.ok) return null;
    const data = await response.json();
    console.log('Content loaded from Vercel KV');
    return data;
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
}

// Save theme to Vercel KV
export async function saveThemeToKV(theme) {
  try {
    const response = await fetch(`${API_BASE}/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    if (!response.ok) throw new Error('Failed to save theme');
    console.log('Theme saved to Vercel KV');
    return true;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
}

// Load theme from Vercel KV
export async function loadThemeFromKV() {
  try {
    const response = await fetch(`${API_BASE}/theme`);
    if (!response.ok) return null;
    const data = await response.json();
    console.log('Theme loaded from Vercel KV');
    return data;
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}
