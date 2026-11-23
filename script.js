// Skill data (from database)
let skills = [];

// load data
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadSkills();

    // Set up form submission
    const form = document.getElementById('skill-form');
    form.addEventListener('submit', handleSkillSubmit);
});

// ===== Load skills from the API =====

async function loadSkills() {
    const loadingElement = document.getElementById('loading');
    const skillsContainer = document.getElementById('skill-grid');
    const errorElement = document.getElementById('error');

    // Show loading, hide everything else
    loadingElement.style.display = 'block';
    skillsContainer.style.display = 'none';
    errorElement.style.display = 'none';

    try {
        skills = await window.apiService.fetchSkills();

        // Hide loading, show skills
        loadingElement.style.display = 'none';
        skillsContainer.style.display = 'grid';

        displaySkills(skills);
        return skills;
    } catch (error) {
        // Hide loading, show error
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        errorElement.textContent = 'Failed to load skills. Please try again.';
        console.error('Technical details:', error);
        return [];
    }
}

// ===== Display skill cards =====
function displaySkills(skillList, container = document.getElementById('skill-grid')) {
    // Clear any existing content
    container.innerHTML = '';

    // Create a card for each skill
    skillList.forEach(skill => {
        const card = createSkillCard(skill);
        container.appendChild(card);
    });
}

function createSkillCard(skill) {
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
            <p class="provider-name">Tutor: ${skill.tutor || 'Not listed'}</p>
            <div class="card-footer">
                <div class="format-badges">${badges}</div>
            </div>
        `;

    // Click a card to highlight it and see its details
    card.addEventListener('click', () => {
        document.querySelectorAll('.skill-card')
            .forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        alert(`${skill.title}\nTutor: ${skill.tutor || 'Not listed'}\nPrice: $${skill.price}/hour`);
    });

    return card;
}

// ===== Handle form submissions =====

async function handleSkillSubmit(event) {
    event.preventDefault(); // Prevent page reload

    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    // Hide previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    // Gather form data
    const skillData = {
        title: document.getElementById('skill-title').value,
        category: document.getElementById('skill-category').value,
        price: parseFloat(document.getElementById('skill-price').value),
        description: document.getElementById('skill-description').value
    };

    try {
        // Send to API
        await window.apiService.createSkill(skillData);

        // Show success message
        successMessage.textContent = 'Skill added successfully!';
        successMessage.style.display = 'block';

        // Clear form
        event.target.reset();

        // Reload skills to show the new one
        await loadSkills();
    } catch (error) {
        // Show error message
        errorMessage.textContent = 'Failed to add skill. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// ===== Filter buttons =====

const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        const filtered = filterSkillsByCategory(skills, category);
        displaySkills(filtered);

        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });

});

// ===== Cost calculator =====

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

// ===== Find My Match =====

const matchButton = document.getElementById('match-btn');

matchButton.addEventListener('click', () => {
    const userNeeds = {
        category: document.getElementById('category-select').value,
        maxPrice: parseFloat(document.getElementById('max-price-input').value)
    };

    const matches = matchSkillsToUser(userNeeds, skills);
    displaySkills(matches, document.getElementById('match-results'));
});