// Mendorbit - Official Interactive Scripts & Theme Engine (v1.2.5)
const CURRENT_APP_VERSION = "1.2.5";

// Theme Switcher Logic (Apple-Style iOS Switch with System Auto-Detection)
function initTheme() {
  const isDarkMode = localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  updateToggleUI(isDarkMode);

  // Listen for system theme changes if user has not explicitly chosen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!('theme' in localStorage)) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateToggleUI(e.matches);
    }
  });
}

function updateToggleUI(isDark) {
  const toggleThumbs = document.querySelectorAll('.apple-theme-thumb');
  toggleThumbs.forEach(thumb => {
    const sunIcon = thumb.querySelector('[data-theme-icon="sun"]');
    const moonIcon = thumb.querySelector('[data-theme-icon="moon"]');
    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    } else {
      if (isDark) {
        thumb.innerHTML = '<i data-lucide="moon" class="w-3.5 h-3.5 text-indigo-400"></i>';
      } else {
        thumb.innerHTML = '<i data-lucide="sun" class="w-3.5 h-3.5 text-amber-500"></i>';
      }
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    }
  });
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  if (isCurrentlyDark) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
    updateToggleUI(false);
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
    updateToggleUI(true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme & Bind Toggle Buttons
  initTheme();
  const themeToggleBtns = document.querySelectorAll('.apple-theme-toggle');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // 2. Set dynamic version in footer across all pages
  const versionElements = document.querySelectorAll('.app-version-display');
  versionElements.forEach(el => {
    el.textContent = `v${CURRENT_APP_VERSION}`;
  });

  // 3. Mobile Menu Toggle
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

  // 4. Batch Filter Tabs
  const filterBtns = document.querySelectorAll('.batch-filter-btn');
  const batchCards = document.querySelectorAll('.batch-card-item');

  if (filterBtns.length > 0 && batchCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
          b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'dark:bg-slate-800', 'dark:text-slate-300');
        });

        btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
        btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'dark:bg-slate-800', 'dark:text-slate-300');

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

  // 5. FAQ Accordion Logic
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('.faq-icon');
      
      const isOpen = !content.classList.contains('hidden');
      
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });

  // 6. Apple-Design One-Click Update Engine (Shows once per release; never annoys on repeat)
  function initAppleUpdateEngine() {
    fetch('version.json?nocache=' + Date.now(), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (!data || !data.version) return;
      
      const serverVersion = data.version;
      const acknowledgedVersion = localStorage.getItem('mendorbit_acknowledged_version');

      // If user hasn't acknowledged this specific version yet
      if (acknowledgedVersion !== serverVersion) {
        showAppleUpdateBanner(serverVersion, data.releaseNotes || 'Fresh improvements and performance upgrades are live.');
      }
    })
    .catch(() => {});
  }

  function showAppleUpdateBanner(newVersion, notes) {
    if (document.getElementById('apple-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'apple-update-banner';
    banner.innerHTML = `
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
          <i data-lucide="sparkles" class="w-5 h-5 text-amber-300"></i>
        </div>
        <div class="flex-grow min-w-0 pr-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">New Update</span>
            <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">v${newVersion}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">Site Update Available</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">${notes}</p>
          <div class="mt-3 flex items-center gap-2.5">
            <button id="apple-update-btn" class="bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-full transition shadow-md active:scale-95 flex items-center gap-1.5">
              <span>Update Now</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
            <button id="apple-dismiss-btn" class="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-full transition">
              Later
            </button>
          </div>
        </div>
        <button id="apple-close-btn" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full -mt-1 -mr-1" aria-label="Close">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    document.body.appendChild(banner);
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ root: banner });
    }

    setTimeout(() => {
      banner.classList.add('show');
    }, 800);

    const updateBtn = banner.querySelector('#apple-update-btn');
    const dismissBtn = banner.querySelector('#apple-dismiss-btn');
    const closeBtn = banner.querySelector('#apple-close-btn');

    updateBtn.addEventListener('click', () => {
      updateBtn.innerHTML = `<span>Updating...</span>`;
      localStorage.setItem('mendorbit_acknowledged_version', newVersion);
      setTimeout(() => {
        window.location.reload(true);
      }, 250);
    });

    const dismissHandler = () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
    };

    if (dismissBtn) dismissBtn.addEventListener('click', dismissHandler);
    if (closeBtn) closeBtn.addEventListener('click', dismissHandler);
  }

  // 7. Notification System with Unread Badge & Apple-Style Dropdown
  const DEFAULT_NOTIFICATIONS = [
    {
      id: "notif-1",
      title: "Aarambh 10th Board Batch Live",
      message: "Class 10 CBSE Math & Science foundation sessions are now streaming daily on YouTube.",
      time: "Just now",
      link: "batches.html#class-10",
      badge: "Batch"
    },
    {
      id: "notif-2",
      title: "Free Maths Formula Sheet Ready",
      message: "Complete 4-page Class 10 revision cheat sheet is available for free download.",
      time: "2 hours ago",
      link: "notes.html",
      badge: "Notes"
    },
    {
      id: "notif-3",
      title: "SSC CGL 2026 Strategy Roadmap",
      message: "Zero-to-hero blueprint published for beginners and non-math background students.",
      time: "1 day ago",
      link: "blog.html",
      badge: "Guide"
    }
  ];

  function getReadNotificationIds() {
    try {
      return JSON.parse(localStorage.getItem('mendorbit_read_notifications') || '[]');
    } catch {
      return [];
    }
  }

  function saveReadNotificationIds(ids) {
    localStorage.setItem('mendorbit_read_notifications', JSON.stringify(ids));
  }

  function initNotificationEngine() {
    fetch('notifications.json?nocache=' + Date.now())
      .then(res => res.ok ? res.json() : DEFAULT_NOTIFICATIONS)
      .then(items => renderNotifications(items))
      .catch(() => renderNotifications(DEFAULT_NOTIFICATIONS));

    // Bind dropdown click handlers
    const wrappers = document.querySelectorAll('.notification-wrapper');
    wrappers.forEach(wrapper => {
      const btn = wrapper.querySelector('.notification-bell-btn');
      const panel = wrapper.querySelector('.notification-dropdown-panel');
      if (btn && panel) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = panel.classList.contains('hidden');
          document.querySelectorAll('.notification-dropdown-panel').forEach(p => p.classList.add('hidden'));
          if (isHidden) {
            panel.classList.remove('hidden');
          }
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notification-wrapper')) {
        document.querySelectorAll('.notification-dropdown-panel').forEach(p => p.classList.add('hidden'));
      }
    });
  }

  function renderNotifications(items) {
    const readIds = getReadNotificationIds();
    const unreadItems = items.filter(n => !readIds.includes(n.id));
    const unreadCount = unreadItems.length;

    // 1. Update all badge pills
    const badges = document.querySelectorAll('.notification-badge-pill');
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.textContent = '0';
        badge.classList.add('hidden');
      }
    });

    // 2. Render all dropdown lists
    const lists = document.querySelectorAll('.notification-dropdown-list');
    lists.forEach(list => {
      if (items.length === 0) {
        list.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-500">
            <p class="font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
            <p class="mt-1">All new batch updates & announcements will appear here.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = items.map(n => {
        const isUnread = !readIds.includes(n.id);
        return `
          <a href="${n.link}" data-id="${n.id}" class="notification-item block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${isUnread ? 'bg-blue-50/40 dark:bg-slate-800/30' : ''}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5">
                ${isUnread ? '<span class="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"></span>' : ''}
                <span class="text-xs font-bold text-slate-900 dark:text-white leading-tight">${n.title}</span>
              </div>
              <span class="text-[10px] font-semibold text-slate-400 flex-shrink-0">${n.time}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">${n.message}</p>
            <span class="inline-block mt-1.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">${n.badge}</span>
          </a>
        `;
      }).join('');
    });

    // 3. Mark individual item as read on click
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          const currentRead = getReadNotificationIds();
          if (!currentRead.includes(id)) {
            currentRead.push(id);
            saveReadNotificationIds(currentRead);
          }
        }
      });
    });

    // 4. Mark all as read button
    document.querySelectorAll('.mark-all-read-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const allIds = items.map(n => n.id);
        saveReadNotificationIds(allIds);
        renderNotifications(items);
      };
    });
  }

  // 8. Typewriter Effect for Mendorbit Signature Slogan (Two-Line Staggered Indent, Zero Scroll Shift)
  function initTypewriterEffect() {
    const el1 = document.getElementById('typewriter-line1');
    const cursor1 = document.getElementById('typewriter-cursor1');
    const el2 = document.getElementById('typewriter-line2');
    const cursor2 = document.getElementById('typewriter-cursor2');

    if (!el1 || !el2) return;

    function getGraphemes(text) {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), s => s.segment);
      }
      return text.split('');
    }

    const text1 = "“हम टॉपर्स नहीं चुनते,";
    const text2 = "हम टॉपर्स बनाते हैं!”";
    const graphemes1 = getGraphemes(text1);
    const graphemes2 = getGraphemes(text2);

    let idx1 = 0;
    let idx2 = 0;
    let state = 'typing1'; // 'typing1' | 'typing2' | 'hold' | 'erasing2' | 'erasing1' | 'pause'

    function step() {
      if (state === 'typing1') {
        if (cursor1) cursor1.classList.remove('hidden');
        if (cursor2) cursor2.classList.add('hidden');
        
        if (idx1 < graphemes1.length) {
          idx1++;
          el1.textContent = graphemes1.slice(0, idx1).join('');
          setTimeout(step, 65);
        } else {
          state = 'typing2';
          setTimeout(step, 100);
        }
      } else if (state === 'typing2') {
        if (cursor1) cursor1.classList.add('hidden');
        if (cursor2) cursor2.classList.remove('hidden');

        if (idx2 < graphemes2.length) {
          idx2++;
          el2.textContent = graphemes2.slice(0, idx2).join('');
          setTimeout(step, 75);
        } else {
          // Completed both lines!
          state = 'hold';
          setTimeout(step, 4500); // Hold full slogan proudly on screen for 4.5 seconds
        }
      } else if (state === 'hold') {
        state = 'erasing2';
        setTimeout(step, 50);
      } else if (state === 'erasing2') {
        if (cursor1) cursor1.classList.add('hidden');
        if (cursor2) cursor2.classList.remove('hidden');

        if (idx2 > 0) {
          idx2--;
          el2.textContent = graphemes2.slice(0, idx2).join('');
          setTimeout(step, 25);
        } else {
          state = 'erasing1';
          setTimeout(step, 60);
        }
      } else if (state === 'erasing1') {
        if (cursor2) cursor2.classList.add('hidden');
        if (cursor1) cursor1.classList.remove('hidden');

        if (idx1 > 0) {
          idx1--;
          el1.textContent = graphemes1.slice(0, idx1).join('');
          setTimeout(step, 20);
        } else {
          state = 'pause';
          setTimeout(step, 500); // Brief pause before starting again
        }
      } else if (state === 'pause') {
        state = 'typing1';
        setTimeout(step, 100);
      }
    }

    setTimeout(step, 200);
  }

  // 9. Interactive Smart Classroom Hub Stream Tabs
  function initHubStreamTabs() {
    const tabBtns = document.querySelectorAll('.hub-tab-btn');
    const panels = document.querySelectorAll('.stream-content-panel');
    if (!tabBtns.length || !panels.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stream = btn.getAttribute('data-stream');
        
        // Update tab styles
        tabBtns.forEach(b => {
          b.classList.remove('bg-white', 'dark:bg-slate-900', 'text-blue-900', 'dark:text-blue-400', 'shadow-sm');
          b.classList.add('text-slate-600', 'dark:text-slate-400');
        });
        btn.classList.add('bg-white', 'dark:bg-slate-900', 'text-blue-900', 'dark:text-blue-400', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-400');

        // Show target panel
        panels.forEach(p => p.classList.add('hidden'));
        const targetPanel = document.getElementById(`stream-content-${stream}`);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
          }
        }
      });
    });
  }

  // Initialize all engines
  initAppleUpdateEngine();
  initNotificationEngine();
  initTypewriterEffect();
  initHubStreamTabs();

  window.addEventListener('focus', () => {
    initAppleUpdateEngine();
    initNotificationEngine();
  });
  setInterval(initAppleUpdateEngine, 90000);
});
