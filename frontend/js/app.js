document.addEventListener('DOMContentLoaded', () => {
  const frontendStatus = document.querySelector('#frontend-status');

  if (frontendStatus) {
    frontendStatus.textContent = 'Frontend JavaScript loaded.';
  }
});