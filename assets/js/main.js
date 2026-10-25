// Mendorbit - Official Interactive Scripts & Theme Engine (v1.3.3)
const CURRENT_APP_VERSION = "1.3.3";

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

  // 6. Apple-Design One-Click Update Engine (Only prompts if genuinely newer release exists)
  function isVersionNewer(newVer, curVer) {
    if (!newVer || !curVer) return false;
    const pNew = String(newVer).split('.').map(n => parseInt(n, 10) || 0);
    const pCur = String(curVer).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pNew.length, pCur.length); i++) {
      const a = pNew[i] || 0;
      const b = pCur[i] || 0;
      if (a > b) return true;
      if (a < b) return false;
    }
    return false;
  }

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

      // Initialize acknowledged version for fresh visitors to CURRENT_APP_VERSION
      if (!acknowledgedVersion) {
        localStorage.setItem('mendorbit_acknowledged_version', CURRENT_APP_VERSION);
      }

      // Strictly check if serverVersion is newer than running app version and unacknowledged
      if (isVersionNewer(serverVersion, CURRENT_APP_VERSION) && acknowledgedVersion !== serverVersion) {
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
  const DEFAULT_NOTIFICATIONS = [];

  function getReadNotificationIds() {
    try {
      const raw = JSON.parse(localStorage.getItem('mendorbit_read_notifications') || '[]');
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveReadNotificationIds(ids) {
    const stringIds = Array.isArray(ids) ? ids.map(String) : [];
    localStorage.setItem('mendorbit_read_notifications', JSON.stringify(stringIds));
  }

  function initNotificationEngine() {
    let localItems = [];
    try {
      const stored = localStorage.getItem('mendorbit_notifications');
      if (stored) localItems = JSON.parse(stored);
    } catch {}

    renderNotifications(localItems);

    // Real-Time Zero-Delay Firestore Sync Listener
    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      mendorbitDB.collection('mendorbit_notifications')
        .orderBy('createdAt', 'desc')
        .limit(25)
        .onSnapshot(snapshot => {
          const liveItems = [];
          snapshot.forEach(doc => {
            liveItems.push({ id: doc.id, ...doc.data() });
          });

          // Detect newly pushed notification
          const cachedRaw = localStorage.getItem('mendorbit_notifications');
          const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
          if (liveItems.length > 0 && (!cached.length || liveItems[0].id !== cached[0].id)) {
            const newest = liveItems[0];
            const readIds = getReadNotificationIds();
            if (!readIds.includes(newest.id)) {
              if (typeof triggerSystemNotification === 'function') {
                triggerSystemNotification(
                  `[Mendorbit] ${newest.title}`,
                  newest.message,
                  newest.link || 'batches.html',
                  newest.bannerImage || ''
                );
              }
            }
          }

          localStorage.setItem('mendorbit_notifications', JSON.stringify(liveItems));
          renderNotifications(liveItems);
        }, err => {
          console.log("Firestore notification listener note:", err.message);
        });
    }

    // Bind dropdown click handlers
    const wrappers = document.querySelectorAll('.notification-wrapper');
    wrappers.forEach(wrapper => {
      const btn = wrapper.querySelector('.notification-bell-btn');
      const panel = wrapper.querySelector('.notification-dropdown-panel');
      if (btn && panel) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Safely request permission on active user gesture without auto-blocking
          if (typeof initNotificationPermissionsOnInteraction === 'function') {
            initNotificationPermissionsOnInteraction();
          }
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
    const unreadItems = (items || []).filter(n => n && !readIds.includes(String(n.id)));
    const unreadCount = unreadItems.length;

    // 1. Update all badge pills (never display '0', completely hide if all read)
    const badges = document.querySelectorAll('.notification-badge-pill');
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        badge.classList.remove('hidden');
        badge.style.display = 'inline-flex';
      } else {
        badge.textContent = '';
        badge.classList.add('hidden');
        badge.style.display = 'none';
      }
    });

    // 2. Bell icon ringing animation (rings when unread alerts exist, stops when seen)
    const bellIcons = document.querySelectorAll('.notification-bell-btn i, .notification-bell-btn svg');
    bellIcons.forEach(icon => {
      if (unreadCount > 0) {
        icon.classList.add('bell-ringing');
      } else {
        icon.classList.remove('bell-ringing');
      }
    });

    // 3. Render all dropdown lists with Apple-inspired design & banner support
    const lists = document.querySelectorAll('.notification-dropdown-list');
    lists.forEach(list => {
      if (!items || items.length === 0) {
        list.innerHTML = `
          <div class="p-8 text-center text-xs text-slate-500">
            <div class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <i data-lucide="bell-off" class="w-5 h-5"></i>
            </div>
            <p class="font-bold text-slate-700 dark:text-slate-300">No new notifications</p>
            <p class="mt-0.5 text-[11px] text-slate-400">Live class alerts and announcements will show here.</p>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ root: list });
        return;
      }

      list.innerHTML = items.map(n => {
        const notifId = String(n.id);
        const isUnread = !readIds.includes(notifId);
        const timeDisplay = n.formattedDate || n.time || 'Live Alert';
        const hasValidLink = n.link && n.link.trim() !== '' && n.link.trim() !== '#';
        return `
          <div role="button" tabindex="0" data-id="${notifId}" data-link="${n.link || ''}" class="notification-item cursor-pointer block px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition select-none ${isUnread ? 'bg-blue-50/50 dark:bg-slate-800/40' : ''}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                ${isUnread ? '<span class="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 animate-pulse"></span>' : ''}
                <span class="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">${n.title}</span>
              </div>
              <span class="text-[10px] font-semibold text-slate-400 flex-shrink-0">${timeDisplay}</span>
            </div>
            
            <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">${n.message}</p>
            
            ${n.bannerImage ? `
              <div class="mt-2 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 aspect-[16/9] w-full max-h-32 bg-slate-900">
                <img src="${n.bannerImage}" alt="Notification Banner" class="w-full h-full object-cover">
              </div>
            ` : ''}

            <div class="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
              <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100/80 dark:bg-slate-800 text-blue-900 dark:text-blue-300">${n.badge || 'Notification'}</span>
              ${hasValidLink ? '<span class="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5"><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ root: list });
      }
    });

    // 4. Mark individual item as read on click and navigate only if valid link exists
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const link = item.getAttribute('data-link');
        if (id) {
          const currentRead = getReadNotificationIds();
          if (!currentRead.includes(id)) {
            currentRead.push(id);
            saveReadNotificationIds(currentRead);
            renderNotifications(items);
          }
        }
        if (link && link.trim() !== '' && link.trim() !== '#' && !link.startsWith('javascript:')) {
          window.location.href = link;
        }
      });
    });

    // 5. Mark all as read button
    document.querySelectorAll('.mark-all-read-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const allIds = (items || []).map(n => String(n.id));
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
