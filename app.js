// AL 应用 - 日常生活助手

class ALApp {
    constructor() {
        this.data = this.loadData();
        this.currentTab = 'todo';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.render();
    }

    setupEventListeners() {
        // 标签页切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // 待办
        document.getElementById('addTodoBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 日程
        document.getElementById('addScheduleBtn').addEventListener('click', () => this.addSchedule());

        // 支出
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.addExpense());
        document.getElementById('expenseAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExpense();
        });

        // 习惯
        document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());
        document.getElementById('habitName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });

        // 导出和清空
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());
    }

    setupTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeButton();
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const theme = document.documentElement.getAttribute('data-theme');
        document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        this.currentTab = tab;
    }

    // 待办事项
    addTodo() {
        const input = document.getElementById('todoInput');
        const category = document.getElementById('todoCategory').value;
        const text = input.value.trim();

        if (!text) {
            alert('请输入任务内容');
            return;
        }

        if (!this.data.todos) this.data.todos = [];
        this.data.todos.push({
            id: Date.now(),
            text,
            category,
            completed: false,
            createdAt: new Date().toISOString()
        });

        input.value = '';
        this.saveData();
        this.renderTodos();
    }

    toggleTodo(id) {
        const todo = this.data.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveData();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        this.data.todos = this.data.todos.filter(t => t.id !== id);
        this.saveData();
        this.renderTodos();
    }

    renderTodos() {
        const list = document.getElementById('todoList');
        const todos = this.data.todos || [];

        if (todos.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>还没有任何任务，添加一个开始吧！</p></div>';
        } else {
            list.innerHTML = todos.map(todo => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="app.toggleTodo(${todo.id})">
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <span class="todo-category">${this.getCategoryLabel(todo.category)}</span>
                    </div>
                    <div class="todo-actions">
                        <button class="btn btn-sm btn-danger" onclick="app.deleteTodo(${todo.id})">删除</button>
                    </div>
                </div>
            `).join('');
        }

        this.updateTodoStats();
    }

    updateTodoStats() {
        const todos = this.data.todos || [];
        const completed = todos.filter(t => t.completed).length;
        const total = todos.length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('todoCount').textContent = total;
        document.getElementById('todoCompleted').textContent = completed;
        document.getElementById('todoProgress').textContent = percentage + '%';
    }

    // 日程
    addSchedule() {
        const title = document.getElementById('scheduleTitle').value.trim();
        const time = document.getElementById('scheduleTime').value;
        const location = document.getElementById('scheduleLocation').value.trim();

        if (!title || !time) {
            alert('请填写事件标题和时间');
            return;
        }

        if (!this.data.schedules) this.data.schedules = [];
        this.data.schedules.push({
            id: Date.now(),
            title,
            time,
            location,
            createdAt: new Date().toISOString()
        });

        document.getElementById('scheduleTitle').value = '';
        document.getElementById('scheduleTime').value = '';
        document.getElementById('scheduleLocation').value = '';
        this.saveData();
        this.renderSchedules();
    }

    deleteSchedule(id) {
        this.data.schedules = this.data.schedules.filter(s => s.id !== id);
        this.saveData();
        this.renderSchedules();
    }

    renderSchedules() {
        const list = document.getElementById('scheduleList');
        const schedules = (this.data.schedules || []).sort((a, b) => new Date(a.time) - new Date(b.time));

        if (schedules.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>还没有日程安排</p></div>';
        } else {
            list.innerHTML = schedules.map(schedule => {
                const date = new Date(schedule.time).toLocaleString('zh-CN');
                return `
                    <div class="schedule-item">
                        <div class="schedule-info">
                            <h3>${this.escapeHtml(schedule.title)}</h3>
                            <div class="schedule-time">📍 ${date}</div>
                            ${schedule.location ? `<div class="schedule-location">📌 ${this.escapeHtml(schedule.location)}</div>` : ''}
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteSchedule(${schedule.id})">删除</button>
                    </div>
                `;
            }).join('');
        }
    }

    // 支出
    addExpense() {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const note = document.getElementById('expenseNote').value.trim();

        if (!amount || amount <= 0) {
            alert('请输入有效的金额');
            return;
        }

        if (!this.data.expenses) this.data.expenses = [];
        this.data.expenses.push({
            id: Date.now(),
            amount,
            category,
            note,
            date: new Date().toISOString()
        });

        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseNote').value = '';
        this.saveData();
        this.renderExpenses();
    }

    deleteExpense(id) {
        this.data.expenses = this.data.expenses.filter(e => e.id !== id);
        this.saveData();
        this.renderExpenses();
    }

    renderExpenses() {
        const list = document.getElementById('expenseList');
        const expenses = this.data.expenses || [];

        if (expenses.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💰</div><p>还没有支出记录</p></div>';
        } else {
            list.innerHTML = expenses.map(expense => {
                const date = new Date(expense.date).toLocaleDateString('zh-CN');
                return `
                    <div class="expense-item">
                        <div class="expense-detail">
                            <h4>${this.escapeHtml(expense.note || this.getCategoryLabel(expense.category))}</h4>
                            <div class="expense-category">${this.getCategoryLabel(expense.category)}</div>
                            <div class="expense-date">${date}</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="expense-amount">-¥${expense.amount.toFixed(2)}</span>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteExpense(${expense.id})">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.updateExpenseStats();
    }

    updateExpenseStats() {
        const expenses = this.data.expenses || [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayExpense = expenses
            .filter(e => new Date(e.date).toDateString() === today.toDateString())
            .reduce((sum, e) => sum + e.amount, 0);

        const monthExpense = expenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStart && expenseDate < new Date(monthStart.getTime() + 30 * 24 * 60 * 60 * 1000);
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const days = Math.ceil((now - monthStart) / (1000 * 60 * 60 * 24)) || 1;
        const avgExpense = monthExpense / days;

        document.getElementById('todayExpense').textContent = `¥${todayExpense.toFixed(2)}`;
        document.getElementById('monthExpense').textContent = `¥${monthExpense.toFixed(2)}`;
        document.getElementById('avgExpense').textContent = `¥${avgExpense.toFixed(2)}`;
    }

    // 习惯
    addHabit() {
        const name = document.getElementById('habitName').value.trim();
        const frequency = document.getElementById('habitFrequency').value;

        if (!name) {
            alert('请输入习惯名称');
            return;
        }

        if (!this.data.habits) this.data.habits = [];
        this.data.habits.push({
            id: Date.now(),
            name,
            frequency,
            completedDays: 0,
            streak: 0,
            lastCompleted: null,
            createdAt: new Date().toISOString()
        });

        document.getElementById('habitName').value = '';
        this.saveData();
        this.renderHabits();
    }

    completeHabit(id) {
        const habit = this.data.habits.find(h => h.id === id);
        if (habit) {
            const today = new Date().toDateString();
            if (habit.lastCompleted !== today) {
                habit.completedDays++;
                habit.lastCompleted = today;
                // 简单的连续天数计算
                habit.streak = habit.completedDays;
                this.saveData();
                this.renderHabits();
            }
        }
    }

    deleteHabit(id) {
        this.data.habits = this.data.habits.filter(h => h.id !== id);
        this.saveData();
        this.renderHabits();
    }

    renderHabits() {
        const list = document.getElementById('habitList');
        const habits = this.data.habits || [];

        if (habits.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p>还没有任何习惯，创建一个开始养成好习惯吧！</p></div>';
        } else {
            list.innerHTML = habits.map(habit => {
                const today = new Date().toDateString();
                const isCompletedToday = habit.lastCompleted === today;
                return `
                    <div class="habit-card">
                        <div class="habit-header">
                            <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                            <span class="habit-frequency">${this.getFrequencyLabel(habit.frequency)}</span>
                        </div>
                        <div class="habit-stats">
                            <div class="habit-stat">
                                <div class="habit-stat-value">${habit.completedDays}</div>
                                <div class="habit-stat-label">完成次数</div>
                            </div>
                            <div class="habit-stat">
                                <div class="habit-stat-value">${habit.streak}</div>
                                <div class="habit-stat-label">连续天数</div>
                            </div>
                            <div class="habit-stat">
                                <div class="habit-stat-value">${isCompletedToday ? '✓' : '○'}</div>
                                <div class="habit-stat-label">今日状态</div>
                            </div>
                        </div>
                        <div class="habit-actions">
                            <button class="btn btn-sm ${isCompletedToday ? 'btn-success' : 'btn-primary'}" 
                                    onclick="app.completeHabit(${habit.id})" 
                                    ${isCompletedToday ? 'disabled' : ''}>
                                ${isCompletedToday ? '今日已完成' : '今日完成'}
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteHabit(${habit.id})">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 统计
    renderStats() {
        const todos = this.data.todos || [];
        const habits = this.data.habits || [];
        const expenses = this.data.expenses || [];
        const schedules = this.data.schedules || [];

        // 任务完成率
        const todoCompleted = todos.filter(t => t.completed).length;
        const todoRate = todos.length === 0 ? 0 : Math.round((todoCompleted / todos.length) * 100);
        document.getElementById('statTodoRate').textContent = todoRate + '%';
        document.getElementById('statTodoProgress').style.width = todoRate + '%';

        // 习惯坚持
        const activeHabits = habits.filter(h => h.streak > 0);
        if (activeHabits.length > 0) {
            const maxStreak = Math.max(...activeHabits.map(h => h.streak));
            document.getElementById('statHabitStreak').textContent = maxStreak + '天';
            document.getElementById('statHabitInfo').textContent = `${activeHabits.length}个活跃习惯`;
        } else {
            document.getElementById('statHabitStreak').textContent = '0天';
            document.getElementById('statHabitInfo').textContent = '开始创建习惯吧';
        }

        // 支出分析
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthExpense = expenses
            .filter(e => new Date(e.date) >= monthStart)
            .reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('statExpenseMonth').textContent = `¥${monthExpense.toFixed(2)}`;
        document.getElementById('statExpenseInfo').textContent = '本月总支出';

        // 日程统计
        const futureSchedules = schedules.filter(s => new Date(s.time) > now).length;
        document.getElementById('statScheduleCount').textContent = futureSchedules;
        document.getElementById('statScheduleInfo').textContent = '即将到来的事件';
    }

    // 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `al-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('数据已导出！');
    }

    // 清空数据
    clearData() {
        if (confirm('确定要清空所有数据吗？此操作无法撤销！')) {
            this.data = { todos: [], schedules: [], expenses: [], habits: [] };
            this.saveData();
            this.render();
            alert('所有数据已清空！');
        }
    }

    // 工具方法
    getCategoryLabel(category) {
        const labels = {
            work: '🏢 工作',
            life: '🏠 生活',
            health: '❤️ 健康',
            learning: '📚 学习',
            food: '🍔 食物',
            transport: '🚗 交通',
            shopping: '🛍️ 购物',
            entertainment: '🎮 娱乐',
            other: '📌 其他'
        };
        return labels[category] || category;
    }

    getFrequencyLabel(frequency) {
        const labels = {
            daily: '每日',
            weekly: '每周',
            monthly: '每月'
        };
        return labels[frequency] || frequency;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 数据持久化
    saveData() {
        localStorage.setItem('al-app-data', JSON.stringify(this.data));
    }

    loadData() {
        const data = localStorage.getItem('al-app-data');
        return data ? JSON.parse(data) : { todos: [], schedules: [], expenses: [], habits: [] };
    }

    render() {
        this.renderTodos();
        this.renderSchedules();
        this.renderExpenses();
        this.renderHabits();
        this.renderStats();
    }
}

// 初始化应用
const app = new ALApp();