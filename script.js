// Skill data (from database)
let skills = [];

async function loadSkills() {
    try {
        const data = await window.apiService.fetchSkills();
        return data;
    } catch (error) {
        console.error('Error loading skills:', error);
        return [];
    }
}
const grid = document.getElementById('skill-grid');

function renderSkills(skillList, container = grid) {
    container.innerHTML = '';

    skillList.forEach(skill => {
        const card = document.createElement('article');
        card.className = 'skill-card';

        const formats = skill.formats || [];
        const badges = formats
            .map(format => `<span class="badge">✓ ${format}</span>`)
            .join('');

        card.innerHTML = `
            <h3 class="title">${skill.title}</h3>
            <p class="description">${skill.description}</p>
            <p class="price">$${skill.price}/hour</p>
            <p class="provider-name">Tutor: ${skill.tutor}</p>
            <div class="card-footer">
                <div class="format-badges">${badges}</div>
            </div>
        `;

        // Click a card to highlight it and see its details
        card.addEventListener('click', () => {
            document.querySelectorAll('.skill-card')
                .forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            alert(`${skill.title}\nTutor: ${skill.tutor}\nPrice: $${skill.price}/hour\nAvailable: ${skill.formats.join(' and ')}`);
        });

        container.appendChild(card);
    });
}

const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        const filtered = filterSkillsByCategory(skills, category);
        renderSkills(filtered);

        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });

});

document.addEventListener('DOMContentLoaded', async () => {
    skills = await loadSkills();
    renderSkills(skills);
});

const rateInput = document.getElementById('rate-input');
const hoursInput = document.getElementById('hours-input');
const calculateButton = document.getElementById('calculate-btn');
const costResult = document.getElementById('cost-result');

calculateButton.addEventListener('click', () => {
    const rate = parseFloat(rateInput.value);
    const hours = parseFloat(hoursInput.value);

    // Check for empty or negative values
    if (isNaN(rate) || isNaN(hours) || rate < 0 || hours < 0) {
        costResult.textContent = 'Please enter a valid rate and number of hours.';
        return;
    }

    const total = calculateTotalCost(rate, hours);
    costResult.textContent = `Total cost: $${total.toFixed(2)}`;
});

const matchButton = document.getElementById('match-btn');

matchButton.addEventListener('click', () => {
    const userNeeds = {
        category: document.getElementById('category-select').value,
        maxPrice: parseFloat(document.getElementById('max-price-input').value)
    };

    const matches = matchSkillsToUser(userNeeds, skills);
    renderSkills(matches, document.getElementById('match-results'));
});