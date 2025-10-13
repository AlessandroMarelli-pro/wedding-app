/**
 * Utility functions for handling page revalidation and cache invalidation
 */

/**
 * Manually trigger revalidation of the home page
 * This can be called from the admin panel after making updates
 */
export async function triggerHomePageRevalidation(): Promise<boolean> {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/' }),
    });

    if (response.ok) {
      console.log('Home page revalidation triggered successfully');
      return true;
    } else {
      console.error('Failed to trigger revalidation:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    return false;
  }
}

/**
 * Force refresh the current page to show updated data
 * This is a fallback when revalidation doesn't work immediately
 */
export function forcePageRefresh(): void {
  if (typeof window !== 'undefined') {
    // Add a cache-busting parameter to force a fresh load
    const url = new URL(window.location.href);
    url.searchParams.set('_t', Date.now().toString());
    window.location.href = url.toString();
  }
}

/**
 * Show a notification to the user that the page will refresh to show updates
 */
export function showUpdateNotification(): void {
  if (typeof window !== 'undefined') {
    // You can customize this notification based on your UI framework
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      ">
        ✅ Updates saved! Refreshing page to show changes...
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}
