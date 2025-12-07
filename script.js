const lifeDash = {
    // --- Initial Data Structures ---
    HABITS: [
        { id: 'water', name: 'Drink 8 Glasses of Water', weight: 3 },
        { id: 'exercise', name: '30 min Exercise', weight: 4 },
        { id: 'read', name: 'Read for 15 min', weight: 2 },
        { id: 'sleep', name: 'Bed before 11 PM', weight: 3 }
    ],
    STORAGE_KEY: 'lifeDashData',
    
    // --- LocalStorage Management ---
    loadData: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    saveData: function(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // --- Initialization ---
    init: function() {
        this.renderHabits();
        this.loadHabitStates();
        this.loadMoodStress();
        this.loadMeals();
        this.renderToDos();
        this.setupEventListeners();
    },

    // --- Event Listeners ---
    setupEventListeners: function() {
        document.getElementById('theme-toggle').addEventListener('click', this.toggleTheme);

        // Habit checkboxes listener (using event delegation)
        document.getElementById('habit-list').addEventListener('change', (e) => {
            if (e.target.matches('.habit-checkbox')) {
                this.saveHabitState(e.target.id, e.target.checked);
            }
        });
    },

    // --- Feature: Habit Tracker ---
    renderHabits: function() {
        const listEl = document.getElementById('habit-list');
        listEl.innerHTML = this.HABITS.map(habit => `
            <div class="habit-item" id="habit-${habit.id}">
                <label>
                    <input type="checkbox" id="${habit.id}" class="habit-checkbox">
                    <span>${habit.name}</span>
                </label>
            </div>
        `).join('');
    },

    loadHabitStates: function() {
        const data = this.loadData();
        const habitStates = data.habitStates || {};

        this.HABITS.forEach(habit => {
            const checkbox = document.getElementById(habit.id);
            if (checkbox) {
                checkbox.checked = !!habitStates[habit.id];
                checkbox.parentElement.parentElement.classList.toggle('habit-done', checkbox.checked);
            }
        });
    },

    saveHabitState: function(id, isChecked) {
        const data = this.loadData();
        data.habitStates = data.habitStates || {};
        data.habitStates[id] = isChecked;
        this.saveData(data);
        
        // Toggle visual class
        const habitEl = document.getElementById(`habit-${id}`);
        if (habitEl) {
            habitEl.classList.toggle('habit-done', isChecked);
        }
    },

    // --- Feature: Mood & Stress Tracker ---
    loadMoodStress: function() {
        const data = this.loadData();
        const mood = data.mood || '5';
        const stress = data.stress || '5';

        document.getElementById('mood-select').value = mood;
        document.getElementById('stress-slider').value = stress;
        document.getElementById('stress-value').textContent = stress;
    },

    saveMoodStress: function() {
        const mood = document.getElementById('mood-select').value;
        const stress = document.getElementById('stress-slider').value;

        const data = this.loadData();
        data.mood = mood;
        data.stress = stress;
        this.saveData(data);
    },

    // --- Feature: Meal & Calorie Planner ---
    loadMeals: function() {
        const data = this.loadData();
        const meals = data.meals || {};
        
        document.getElementById('breakfast-meal').value = meals.breakfast || '';
        document.getElementById('lunch-meal').value = meals.lunch || '';
        document.getElementById('dinner-meal').value = meals.dinner || '';
        document.getElementById('calorie-count').value = meals.calories || '';
    },

    saveMeals: function() {
        const meals = {
            breakfast: document.getElementById('breakfast-meal').value,
            lunch: document.getElementById('lunch-meal').value,
            dinner: document.getElementById('dinner-meal').value,
            calories: document.getElementById('calorie-count').value,
        };

        const data = this.loadData();
        data.meals = meals;
        this.saveData(data);
    },

    generateSimplePlan: function() {
        document.getElementById('breakfast-meal').value = 'Oatmeal, Fruit';
        document.getElementById('lunch-meal').value = 'Chicken Salad';
        document.getElementById('dinner-meal').value = 'Stir-fry Vegetables';
        document.getElementById('calorie-count').value = '1800';
        this.saveMeals();
        alert('Simple plan generated! Remember to adjust calories for accuracy.');
    },

    // --- Feature: To-Do + Routine Manager ---
    loadToDos: function() {
        const data = this.loadData();
        return data.todos || [];
    },

    saveToDos: function(todos) {
        const data = this.loadData();
        data.todos = todos;
        this.saveData(data);
    },

    renderToDos: function() {
        const todos = this.loadToDos();
        const listEl = document.getElementById('todo-list');
        listEl.innerHTML = todos.map((item, index) => `
            <div class="todo-item ${item.done ? 'todo-done' : ''}" id="todo-${index}">
                <label>
                    <input type="checkbox" ${item.done ? 'checked' : ''} onclick="lifeDash.toggleTodoDone(${index})">
                    <span>${item.text}</span>
                </label>
                <button onclick="lifeDash.deleteTodoItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    },

    addTodoItem: function() {
        const inputEl = document.getElementById('new-todo-input');
        const text = inputEl.value.trim();
        if (text === '') return;

        const todos = this.loadToDos();
        todos.push({ text: text, done: false });
        this.saveToDos(todos);
        this.renderToDos();
        inputEl.value = ''; // Clear input
    },

    toggleTodoDone: function(index) {
        const todos = this.loadToDos();
        if (todos[index]) {
            todos[index].done = !todos[index].done;
            this.saveToDos(todos);
            this.renderToDos();
        }
    },

    deleteTodoItem: function(index) {
        const todos = this.loadToDos();
        todos.splice(index, 1);
        this.saveToDos(todos);
        this.renderToDos();
    },

    // --- Feature: Daily Score System ---
    calculateDailyScore: function() {
        const data = this.loadData();
        
        // 1. Habit Score (Max 12 points)
        const habitStates = data.habitStates || {};
        let habitPoints = 0;
        let totalHabitWeight = 0;
        this.HABITS.forEach(habit => {
            totalHabitWeight += habit.weight;
            if (habitStates[habit.id]) {
                habitPoints += habit.weight;
            }
        });
        const habitPct = totalHabitWeight > 0 ? (habitPoints / totalHabitWeight) : 0;
        
        // 2. Mood & Stress Score (Max 10 points)
        // Mood: 1-5 (5 is best). Stress: 1-10 (1 is best, 10 is worst).
        const mood = parseInt(data.mood || 3); // Default neutral
        const stress = parseInt(data.stress || 5); // Default neutral
        
        // Mood Score: (mood / 5) * 5 points
        const moodScore = (mood / 5) * 5;
        
        // Stress Score: ((10 - (stress - 1)) / 10) * 5 points. Low stress is better.
        // Stress 1 = 5 points. Stress 10 = 0.5 points.
        const stressScore = ((10 - stress + 1) / 10) * 5; 
        const moodStressPoints = moodScore + stressScore; // Max 10 points (5+5)
        
        // 3. To-Do Score (Max 8 points)
        const todos = data.todos || [];
        const completedTodos = todos.filter(t => t.done).length;
        const totalTodos = todos.length;
        const todoPct = totalTodos > 0 ? (completedTodos / totalTodos) : 0;
        const todoPoints = todoPct * 8; // Max 8 points

        // Total Max Points: 12 (Habit) + 10 (Mood/Stress) + 8 (To-Do) = 30
        const totalPoints = habitPoints + moodStressPoints + todoPoints;
        const maxPossiblePoints = totalHabitWeight + 10 + 8; // Max 30
        
        // Final Percentage
        const finalPercentage = (totalPoints / maxPossiblePoints) * 100;
        
        // Grade System
        let grade = 'D';
        let message = 'You have a little work to do today. You got this!';
        if (finalPercentage >= 90) {
            grade = 'A';
            message = 'Outstanding day! You crushed your goals.';
        } else if (finalPercentage >= 80) {
            grade = 'B';
            message = 'Great job! A productive and balanced day.';
        } else if (finalPercentage >= 65) {
            grade = 'C';
            message = 'Solid effort! Keep pushing for more consistency.';
        }

        // Display Result
        document.getElementById('score-grade').textContent = grade;
        document.getElementById('score-message').textContent = `${message} (${Math.round(finalPercentage)}%)`;
        
        // Save score for persistence
        data.dailyScore = { grade, percentage: Math.round(finalPercentage), date: new Date().toDateString() };
        this.saveData(data);
    },
    
    // --- Feature: Light/Dark Mode ---
    toggleTheme: function() {
        const body = document.body;
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Update icon
        const icon = document.getElementById('theme-toggle').querySelector('i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        
        // Save preference
        localStorage.setItem('lifeDash-theme', isDark ? 'dark' : 'light');
    },

    loadTheme: function() {
        const savedTheme = localStorage.getItem('lifeDash-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').querySelector('i').className = 'fas fa-sun';
        }
    }
};

// Start the app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    lifeDash.loadTheme();
    lifeDash.init();
    lifeDash.calculateDailyScore(); // Calculate on load for persistence check
});
