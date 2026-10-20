// KTRA Tyres - Core Application Logic
// Default: Hebrew (עברית) with seamless Arabic (العربية) toggle
// Focused 100% on Real Tire Sizes & Patterns (A/T نص نص, M/T خشن, H/T ناعم, etc.)

let currentLanguage = 'he';
let activeTreadType = 'all';
let activeBrand = 'all';
let rfqCart = [];

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  renderProducts();
  setupEventListeners();
  updateRfqBadge();
  if (window.lucide) {
    lucide.createIcons();
  }
});

// ================= LANGUAGE TOGGLE =================
function initLanguage() {
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langLabel = document.getElementById('current-lang-label');

  langToggleBtn.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'he' ? 'ar' : 'he';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = 'rtl'; // Both Hebrew & Arabic are RTL
    
    langLabel.textContent = currentLanguage === 'he' ? 'العربية / עברית' : 'עברית / عربي';

    applyTranslations();
    renderProducts();
    renderRfqItems();

    if (window.lucide) {
      lucide.createIcons();
    }
  });
}

function applyTranslations() {
  const isAr = currentLanguage === 'ar';

  // Top header text
  const topText = document.getElementById('top-text');
  if (topText) {
    topText.textContent = isAr 
      ? 'كَترا للإطارات - استيراد وتوزيع كبرى ماركات الإطارات بالجملة | ناعم، نص نص (A/T)، خشن (M/T)، شاحنات ومعدات'
      : 'קטרע צמיגים - יבוא ושיווק צמיגים סיטונאי | כביש, חצי-חצי (A/T), שטח מלא (M/T), משאיות וצמ"ה';
  }

  // Header WhatsApp
  const headerWaText = document.getElementById('header-whatsapp-text');
  const headerWaLink = document.getElementById('header-whatsapp-link');
  if (headerWaText) {
    headerWaText.textContent = isAr ? 'طلبيات واتساب: 054-631-2091' : 'הזמנות וואטסאפ: 054-631-2091';
  }
  if (headerWaLink) {
    headerWaLink.href = isAr
      ? 'https://wa.me/972546312091?text=' + encodeURIComponent('مرحباً كَترا للإطارات، أود الاستفسار عن عروض أسعار الإطارات بالجملة')
      : 'https://wa.me/972546312091?text=' + encodeURIComponent('שלום קטרע צמיגים, מעוניין בהצעת מחיר סיטונאית לצמיגים');
  }

  // Section title
  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) {
    catalogTitle.textContent = isAr
      ? 'كتالوج الإطارات المتوفرة بالمخازن - حدد المقاس والنوع (نص نص، خشن، ناعم، شاحنات)'
      : 'צמיגים זמינים במלאי מיידי - בחר מידה ודגם (חצי חצי, שטח מלא, כביש, משא)';
  }

  // Update Tread Type Filter Buttons Text
  const filterBtns = {
    'all': isAr ? 'كل الإطارات' : 'כל הצמיגים',
    'at': isAr ? 'نص نص (A/T) - 50/50' : 'חצי חצי (A/T) - 50/50',
    'mt': isAr ? 'خشن كامل (M/T) - صخور ورمال' : 'שטח מלא (M/T) - סלעים ובוץ',
    'ht': isAr ? 'ناعم كوشوك شارع (H/T)' : 'כביש שקט וחסכוני (H/T)',
    'uhp': isAr ? 'سبورت دعسة واطية (UHP)' : 'ספורט חתך נמוך (UHP)',
    'commercial': isAr ? 'تجاري مصلب C (فانات 8PR)' : 'מסחרי מחוזק C (טנדרים 8PR)',
    'tbr': isAr ? 'شاحنات كبار وترلات (TBR)' : 'משא כבד וטריילר (TBR)',
    'otr': isAr ? 'بواجر وشواكيش (OTR)' : 'צמ"ה ושופלים (OTR)'
  };

  for (const [key, label] of Object.entries(filterBtns)) {
    const btn = document.querySelector(`[data-tread="${key}"]`);
    if (btn) btn.textContent = label;
  }
}

// ================= RENDER PRODUCTS =================
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countBadge = document.getElementById('count-badge');
  const noResults = document.getElementById('no-results-box');
  if (!container) return;

  const widthVal = document.getElementById('filter-width')?.value || 'all';
  const aspectVal = document.getElementById('filter-aspect')?.value || 'all';
  const rimVal = document.getElementById('filter-rim')?.value || 'all';
  const brandVal = document.getElementById('filter-brand')?.value || 'all';

  const isAr = currentLanguage === 'ar';

  const filtered = PRODUCTS.filter(item => {
    // Tread type filter (A/T, M/T, H/T, etc.)
    if (activeTreadType !== 'all' && item.treadType !== activeTreadType) {
      return false;
    }
    // Brand filter
    if (brandVal !== 'all' && item.brand !== brandVal) {
      return false;
    }
    // Width filter
    if (widthVal !== 'all' && item.width !== widthVal) {
      return false;
    }
    // Aspect filter
    if (aspectVal !== 'all' && item.aspectRatio !== aspectVal) {
      return false;
    }
    // Rim filter
    if (rimVal !== 'all' && item.rim !== rimVal) {
      return false;
    }
    return true;
  });

  if (countBadge) {
    countBadge.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
    return;
  }

  if (noResults) noResults.classList.add('hidden');

  container.innerHTML = filtered.map(item => {
    const badge = isAr ? item.treadBadgeAr : item.treadBadgeHe;
    const features = isAr ? item.featuresAr : item.featuresHe;
    const warranty = isAr ? item.warrantyAr : item.warrantyHe;
    const isInCart = rfqCart.some(c => c.id === item.id);

    // Tread badge color styling
    let badgeColorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (item.treadType === 'at') {
      badgeColorClass = 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-black'; // A/T نص نص
    } else if (item.treadType === 'mt') {
      badgeColorClass = 'bg-red-500/20 text-red-400 border-red-500/40 font-black'; // M/T خشن
    } else if (item.treadType === 'ht') {
      badgeColorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black'; // H/T ناعم
    } else if (item.treadType === 'uhp') {
      badgeColorClass = 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-black'; // UHP سبورت
    } else if (item.treadType === 'tbr') {
      badgeColorClass = 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-black'; // TBR משא
    }

    const whatsappText = isAr
      ? `مرحباً، أود الاستفسار عن توفر وسعر إطار مقاس ${item.size} - ${item.brandName} (${badge})`
      : `שלום, מעוניין לקבל הצעת מחיר לצמיג מידה ${item.size} - ${item.brandName} (${badge})`;

    return `
      <div class="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between p-4 group relative hover:border-amber-400/50 transition-all shadow-xl">
        
        <div>
          <!-- Top Row: BOLD TIRE SIZE + TREAD BADGE -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-2xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md">
              ${item.size}
            </span>
            <span class="text-[11px] px-2.5 py-1 rounded-md border ${badgeColorClass}">
              ${badge}
            </span>
          </div>

          <!-- Brand & Model Name -->
          <div class="flex items-center justify-between text-xs font-bold text-slate-300 mb-3">
            <span class="text-white text-sm font-black uppercase font-['Outfit']">${item.brandName}</span>
            <span class="text-slate-400">${item.modelName}</span>
          </div>

          <!-- PURE TIRE IMAGE (Centerpiece) -->
          <div class="tire-img-wrap relative p-2 flex items-center justify-center h-56 bg-black/40 rounded-xl border border-white/5 overflow-hidden my-2">
            <img src="${item.image}" 
                 alt="${item.size} - ${item.brandName}" 
                 loading="eager"
                 class="max-h-52 w-auto object-contain filter contrast-105 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transform group-hover:scale-110 transition-transform duration-500">
            
            <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] font-mono text-slate-300">
              ${item.loadIndex}
            </div>
          </div>

          <!-- Quick Specs Tags -->
          <div class="grid grid-cols-2 gap-2 my-3 text-center">
            <div class="p-2 rounded-lg bg-slate-900 border border-white/5 text-[11px]">
              <span class="text-slate-400 block text-[10px]">${isAr ? 'عمق المداس' : 'עומק סוליה'}</span>
              <strong class="text-amber-400 font-mono">${item.treadDepth}</strong>
            </div>
            <div class="p-2 rounded-lg bg-slate-900 border border-white/5 text-[11px]">
              <span class="text-slate-400 block text-[10px]">${isAr ? 'الهيكل / القوة' : 'מבנה / קורד'}</span>
              <strong class="text-white">${item.plyRating.split('(')[0]}</strong>
            </div>
          </div>

          <!-- Main Bullet Points (Tire Shop Language) -->
          <ul class="space-y-1 text-xs text-slate-300 mb-4 pr-1">
            <li class="flex items-start gap-1.5">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"></i>
              <span>${features[0]}</span>
            </li>
            <li class="flex items-start gap-1.5">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"></i>
              <span>${features[1]}</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
          <a href="https://wa.me/972546312091?text=${encodeURIComponent(whatsappText)}" 
             target="_blank" 
             class="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
            <span>${isAr ? 'طلب واتساب' : 'הזמן בוואטסאפ'}</span>
          </a>

          <button onclick="toggleRfq('${item.id}')" 
                  class="px-3 py-2.5 rounded-xl ${isInCart ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'} font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
            <i data-lucide="${isInCart ? 'check' : 'plus'}" class="w-3.5 h-3.5"></i>
            <span>${isInCart ? (isAr ? 'مضاف للسلة' : 'נוסף לסל') : (isAr ? 'سلة التسعير' : 'הוסף לסל')}</span>
          </button>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Tread type buttons (הכל, חצי חצי A/T, שטח מלא M/T, כביש H/T, וכו')
  document.querySelectorAll('.tread-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tread-btn').forEach(b => {
        b.classList.remove('active', 'bg-amber-500', 'text-black', 'border-amber-400');
        b.classList.add('bg-slate-900', 'text-slate-300', 'border-white/10');
      });
      btn.classList.add('active', 'bg-amber-500', 'text-black', 'border-amber-400');
      btn.classList.remove('bg-slate-900', 'text-slate-300', 'border-white/10');

      activeTreadType = btn.getAttribute('data-tread');
      renderProducts();
    });
  });

  // Dropdown filter change listeners
  ['filter-width', 'filter-aspect', 'filter-rim', 'filter-brand'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        renderProducts();
      });
    }
  });

  // Reset Filters
  const resetBtn = document.getElementById('reset-filters-btn');
  const resetBoxBtn = document.getElementById('reset-box-btn');
  const doReset = () => {
    document.getElementById('filter-width').value = 'all';
    document.getElementById('filter-aspect').value = 'all';
    document.getElementById('filter-rim').value = 'all';
    document.getElementById('filter-brand').value = 'all';
    activeTreadType = 'all';

    document.querySelectorAll('.tread-btn').forEach(b => {
      if (b.getAttribute('data-tread') === 'all') {
        b.classList.add('active', 'bg-amber-500', 'text-black', 'border-amber-400');
        b.classList.remove('bg-slate-900', 'text-slate-300', 'border-white/10');
      } else {
        b.classList.remove('active', 'bg-amber-500', 'text-black', 'border-amber-400');
        b.classList.add('bg-slate-900', 'text-slate-300', 'border-white/10');
      }
    });

    renderProducts();
  };

  if (resetBtn) resetBtn.addEventListener('click', doReset);
  if (resetBoxBtn) resetBoxBtn.addEventListener('click', doReset);

  // RFQ Drawer triggers
  const rfqModal = document.getElementById('rfq-modal');
  const rfqCartBtn = document.getElementById('rfq-cart-btn');
  const closeRfqModalBtn = document.getElementById('close-rfq-modal-btn');

  if (rfqCartBtn) {
    rfqCartBtn.addEventListener('click', () => {
      renderRfqItems();
      rfqModal.classList.remove('hidden');
    });
  }
  if (closeRfqModalBtn) {
    closeRfqModalBtn.addEventListener('click', () => {
      rfqModal.classList.add('hidden');
    });
  }

  // Clear RFQ
  const clearRfqBtn = document.getElementById('clear-rfq-btn');
  if (clearRfqBtn) {
    clearRfqBtn.addEventListener('click', () => {
      rfqCart = [];
      updateRfqBadge();
      renderRfqItems();
      renderProducts();
    });
  }

  // Submit RFQ form
  const rfqSubmitForm = document.getElementById('rfq-submit-form');
  if (rfqSubmitForm) {
    rfqSubmitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (rfqCart.length === 0) {
        alert(currentLanguage === 'ar' ? 'يرجى اختيار مقاس إطار واحد على الأقل' : 'אנא בחר לפחות מידת צמיג אחת');
        return;
      }
      const company = document.getElementById('rfq-company').value;
      const phone = document.getElementById('rfq-phone').value;
      const dest = document.getElementById('rfq-dest').value;

      let msg = `*KTRA Tyres Wholesale Inquiry*%0A%0A`;
      msg += `*Dealer/Customer:* ${encodeURIComponent(company)}%0A`;
      msg += `*Phone:* ${encodeURIComponent(phone)}%0A`;
      msg += `*Destination:* ${encodeURIComponent(dest)}%0A%0A`;
      msg += `*Requested Tyre Sizes:*%0A`;

      rfqCart.forEach((item, index) => {
        msg += `${index + 1}. *${encodeURIComponent(item.size)}* - ${encodeURIComponent(item.brandName)} (${encodeURIComponent(item.treadBadgeHe)}) - Qty: ${encodeURIComponent(item.quantity)}%0A`;
      });

      window.open(`https://wa.me/972546312091?text=${msg}`, '_blank');
      rfqModal.classList.add('hidden');
    });
  }

  // Supplier Modal triggers
  const supplierModal = document.getElementById('supplier-modal');
  const openSupplierBtns = [
    document.getElementById('open-supplier-modal-btn'),
    document.getElementById('footer-supplier-btn')
  ];
  openSupplierBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        supplierModal.classList.remove('hidden');
      });
    }
  });
  const closeSupplierBtn = document.getElementById('close-supplier-modal-btn');
  if (closeSupplierBtn) {
    closeSupplierBtn.addEventListener('click', () => {
      supplierModal.classList.add('hidden');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === rfqModal) rfqModal.classList.add('hidden');
    if (e.target === supplierModal) supplierModal.classList.add('hidden');
  });
}

// ================= RFQ MANAGEMENT =================
function toggleRfq(productId) {
  const index = rfqCart.findIndex(item => item.id === productId);
  if (index > -1) {
    rfqCart.splice(index, 1);
  } else {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (prod) {
      rfqCart.push({ ...prod, quantity: '1 מכולה / FCL' });
    }
  }
  updateRfqBadge();
  renderProducts();
}

function updateRfqBadge() {
  const badge = document.getElementById('rfq-count-badge');
  if (badge) {
    badge.textContent = rfqCart.length;
  }
}

function renderRfqItems() {
  const list = document.getElementById('rfq-items-list');
  if (!list) return;

  const isAr = currentLanguage === 'ar';

  if (rfqCart.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        <i data-lucide="package-open" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        ${isAr ? 'سلة التسعير فارغة حالياً. اختر المقاسات المطلوبة من الكتالوج.' : 'סל הצמיגים ריק כרגע. אנא בחר מידות מהקטלוג.'}
      </div>
    `;
    return;
  }

  list.innerHTML = rfqCart.map(item => `
    <div class="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${item.size}" class="w-12 h-12 object-contain rounded bg-black/40 p-1">
        <div>
          <h5 class="text-sm font-black text-amber-400 font-mono">${item.size}</h5>
          <span class="text-xs text-white">${item.brandName} - ${isAr ? item.treadBadgeAr : item.treadBadgeHe}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <select onchange="updateRfqQty('${item.id}', this.value)" class="bg-black border border-white/20 rounded-lg px-2 py-1 text-xs text-white">
          <option ${item.quantity.includes('1') ? 'selected' : ''}>1 מכולה / FCL</option>
          <option ${item.quantity.includes('2') ? 'selected' : ''}>2 מכולות / FCL</option>
          <option ${item.quantity.includes('200') ? 'selected' : ''}>200 צמיגים / إطار</option>
          <option ${item.quantity.includes('500') ? 'selected' : ''}>500 צמיגים / إطار</option>
        </select>
        <button onclick="toggleRfq('${item.id}'); renderRfqItems();" class="text-slate-400 hover:text-rose-400 p-1">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateRfqQty(productId, qty) {
  const item = rfqCart.find(i => i.id === productId);
  if (item) item.quantity = qty;
}
