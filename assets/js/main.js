// Mendorbit - Official Interactive Scripts & Auto-Update Engine (v1.0.0)
const CURRENT_APP_VERSION = "1.0.0";

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  // 2. Batch Filter Tabs
  const filterBtns = document.querySelectorAll('.batch-filter-btn');
  const batchCards = document.querySelectorAll('.batch-card-item');

  if (filterBtns.length > 0 && batchCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset classes
        filterBtns.forEach(b => {
          b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
          b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
        });

        // Set active class
        btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
        btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');

        const filter = btn.getAttribute('data-filter');

        batchCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. FAQ Accordion Logic
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('.faq-icon');
      
      const isOpen = !content.classList.contains('hidden');
      
      // Close all other FAQs in the same group
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });

  // 4. Instant Update & Cache-Buster Engine
  // Checks version.json every 60 seconds or on tab focus without requiring hard refresh
  function checkForUpdates() {
    fetch('version.json?nocache=' + new Date().getTime(), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    .then(response => {
      if (!response.ok) return null;
      return response.json();
    })
    .then(data => {
      if (data && data.version && data.version !== CURRENT_APP_VERSION) {
        showUpdateNotification(data.version);
      }
    })
    .catch(() => {
      // Ignore network errors silently
    });
  }

  function showUpdateNotification(newVersion) {
    if (document.getElementById('update-toast')) return;

    const toast = document.createElement('div');
    toast.id = 'update-toast';
    toast.className = 'bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-sm';
    toast.innerHTML = `
      <div class="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
      </div>
      <div class="flex-grow text-xs">
        <p class="font-bold text-white text-sm">New Update Live!</p>
        <p class="text-slate-300">New batch & study updates available.</p>
      </div>
      <button id="update-reload-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex-shrink-0">
        Update Now
      </button>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    document.getElementById('update-reload-btn').addEventListener('click', () => {
      window.location.reload(true);
    });
  }

  // Check on tab focus and periodically
  window.addEventListener('focus', checkForUpdates);
  setInterval(checkForUpdates, 90000); // Check every 90 seconds
});
