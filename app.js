const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

document.querySelector('body').addEventListener('mousemove', (e) => {
  const eye = document.querySelector('.eye-socket');
  const iris = document.querySelector('.iris');
  const rect = eye.getBoundingClientRect();

  const eyeCenterX = rect.left + rect.width / 2;
  const eyeCenterY = rect.top + rect.height / 2;

  let deltaX = e.clientX - eyeCenterX;
  let deltaY = e.clientY - eyeCenterY;

  const angle = Math.atan2(deltaY, deltaX);
  const maxDistance = (eye.clientWidth / 2) - (iris.clientWidth / 2);
  const newX = maxDistance * Math.cos(angle);
  const newY = maxDistance * Math.sin(angle);

  iris.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
});

let eyeClickInFlight = false;
let eyeHideTimeout = null;

document.querySelector('.eye-socket').addEventListener('click', async () => {
  if (eyeClickInFlight) return;
  eyeClickInFlight = true;

  const eyeText = document.getElementById('eye-text');
  const today = new Date().toDateString();
  const lastClickDate = localStorage.getItem('lastEyeClickDate');

  if (eyeHideTimeout) clearTimeout(eyeHideTimeout);

  eyeText.classList.add('visible');
  eyeText.textContent = 'Loading...';

  if (lastClickDate === today) {
    try {
      const res = await fetch('/api/eye-clicks');
      if (!res.ok) throw new Error('Failed to fetch count');
      const data = await res.json();
      eyeText.textContent = `Already poked today! Community total: ${data.count}`;
    } catch (error) {
      eyeText.textContent = 'You already clicked today!';
    }
  } else {
    try {
      const res = await fetch('/api/eye-clicks', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update count');
      const data = await res.json();
      localStorage.setItem('lastEyeClickDate', today);
      eyeText.textContent = `Community clicks: ${data.count}`;
    } catch (error) {
      eyeText.textContent = 'Failed to record click, try again later.';
    }
  }

  eyeHideTimeout = setTimeout(() => {
    eyeText.classList.remove('visible');
  }, 5000);

  eyeClickInFlight = false;
});

const modal = document.getElementById('contributeModal');
const btn = document.getElementById('contributeBtn');
const span = document.getElementsByClassName('close-btn')[0];
btn.onclick = () => modal.style.display = 'block';
span.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
  if (event.target == modal) modal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  const PARTICLE_DENSITY_AREA = 15000;
  const MIN_PARTICLES = 40;
  const MAX_PARTICLES = 180;
  const LINE_OPACITY_FACTOR = 0.5;
  const COLOR = 'rgba(200, 200, 200,';

  let particles = [];
  let particleCount = 100;
  let connectionDistance = 200;
  let connectionDistanceSq = connectionDistance * connectionDistance;
  let speedFactor = 1.0;
  let resizeTimeout;

  class Particle {
    constructor(width, height) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * speedFactor;
      this.vy = (Math.random() - 0.5) * speedFactor;
      this.size = Math.random() * 2 + 1;
    }
    update(width, height) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.fillStyle = `${COLOR} 0.5)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const handleResize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const area = width * height;

    particleCount = Math.min(Math.max(Math.floor(area / PARTICLE_DENSITY_AREA), MIN_PARTICLES), MAX_PARTICLES);
    connectionDistance = width < 768 ? 80 : 150;
    connectionDistanceSq = connectionDistance * connectionDistance;
    speedFactor = width < 768 ? 0.5 : 1.0;
    particles = Array.from({ length: particleCount }, () => new Particle(width, height));
  };

  const animate = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update(width, height);
      p1.draw();
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < connectionDistanceSq) {
          const opacity = (1 - Math.sqrt(distSq) / connectionDistance) * LINE_OPACITY_FACTOR;
          ctx.strokeStyle = `${COLOR} ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });
  handleResize();
  animate();
});

let allProjects = [];
let filteredProjects = [];
let currentIndex = 0;
let realVotes = {};
const itemsPerPage = 6;
const container = document.getElementById('project-container');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const randomBtn = document.getElementById('randomBtn');

let userVotes = JSON.parse(localStorage.getItem('userVotes')) || {};
const pendingVotes = new Set();

Promise.all([
  fetch('projects.json').then(res => {
    if (!res.ok) throw new Error('Failed to load projects.json');
    return res.json();
  }),
  fetch('/api/votes', { cache: 'no-store' }) 
    .then(res => res.ok ? res.json() : {})
    .catch(() => ({}))
])
  .then(([projectsData, votesData]) => {
    allProjects = projectsData;
    filteredProjects = [...allProjects];
    realVotes = votesData;

    renderBatch();
  })
  .catch(error => console.error('Error initializing app:', error));

function renderBatch() {
  const batch = filteredProjects.slice(currentIndex, currentIndex + itemsPerPage);

  const projectHTML = batch.map(project => {
    const isVoted = userVotes[project.id];
    const displayVotes = realVotes[project.id] || 0;
    const voteClass = isVoted ? 'voted' : '';

    return `
      <div class="item-wrapper">
        <div class="item">
          <div class="upvote-container ${voteClass}" data-id="${project.id}" onclick="handleVote(this, '${project.id}')">
            <i class="fa-solid fa-arrow-up"></i> <span class="vote-count">${displayVotes}</span>
          </div>

          <a href="${project.href}" class="item-link">
            <img src="${project.img}" alt="${project.alt}" loading="lazy">
            <div class="overlay">
              <span class="title">${project.title}</span>
              <div class="info-icon">
                <i class="fas fa-info"></i>
                <div class="tooltip">${project.info}</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML += projectHTML;
  currentIndex += itemsPerPage;

  if (currentIndex >= filteredProjects.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-block';
  }
}

loadMoreBtn.addEventListener('click', () => {
  renderBatch();
});

document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filter = e.target.getAttribute('data-filter');
    if (filter === 'All') {
      filteredProjects = [...allProjects];
    } else {
      filteredProjects = allProjects.filter(p => p.category === filter);
    }

    container.innerHTML = '';
    currentIndex = 0;
    renderBatch();
  });
});

randomBtn.addEventListener('click', () => {
  if (allProjects.length === 0) return;
  const randomIndex = Math.floor(Math.random() * allProjects.length);
  const randomApp = allProjects[randomIndex];
  window.location.href = randomApp.href;
});

window.handleVote = async function (element, id) {
  if (pendingVotes.has(id)) return;
  pendingVotes.add(id);

  const countSpan = element.querySelector('.vote-count');
  const wasVoted = Boolean(userVotes[id]);
  const previousCount = parseInt(countSpan.textContent, 10);
  const action = wasVoted ? -1 : 1;

  if (wasVoted) {
    delete userVotes[id];
    element.classList.remove('voted');
  } else {
    userVotes[id] = true;
    element.classList.add('voted');
  }
  countSpan.textContent = previousCount + action;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));

  try {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, action })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    realVotes[id] = data.votes;
    countSpan.textContent = data.votes;
  } catch (error) {
    console.error('Failed to register vote with server:', error);

    if (wasVoted) {
      userVotes[id] = true;
      element.classList.add('voted');
    } else {
      delete userVotes[id];
      element.classList.remove('voted');
    }
    countSpan.textContent = previousCount;
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
  } finally {
    pendingVotes.delete(id);
  }
};