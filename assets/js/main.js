// Mendorbit - Official Interactive Scripts & Theme Engine (v1.5.1)
const CURRENT_APP_VERSION = "1.5.1";

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
  // Silent cleanup of cache-busting query parameter from browser address bar
  if (window.location.search && window.location.search.includes('_v=')) {
    try {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('_v');
      window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash);
    } catch (e) {}
  }

  // 1. Initialize Theme & Bind Toggle Buttons
  try {
    initTheme();
    const themeToggleBtns = document.querySelectorAll('.apple-theme-toggle');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  } catch (e) {
    console.warn("Theme init note:", e);
  }

  // 1.1 Instant Student Journey & Visitor Telemetry Tracker
  try {
    initStudentJourneyTelemetry();
  } catch (e) {
    console.warn("Telemetry note:", e);
  }

  // 2. Set dynamic version in footer across all pages
  try {
    const versionElements = document.querySelectorAll('.app-version-display');
    versionElements.forEach(el => {
      el.textContent = `v${CURRENT_APP_VERSION}`;
    });
  } catch (e) {}

  // 3. Mobile Menu Toggle
  try {
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
  } catch (e) {}

  // 4. Batch Filter Tabs
  try {
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
  } catch (e) {}

  // 5. FAQ Accordion Logic (Direct Binding + Global Delegation Fallback)
  try {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.faq-icon');
        
        const isOpen = content && !content.classList.contains('hidden');
        
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

        if (!isOpen && content) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    });
  } catch (e) {}

  // Global Click Delegation for Theme Switcher & FAQ (Guarantees zero-fail interactivity)
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.apple-theme-toggle');
    if (toggleBtn) {
      toggleTheme();
      return;
    }

    const faqToggle = e.target.closest('.faq-toggle');
    if (faqToggle) {
      const content = faqToggle.nextElementSibling;
      const icon = faqToggle.querySelector('.faq-icon');
      if (content) {
        const isOpen = !content.classList.contains('hidden');
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));
        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      }
    }
  });

  // 6. Apple-Design Update Engine (Session-Aware: Never prompts on fresh open or browser reload)
  let sessionBootVersion = null;

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

      // On initial page load of this session: record boot version and NEVER show popup
      if (!sessionBootVersion) {
        sessionBootVersion = serverVersion;
        return;
      }

      // If a newer version is deployed while student is active on the page:
      if (isVersionNewer(serverVersion, sessionBootVersion)) {
        const dismissed = sessionStorage.getItem('mendorbit_update_dismissed');
        if (dismissed !== serverVersion) {
          showAppleUpdateBanner(serverVersion, data.releaseNotes || 'Fresh improvements and performance upgrades are live.');
        }
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

    updateBtn.addEventListener('click', async () => {
      updateBtn.disabled = true;
      updateBtn.innerHTML = `<span>Updating...</span>`;
      sessionStorage.removeItem('mendorbit_update_dismissed');

      // Purge Cache Storage if registered (PWA / Service Worker / Cache API)
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map(k => caches.delete(k)));
        } catch (e) {}
      }

      // Hard cache-busting reload: bypasses disk & memory caches immediately
      setTimeout(() => {
        const freshUrl = new URL(window.location.href);
        freshUrl.searchParams.set('_v', Date.now());
        window.location.replace(freshUrl.toString());
      }, 200);
    });

    const dismissHandler = () => {
      sessionStorage.setItem('mendorbit_update_dismissed', newVersion);
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
    };

    if (dismissBtn) dismissBtn.addEventListener('click', dismissHandler);
    if (closeBtn) closeBtn.addEventListener('click', dismissHandler);
  }

  // 7. Notification System with Unread Badge & Apple-Style Dropdown
  const DEFAULT_NOTIFICATIONS = [];
  let notificationEngineInitialized = false;

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

  // Smart relative time formatter for real-time alerts
  function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    let date;
    if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return typeof timestamp === 'string' ? timestamp : 'Just now';
    }

    const now = new Date();
    const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // Deduplicate notifications so a single resolution never duplicates
  function deduplicateNotifications(items) {
    if (!Array.isArray(items)) return [];
    const map = new Map();
    items.forEach(n => {
      if (!n) return;
      let key = String(n.id || '');
      if (n.ticketId) {
        key = `TICKET-${String(n.ticketId).toUpperCase().replace('#', '')}`;
      } else if (key.includes('RESOLVED-') || key.includes('NOTI-')) {
        const clean = key.replace(/^(NOTI-RESOLVED-|RESOLVED-|NOTI-)/, '');
        if (clean) key = `TICKET-${clean.toUpperCase().replace('#', '')}`;
      }
      if (!map.has(key)) {
        map.set(key, n);
      } else {
        const prev = map.get(key);
        const prevTime = new Date(prev.createdAt || 0).getTime();
        const currTime = new Date(n.createdAt || 0).getTime();
        if (currTime >= prevTime) {
          map.set(key, n);
        }
      }
    });
    return Array.from(map.values());
  }

  function initNotificationEngine() {
    let localItems = [];
    try {
      const stored = localStorage.getItem('mendorbit_notifications');
      if (stored) localItems = deduplicateNotifications(JSON.parse(stored));
    } catch {}

    renderNotifications(localItems);

    if (notificationEngineInitialized) return;
    notificationEngineInitialized = true;

    // Real-Time Zero-Delay Firestore Sync Listener
    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      mendorbitDB.collection('mendorbit_notifications')
        .orderBy('createdAt', 'desc')
        .limit(25)
        .onSnapshot(snapshot => {
          const rawItems = [];
          snapshot.forEach(doc => {
            rawItems.push({ id: doc.id, ...doc.data() });
          });
          const liveItems = deduplicateNotifications(rawItems);

          // Detect newly pushed notification
          const cachedRaw = localStorage.getItem('mendorbit_notifications');
          const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
          if (liveItems.length > 0 && (!cached.length || liveItems[0].id !== cached[0].id)) {
            const newest = liveItems[0];
            const readIds = getReadNotificationIds();
            if (!readIds.includes(String(newest.id))) {
              if (typeof triggerSystemNotification === 'function') {
                triggerSystemNotification(
                  `[Mendorbit] ${newest.title}`,
                  newest.message,
                  newest.link || '',
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

    // Live Cross-Tab Query Resolution Notification Sync
    try {
      const qSync = new BroadcastChannel('mendorbit_queries_live_sync');
      qSync.onmessage = (event) => {
        if (!event || !event.data) return;
        if (event.data.type === 'TICKET_RESOLVED' && event.data.ticket) {
          const t = event.data.ticket;
          const cleanTicketId = String(t.id).toUpperCase().replace('#', '');
          const noti = {
            id: `RESOLVED-${cleanTicketId}`,
            title: `Doubt #${cleanTicketId} Answered!`,
            message: `${t.adminName || 'Faculty'} answered: "${(t.adminReply || '').slice(0, 75)}..."`,
            category: 'Doubts',
            badge: 'Resolved',
            ticketId: cleanTicketId,
            link: `contact.html?track=${cleanTicketId}`,
            createdAt: t.resolvedAt || new Date().toISOString(),
            read: false
          };
          let notis = JSON.parse(localStorage.getItem('mendorbit_notifications') || '[]');
          notis = deduplicateNotifications([noti, ...notis]);
          localStorage.setItem('mendorbit_notifications', JSON.stringify(notis.slice(0, 30)));
          renderNotifications(notis);
          if (typeof triggerSystemNotification === 'function') {
            triggerSystemNotification(`[Mendorbit] Doubt #${cleanTicketId} Answered!`, noti.message, `contact.html?track=${cleanTicketId}`);
          }
        }
      };
    } catch(e) {}

    // Single Delegated Click Handler on Document - 100% reliable, never double toggles
    document.addEventListener('click', (e) => {
      const bellBtn = e.target.closest('.notification-bell-btn');
      if (bellBtn) {
        e.stopPropagation();
        const wrapper = bellBtn.closest('.notification-wrapper');
        const panel = wrapper ? wrapper.querySelector('.notification-dropdown-panel') : null;
        if (panel) {
          const isCurrentlyHidden = panel.classList.contains('hidden');
          document.querySelectorAll('.notification-dropdown-panel').forEach(p => p.classList.add('hidden'));
          if (isCurrentlyHidden) {
            panel.classList.remove('hidden');
          }
        }
        // Safely trigger notification permission on active user gesture
        if (typeof triggerNativeNotificationPermission === 'function') {
          triggerNativeNotificationPermission();
        }
        return;
      }

      // If clicked inside dropdown panel itself, do not close
      if (e.target.closest('.notification-dropdown-panel')) {
        return;
      }

      // Clicked outside: close all open panels
      document.querySelectorAll('.notification-dropdown-panel').forEach(p => p.classList.add('hidden'));
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
        const timeDisplay = formatRelativeTime(n.createdAt || n.time || n.formattedDate);
        const ticketId = n.ticketId ? String(n.ticketId).toUpperCase().replace('#', '') : '';
        const rawLink = ticketId ? `contact.html?track=${ticketId}` : (n.link || '').trim();
        const hasValidLink = rawLink !== '' && rawLink !== '#' && !rawLink.startsWith('javascript:');
        return `
          <div role="button" tabindex="0" data-id="${notifId}" data-ticket-id="${ticketId}" data-link="${hasValidLink ? rawLink : ''}" class="notification-item cursor-pointer block px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition select-none ${isUnread ? 'bg-blue-50/50 dark:bg-slate-800/40' : ''}">
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

    // 4. Mark individual item as read on click and navigate directly to ticket/link
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const link = item.getAttribute('data-link');
        const ticketId = item.getAttribute('data-ticket-id');

        if (id) {
          const currentRead = getReadNotificationIds();
          if (!currentRead.includes(id)) {
            currentRead.push(id);
          }
          if (ticketId && !currentRead.includes(`RESOLVED-${ticketId}`)) {
            currentRead.push(`RESOLVED-${ticketId}`);
          }
          saveReadNotificationIds(currentRead);
          renderNotifications(items);
        }

        // Close dropdown
        const panel = item.closest('.notification-dropdown-panel');
        if (panel) panel.classList.add('hidden');

        // If this notification is for a doubt/ticket, navigate directly to track ticket
        if (ticketId) {
          if (window.location.pathname.includes('contact.html')) {
            if (typeof switchContactTab === 'function') {
              switchContactTab('track');
            }
            const searchInput = document.getElementById('ticket-search-input');
            if (searchInput) searchInput.value = ticketId;
            if (typeof searchLiveTicketCloud === 'function') {
              searchLiveTicketCloud();
            }
            document.getElementById('contact-view-track')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          } else {
            window.location.href = `contact.html?track=${encodeURIComponent(ticketId)}`;
            return;
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
  initAppEcosystemLinks();
  initStudentDoubtSupportForm();
  initStudentAuthRedirect();

  window.addEventListener('focus', () => {
    initAppleUpdateEngine();
    initNotificationEngine();
    initAppEcosystemLinks();
    initStudentAuthRedirect();
  });
  setInterval(initAppleUpdateEngine, 90000);
});

// 10. Global Smooth Toggle for Blogs & Notes Section
window.toggleBlogsNotesView = function() {
  const extras = document.querySelectorAll('.extra-blog-note');
  const btnText = document.getElementById('btn-blogs-notes-text');
  const btnIcon = document.getElementById('btn-blogs-notes-icon');
  if (!extras.length) return;

  const isHidden = extras[0].classList.contains('hidden');
  extras.forEach(card => {
    if (isHidden) {
      card.classList.remove('hidden');
      card.classList.add('transition-all', 'duration-500');
    } else {
      card.classList.add('hidden');
    }
  });

  if (isHidden) {
    if (btnText) btnText.textContent = "View Less";
    if (btnIcon) btnIcon.classList.add('rotate-180');
  } else {
    if (btnText) btnText.textContent = "View More";
    if (btnIcon) btnIcon.classList.remove('rotate-180');
  }

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
};

// Global Doubt Category Selector Switcher
window.selectDoubtCategory = function(cat) {
  const hiddenInput = document.getElementById('doubt-category');
  if (hiddenInput) hiddenInput.value = cat;

  const btnAcad = document.getElementById('tab-doubt-academics');
  const btnNonAcad = document.getElementById('tab-doubt-non-academics');

  const activeClass = "category-pill whitespace-nowrap flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl font-extrabold text-[11px] sm:text-xs transition-all shadow-sm bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border border-slate-200/80 dark:border-slate-700 flex-nowrap select-none";
  const inactiveClass = "category-pill whitespace-nowrap flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex-nowrap select-none";

  if (cat === 'Academics') {
    if (btnAcad) btnAcad.className = activeClass;
    if (btnNonAcad) btnNonAcad.className = inactiveClass;
  } else {
    if (btnNonAcad) btnNonAcad.className = activeClass;
    if (btnAcad) btnAcad.className = inactiveClass;
  }

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
};

// 11. Dynamic Learning Portal & App Ecosystem Links Engine
function initAppEcosystemLinks() {
  const DEFAULT_ECOSYSTEM = {
    webPortalUrl: "https://app.mendorbit.in",
    androidApkUrl: "https://app.mendorbit.in/download/mendorbit-v2.apk",
    windowsAppUrl: "https://app.mendorbit.in/download/Mendorbit-Setup.exe",
    versionTag: "v2.4.0 (Latest Release)"
  };

  function applyEcosystemLinks(data) {
    const portalBtn = document.getElementById('app-web-portal-link');
    const androidBtn = document.getElementById('app-android-apk-link');
    const windowsBtn = document.getElementById('app-windows-link');
    const versionTag = document.getElementById('app-ecosystem-version-tag');

    if (portalBtn && data.webPortalUrl) portalBtn.href = data.webPortalUrl;
    if (androidBtn && data.androidApkUrl) androidBtn.href = data.androidApkUrl;
    if (windowsBtn && data.windowsAppUrl) windowsBtn.href = data.windowsAppUrl;
    if (versionTag && data.versionTag) versionTag.textContent = data.versionTag;
  }

  // Sanitize cached ecosystem if needed
  try {
    const raw = localStorage.getItem('mendorbit_app_ecosystem');
    if (raw && raw.includes('apps.mendorbit.in')) {
      const sanitized = raw.replace(/apps\.mendorbit\.in/g, 'app.mendorbit.in');
      localStorage.setItem('mendorbit_app_ecosystem', sanitized);
    }
  } catch(e) {}

  // 1. Immediate local cache apply
  try {
    const raw = localStorage.getItem('mendorbit_app_ecosystem');
    const cached = raw ? JSON.parse(raw) : DEFAULT_ECOSYSTEM;
    applyEcosystemLinks(cached);
  } catch(e) {
    applyEcosystemLinks(DEFAULT_ECOSYSTEM);
  }

  // 2. Real-time Cloud Firestore synchronization
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    mendorbitDB.collection('mendorbit_config').doc('app_ecosystem').onSnapshot(docSnap => {
      if (docSnap.exists) {
        const cloudData = docSnap.data();
        const merged = { ...DEFAULT_ECOSYSTEM, ...cloudData };
        localStorage.setItem('mendorbit_app_ecosystem', JSON.stringify(merged));
        applyEcosystemLinks(merged);
      }
    }, err => {
      console.log("Firestore app ecosystem sync note:", err.message);
    });
  }
}

// 12. Student Authentication & Auto-Redirect Engine (app.mendorbit.in)
function initStudentAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // A. Catch session sync signals
  if (urlParams.has('login_success') || urlParams.has('session_active')) {
    localStorage.setItem('mendorbit_student_session', 'true');
    localStorage.setItem('mendorbit_session_time', Date.now().toString());
  }

  // Allow manual logout or bypass parameters
  if (urlParams.has('logout')) {
    localStorage.removeItem('mendorbit_student_session');
    localStorage.removeItem('mendorbit_auth_user');
  }

  const isBypassed = urlParams.has('home') || urlParams.has('preview') || urlParams.has('stay');
  const hasSession = localStorage.getItem('mendorbit_student_session') === 'true' || 
                     localStorage.getItem('mendorbit_auth_user') !== null;

  // B. Auto-redirect to app.mendorbit.in if student is logged in
  if (hasSession && !isBypassed) {
    const pathname = window.location.pathname;
    const isRootOrIndex = pathname === '/' || pathname.endsWith('index.html') || pathname.endsWith('/');
    if (isRootOrIndex) {
      window.location.replace("https://app.mendorbit.in");
      return;
    }
  }

  // C. Update Navbar Login Button State
  const loginBtns = [
    { btn: document.getElementById('nav-student-login-btn'), text: document.getElementById('nav-login-btn-text') },
    { btn: document.getElementById('mobile-nav-student-login-btn'), text: document.getElementById('mobile-nav-login-btn-text') },
    { btn: document.getElementById('tablet-top-student-login-btn'), text: document.getElementById('tablet-login-btn-text') }
  ];

  loginBtns.forEach(({ btn, text }) => {
    if (!btn) return;
    btn.href = "https://app.mendorbit.in";
    if (hasSession) {
      if (text) text.textContent = "Dashboard";
      const icon = btn.querySelector('[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', 'layout-dashboard');
      btn.classList.add('logged-in');
    } else {
      if (text) text.textContent = "Login";
      btn.classList.remove('logged-in');
    }
  });

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// Cross-tab broadcast listener for app ecosystem links
window.addEventListener('storage', (e) => {
  if (e.key === 'mendorbit_app_ecosystem') {
    initAppEcosystemLinks();
  }
});

// 12. Student Doubt & Academic Support Form Engine
function showDoubtSuccessModal(studentName, phone, category, ticketId) {
  const existing = document.getElementById('doubt-success-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'doubt-success-modal';
  modal.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300';
  modal.onclick = (e) => {
    if (e.target === modal) closeDoubtSuccessModal();
  };
  modal.innerHTML = `
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 transform transition-all animate-in zoom-in-95 duration-200">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <svg class="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <div class="space-y-1.5">
        <h3 class="text-xl font-black text-slate-900 dark:text-white">Doubt Submitted!</h3>
        ${ticketId ? `<p class="font-mono text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 py-1 px-2.5 rounded-lg inline-block border border-orange-200/60 dark:border-orange-800/60">Ticket #${ticketId}</p>` : ''}
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Thank you, <strong class="text-slate-900 dark:text-white">${studentName}</strong>! Your doubt has been recorded. Our mentor team will contact you on <strong class="text-slate-900 dark:text-white">+91 ${phone}</strong> via WhatsApp / Call.
        </p>
      </div>

      <div class="pt-2 space-y-2">
        <button type="button" onclick="closeDoubtSuccessModal(); if(window.switchHomeSupportView) window.switchHomeSupportView('track');" class="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition transform active:scale-95 cursor-pointer">
          Track Resolution Now ↗
        </button>
        <button type="button" onclick="closeDoubtSuccessModal()" class="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeDoubtSuccessModal() {
  const modal = document.getElementById('doubt-success-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.remove(), 200);
  }
}

// Support Tab Switcher on Homepage (Ask Doubt vs Track Status)
window.switchHomeSupportView = function(view) {
  const askView = document.getElementById('home-support-ask-view');
  const trackView = document.getElementById('home-support-track-view');
  const tabAsk = document.getElementById('tab-home-support-ask');
  const tabTrack = document.getElementById('tab-home-support-track');

  if (!askView || !trackView) return;

  if (view === 'ask') {
    askView.classList.remove('hidden');
    trackView.classList.add('hidden');
    tabAsk.className = "px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs";
    tabTrack.className = "px-3 py-1.5 rounded-lg transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white";
  } else {
    askView.classList.add('hidden');
    trackView.classList.remove('hidden');
    tabTrack.className = "px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs";
    tabAsk.className = "px-3 py-1.5 rounded-lg transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white";
    renderHomeTrackedTickets();
  }
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

window.renderHomeTrackedTickets = function(customList) {
  const container = document.getElementById('home-tracked-tickets-container');
  if (!container) return;

  let tickets = customList;
  if (!tickets) {
    try {
      tickets = JSON.parse(localStorage.getItem('mendorbit_student_tickets') || '[]');
    } catch(e) {
      tickets = [];
    }
  }

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center text-slate-400 text-xs space-y-2">
        <i data-lucide="ticket" class="w-8 h-8 mx-auto opacity-40"></i>
        <p class="font-bold text-slate-600 dark:text-slate-300">No active tickets yet.</p>
        <p class="text-[11px] text-slate-400">Submit your subject doubt or query in the "Ask Doubt" tab to get a live Ticket ID.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = tickets.map(t => {
    const isResolved = t.status === 'RESOLVED';
    const cleanStaff = (t.adminName || 'Faculty').replace(/\s*\(.*?\)\s*/g, '').trim();

    return `
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="font-mono font-black text-[10px] text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded-md">#${t.id || 'TKT'}</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">${t.category || 'General'}</span>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isResolved ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}"></span>
            <span>${isResolved ? 'Resolved' : 'Pending'}</span>
          </span>
        </div>

        <div class="text-slate-700 dark:text-slate-300 font-medium text-xs leading-relaxed max-h-20 overflow-y-auto break-words bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          ${t.message || 'No question details.'}
        </div>

        ${isResolved && t.adminReply ? `
          <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
            <div class="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              <span class="flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>Mentor Resolution (${cleanStaff}):</span>
              </span>
              <span class="text-slate-400 font-mono">${t.adminReplyDate || 'Recent'}</span>
            </div>
            <div class="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto break-words">
              ${t.adminReply}
            </div>
          </div>
        ` : `
          <div class="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 pt-0.5">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            <span>Our mentors are reviewing your query. Check back shortly!</span>
          </div>
        `}
      </div>
    `;
  }).join('');

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
};

window.performHomeTicketLookup = async function() {
  const input = document.getElementById('home-ticket-search-input');
  const term = (input?.value || '').trim();
  if (!term) {
    renderHomeTrackedTickets();
    return;
  }

  // 1. Check local tickets first
  const localTickets = JSON.parse(localStorage.getItem('mendorbit_student_tickets') || '[]');
  const match = localTickets.filter(t => 
    String(t.id || '').toLowerCase().includes(term.toLowerCase()) || 
    String(t.studentPhone || '').includes(term)
  );

  if (match.length > 0) {
    renderHomeTrackedTickets(match);
  }

  // 2. Query Firestore directly for live resolution (0 fake data delay)
  if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
    try {
      const snap = await mendorbitDB.collection('mendorbit_queries').doc(term.toUpperCase()).get();
      if (snap.exists) {
        const liveDoc = { id: snap.id, ...snap.data() };
        renderHomeTrackedTickets([liveDoc]);
        return;
      }
      // Query by phone
      const phoneSnap = await mendorbitDB.collection('mendorbit_queries').where('studentPhone', '==', term).get();
      if (!phoneSnap.empty) {
        const results = [];
        phoneSnap.forEach(d => results.push({ id: d.id, ...d.data() }));
        renderHomeTrackedTickets(results);
      }
    } catch(e) {}
  }
};

// Real-time listener for student resolution updates via BroadcastChannel
try {
  const queryChannel = new BroadcastChannel('mendorbit_queries_live_sync');
  queryChannel.onmessage = (msg) => {
    if (msg.data && window.renderHomeTrackedTickets) {
      // Re-fetch tickets from local storage and refresh
      window.renderHomeTrackedTickets();
    }
  };
} catch(e) {}

function initStudentDoubtSupportForm() {
  const form = document.getElementById('student-doubt-support-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('doubt-student-name');
    const phoneInput = document.getElementById('doubt-student-phone');
    const categoryInput = document.getElementById('doubt-category');
    const messageInput = document.getElementById('doubt-message');
    const submitBtn = document.getElementById('btn-submit-doubt');
    const submitText = document.getElementById('btn-submit-doubt-text');

    const name = (nameInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim().replace(/\D/g, '');
    const category = (categoryInput?.value || 'Academics').trim();
    const message = (messageInput?.value || '').trim();

    if (!name) {
      if (nameInput) {
        nameInput.focus();
        nameInput.classList.add('ring-2', 'ring-rose-500');
        setTimeout(() => nameInput.classList.remove('ring-2', 'ring-rose-500'), 2000);
      }
      return;
    }

    if (!phone || phone.length < 10) {
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.classList.add('ring-2', 'ring-rose-500');
        setTimeout(() => phoneInput.classList.remove('ring-2', 'ring-rose-500'), 2000);
      }
      return;
    }

    if (!message) {
      if (messageInput) {
        messageInput.focus();
        messageInput.classList.add('ring-2', 'ring-rose-500');
        setTimeout(() => messageInput.classList.remove('ring-2', 'ring-rose-500'), 2000);
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = "Submitting...";

    const queryId = 'QRY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const queryData = {
      id: queryId,
      studentName: name,
      studentPhone: phone,
      category: category,
      message: message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      displayDate: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // 1. Save in local queries and student tickets
    try {
      const existingQueries = JSON.parse(localStorage.getItem('mendorbit_local_queries') || '[]');
      existingQueries.unshift(queryData);
      localStorage.setItem('mendorbit_local_queries', JSON.stringify(existingQueries.slice(0, 50)));

      const existingTickets = JSON.parse(localStorage.getItem('mendorbit_student_tickets') || '[]');
      existingTickets.unshift(queryData);
      localStorage.setItem('mendorbit_student_tickets', JSON.stringify(existingTickets.slice(0, 30)));
    } catch {}

    // 2. Save in Firestore Cloud Database (both mendorbit_queries & support_tickets)
    if (typeof mendorbitDB !== 'undefined' && mendorbitDB) {
      try {
        await mendorbitDB.collection('mendorbit_queries').doc(queryId).set(queryData);
        await mendorbitDB.collection('support_tickets').doc(queryId).set(queryData);
      } catch (err) {
        console.log("Firestore query write note:", err.message);
      }
    }

    // Broadcast across tabs so admin & contact page update instantly
    try {
      const bc = new BroadcastChannel('mendorbit_queries_live_sync');
      bc.postMessage({ type: 'NEW_QUERY', query: queryData });
      bc.close();
    } catch(e) {}

    // 3. Success Feedback on Button
    if (submitBtn) {
      submitBtn.classList.remove('from-orange-500', 'via-amber-500', 'to-orange-600');
      submitBtn.classList.add('bg-emerald-600', 'text-white');
    }
    if (submitText) {
      submitText.textContent = "Doubt Submitted";
    }

    // 4. Beautiful Custom Modal Popup (no browser alert!)
    showDoubtSuccessModal(name, phone, category, queryId);

    form.reset();

    // Auto-switch to Track tab after 2.5s or on modal action
    if (window.renderHomeTrackedTickets) {
      window.renderHomeTrackedTickets();
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-emerald-600', 'text-white');
        submitBtn.classList.add('from-orange-500', 'via-amber-500', 'to-orange-600');
      }
      if (submitText) {
        submitText.textContent = "Submit Query";
      }
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }, 4000);
  });
}

// =========================================================================
// Mendorbit Student Journey & Real-Time Visitor Telemetry Engine
// Tracks Every Student Page Transition, Device ID, and Journey Instantly
// Zero Firestore Quota Used - Routes Direct to Google Sheets
// =========================================================================
const MENDORBIT_PROD_VISITOR_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwAuFhPzuuVpknMUBe_NIWIO2iom5Gz8KBSohgvBxvjmq0T2n17AXye9A6qHkFD00ccyA/exec";

function getOrCreateVisitorId() {
  let vid = localStorage.getItem('mendorbit_visitor_id');
  if (!vid) {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeHex = Date.now().toString(36).substring(3, 7).toUpperCase();
    vid = `USR-${timeHex}-${randomHex}`;
    localStorage.setItem('mendorbit_visitor_id', vid);
  }
  return vid;
}

function getDeviceTelemetry() {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const deviceType = isMobile ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
  
  let browser = 'Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

  return { deviceType, browser };
}

function getFastGeolocation() {
  try {
    const cached = JSON.parse(localStorage.getItem('mendorbit_geo_cache') || 'null');
    if (cached && (Date.now() - (cached.timestamp || 0) < 24 * 60 * 60 * 1000)) {
      return cached;
    }
  } catch {}
  return { city: "India", region: "State", country: "India" };
}

async function refreshBackgroundGeolocation() {
  try {
    const res = await fetch('https://ipapi.co/json/', { timeout: 3000 });
    if (res.ok) {
      const data = await res.json();
      const geo = {
        city: data.city || "India",
        region: data.region || "State",
        country: data.country_name || "India",
        timestamp: Date.now()
      };
      localStorage.setItem('mendorbit_geo_cache', JSON.stringify(geo));
      return geo;
    }
  } catch {
    try {
      const res2 = await fetch('https://freeipapi.net/api/json');
      if (res2.ok) {
        const d2 = await res2.json();
        const geo2 = {
          city: d2.cityName || "India",
          region: d2.regionName || "State",
          country: d2.countryName || "India",
          timestamp: Date.now()
        };
        localStorage.setItem('mendorbit_geo_cache', JSON.stringify(geo2));
        return geo2;
      }
    } catch {}
  }
  return null;
}

function initStudentJourneyTelemetry() {
  // Do not track admin portal visits
  if (window.location.pathname.includes('/admin/')) return;

  const visitorId = getOrCreateVisitorId();
  const { deviceType, browser } = getDeviceTelemetry();
  const geo = getFastGeolocation();
  
  const currentPath = window.location.pathname;
  let pageName = currentPath.split('/').pop() || 'index.html';
  if (!pageName.includes('.')) pageName += '.html';

  // Prevent duplicate burst if same page reloaded within 2 seconds
  const lastLoggedKey = `mendorbit_last_logged_${pageName}`;
  const lastLoggedTime = parseInt(sessionStorage.getItem(lastLoggedKey) || '0', 10);
  if (Date.now() - lastLoggedTime < 2000) return;
  sessionStorage.setItem(lastLoggedKey, Date.now().toString());

  const displayTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  let referrer = 'Direct';
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      referrer = refUrl.pathname.split('/').pop() || 'Home';
    } catch {
      referrer = document.referrer;
    }
  }

  const payload = {
    type: 'visitor',
    visitorId: visitorId,
    timestamp: new Date().toISOString(),
    displayTime: displayTime,
    city: geo.city,
    state: geo.region,
    country: geo.country,
    device: deviceType,
    browser: browser,
    page: pageName,
    referrer: referrer || 'Direct',
    gps: ''
  };

  // 1. Update local cache for instant visibility
  try {
    let localVisitors = JSON.parse(localStorage.getItem('mendorbit_local_visitors') || '[]');
    localVisitors.unshift(payload);
    if (localVisitors.length > 50) localVisitors = localVisitors.slice(0, 50);
    localStorage.setItem('mendorbit_local_visitors', JSON.stringify(localVisitors));
  } catch {}

  // 2. Dispatch to Google Sheet Webhook immediately via fetch no-cors
  try {
    const webhookUrl = window.MENDORBIT_SHEET_WEBHOOK_URL || 
                       localStorage.getItem('mendorbit_sheet_webhook_url') || 
                       MENDORBIT_PROD_VISITOR_WEBHOOK_URL;

    fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}

  // 3. Refresh background IP Geo for high accuracy
  refreshBackgroundGeolocation();
}
