const state = {
  currentView: 'homeView',
  propCount: 0,
  rewardTriggered: false,
  weekPlan: [0, 0, 0, 0, 0, 0, 0],
  hasUploadedFile: false,
  allWeeklyTasksDone: false,
  skipCheckInAvailable: false,
  hideRewardToast: false,
};

const viewMap = {
  homeView: document.getElementById('homeView'),
  planView: document.getElementById('planView'),
  weeklyPlanView: document.getElementById('weeklyPlanView'),
  lessonView: document.getElementById('lessonView'),
  progressView: document.getElementById('progressView'),
  settingsView: document.getElementById('settingsView'),
};

const propCounter = document.getElementById('propCounter');
const propCountEl = document.getElementById('propCount');
const propTooltip = document.createElement('div');
propTooltip.className = 'prop-tooltip';
propTooltip.innerHTML = `
  <div class="tooltip-title">免打卡道具</div>
  <div class="tooltip-divider"></div>
  <div class="tooltip-label">获得途径：</div>
  <div class="tooltip-content">一周内无缺卡</div>
`;
document.body.appendChild(propTooltip);

const rewardToast = document.getElementById('rewardToast');
const toast = document.getElementById('toast');
const confettiLayer = document.getElementById('confettiLayer');

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('visible');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove('visible');
    toast.classList.add('hidden');
  }, 1800);
}

function navigateTo(viewId) {
  Object.keys(viewMap).forEach((key) => {
    viewMap[key].classList.toggle('active', key === viewId);
  });

  state.currentView = viewId;
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === viewId);
  });

  if (viewId === 'homeView' && shouldTriggerReward()) {
    triggerReward();
  }
}

function shouldTriggerReward() {
  return state.weekPlan.some((value) => value > 0) && !state.rewardTriggered && !state.hideRewardToast;
}

function triggerReward() {
  state.rewardTriggered = true;
  state.propCount += 1;
  propCountEl.textContent = String(state.propCount);
  state.skipCheckInAvailable = true;
  updateSkipCheckInButton();

  const button = document.getElementById('skipCheckInBtn');
  if (button) {
    button.classList.add('active');
    button.disabled = false;
    button.classList.remove('disabled');
    button.textContent = '跳过打卡';
  }

  createConfetti();
  rewardToast.classList.add('visible');
  setTimeout(() => {
    rewardToast.classList.remove('visible');
  }, 2600);

  showToast('已获得一个免打卡道具');
}

function createConfetti() {
  const colors = ['#ff6b6b', '#ffa500', '#ffd700', '#2ecc71', '#00d084', '#00ced1', '#4169e1', '#9370db'];
  const count = 14;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    const size = 12 + Math.random() * 12;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = 40 + Math.random() * (window.innerWidth - 80);
    const drift = (Math.random() - 0.5) * 100;

    dot.className = 'confetti-dot';
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${x}px`;
    dot.style.top = '-20px';
    dot.style.background = color;
    dot.style.opacity = '0.5';
    dot.style.setProperty('--drift', `${drift}px`);
    dot.style.animation = `confettiFall ${2600 + i * 40}ms ease-in forwards`;

    confettiLayer.appendChild(dot);
    setTimeout(() => dot.remove(), 3000 + i * 40);
  }
}

function updateSkipCheckInButton() {
  const btn = document.getElementById('skipCheckInBtn');
  if (!btn) return;
  if (state.skipCheckInAvailable) {
    btn.classList.remove('disabled');
    btn.classList.add('active');
    btn.disabled = false;
    btn.textContent = '跳过打卡';
  } else {
    btn.classList.add('disabled');
    btn.classList.remove('active');
    btn.disabled = true;
    btn.textContent = '跳过打卡';
  }
}

function renderWeekGrid() {
  const cells = document.querySelectorAll('.day-cell');
  cells.forEach((cell, index) => {
    const value = state.weekPlan[index];
    const span = cell.querySelector('span');
    if (value > 0) {
      cell.classList.add('active');
      span.textContent = `${value} 个`;
    } else {
      cell.classList.remove('active');
      span.textContent = '';
    }
  });
}

function autoFillWeekPlan() {
  state.weekPlan = [50, 50, 50, 50, 50, 150, 100];
  renderWeekGrid();
}

function generatePlan() {
  if (!state.hasUploadedFile) {
    showToast('请先上传学习资料');
    return;
  }

  if (state.weekPlan.every((value) => value === 0)) {
    autoFillWeekPlan();
  }

  navigateTo('weeklyPlanView');
}

function bindCommonEvents() {
  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('click', () => navigateTo(card.dataset.target));
  });

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => navigateTo(button.dataset.target));
  });

  document.querySelectorAll('.back-btn').forEach((button) => {
    button.addEventListener('click', () => navigateTo(button.dataset.target));
  });

  document.getElementById('generatePlanBtn').addEventListener('click', generatePlan);

  document.getElementById('autoRecommendBtn').addEventListener('click', () => {
    autoFillWeekPlan();
    showToast('已使用智能推荐计划');
  });

  document.getElementById('confirmPlanBtn').addEventListener('click', () => {
    const total = state.weekPlan.reduce((sum, item) => sum + item, 0);
    if (total === 0) {
      showToast('请至少安排一天的学习任务');
      return;
    }
    navigateTo('lessonView');
    showToast('计划已确认');
  });

  const skipBtn = document.getElementById('skipCheckInBtn');
  const modal = document.getElementById('confirmModal');
  const cancelSkipBtn = document.getElementById('cancelSkipBtn');
  const confirmSkipBtn = document.getElementById('confirmSkipBtn');

  skipBtn.addEventListener('click', () => {
    if (!state.skipCheckInAvailable) return;
    modal.classList.remove('hidden');
  });

  cancelSkipBtn.addEventListener('click', () => modal.classList.add('hidden'));
  confirmSkipBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    state.skipCheckInAvailable = false;
    state.propCount = Math.max(0, state.propCount - 1);
    propCountEl.textContent = String(state.propCount);
    updateSkipCheckInButton();

    state.weekPlan = [0, ...state.weekPlan.slice(1)];
    renderWeekGrid();
    showToast('已自动完成打卡并后移一天');
  });

  document.getElementById('fileInput').addEventListener('change', (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      state.hasUploadedFile = true;
      const fileNames = Array.from(files).map((file) => file.name).join(', ');
      showToast(`已上传: ${fileNames}`);
    }
  });

  const dropZone = document.getElementById('dropZone');
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      state.hasUploadedFile = true;
      showToast(`已上传: ${Array.from(files).map((f) => f.name).join(', ')}`);
    }
  });

  dropZone.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });

  document.querySelectorAll('.day-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      const day = Number(cell.dataset.day);
      const value = Number(prompt(`请输入 ${['周一','周二','周三','周四','周五','周六','周日'][day]} 的学习单词数量：`, state.weekPlan[day] || '0')) || 0;
      state.weekPlan[day] = Math.max(0, value);
      renderWeekGrid();
    });
  });

  propCounter.addEventListener('mouseenter', (event) => openTooltip(event));
  propCounter.addEventListener('mousemove', (event) => openTooltip(event));
  propCounter.addEventListener('mouseleave', () => closeTooltip());
  propCounter.addEventListener('click', (event) => {
    if (propTooltip.classList.contains('visible')) {
      closeTooltip();
    } else {
      openTooltip(event, true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!propCounter.contains(event.target) && !propTooltip.contains(event.target)) {
      closeTooltip();
    }
  });
}

function openTooltip(event, immediate = false) {
  if (immediate) {
    showPropTooltip(event.clientX, event.clientY);
    return;
  }

  clearTimeout(openTooltip.timer);
  openTooltip.timer = setTimeout(() => {
    showPropTooltip(event.clientX, event.clientY);
  }, 1000);
}

function showPropTooltip(x, y) {
  propTooltip.classList.remove('hidden');
  propTooltip.classList.add('visible');
  propTooltip.style.display = 'block';

  const width = 200;
  const height = 120;
  let left = x + 12;
  let top = y + 12;

  if (left + width > window.innerWidth - 10) {
    left = x - width - 12;
  }
  if (top + height > window.innerHeight - 10) {
    top = y - height - 12;
  }

  propTooltip.style.left = `${Math.max(10, left)}px`;
  propTooltip.style.top = `${Math.max(10, top)}px`;
}

function closeTooltip() {
  clearTimeout(openTooltip.timer);
  propTooltip.classList.remove('visible');
  propTooltip.classList.add('hidden');
  setTimeout(() => {
    propTooltip.style.display = 'none';
    propTooltip.classList.remove('hidden');
  }, 220);
}

function updateUI() {
  propCountEl.textContent = String(state.propCount);
  renderWeekGrid();
  updateSkipCheckInButton();
}

bindCommonEvents();
updateUI();
navigateTo('homeView');

window.addEventListener('resize', () => closeTooltip());

window.addEventListener('beforeunload', () => {
  if (state.allWeeklyTasksDone && !state.rewardTriggered) {
    state.rewardTriggered = true;
  }
});

window.addEventListener('load', () => {
  setTimeout(() => {
    if (!state.rewardTriggered && state.weekPlan.some((item) => item > 0)) {
      state.skipCheckInAvailable = false;
      updateSkipCheckInButton();
    }
  }, 50);
});
