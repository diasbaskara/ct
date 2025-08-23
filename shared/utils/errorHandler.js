export function handleError(error, responseArea) {
  // Remove console.error for production
  
  let errorHtml;
  
  if (error.message.includes('Authorization Token not found')) {
    errorHtml = `
      <div class="ct-error-container">
        <h3>Authentication Error</h3>
        <p class="ct-error-subtitle">Please reload the page to log in again.</p>
        <button id="auth-reload-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload Page</button>
      </div>`;
  } else {
    errorHtml = `<p class="ct-error-message"><b>An error occurred:</b><br>${error.message}</p>`;
  }
  
  responseArea.innerHTML = errorHtml;
  
  const reloadBtn = responseArea.querySelector('#auth-reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => window.location.reload());
  }
}