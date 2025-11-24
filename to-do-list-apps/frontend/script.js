const API_URL = 'http://localhost:3000/tasks';

const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const prioritySelect = document.getElementById('prioritySelect');
const tasksList = document.getElementById('tasksList');

let tasks = []; 
let currentView = 'pending'; 
let alertPanelVisible = false;

const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleString("id-ID", {
        weekday: "long", year: "numeric", month: "long", 
        day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    document.getElementById("currentTime").textContent = timeString;
};

const init = () => {
    updateTime();
    setInterval(updateTime, 1000);

    const today = new Date().toISOString().split("T")[0];
    taskDate.value = today;

    fetchTasks();

    setInterval(() => {
        updateStats();
        autoShowCriticalAlerts();
    }, 300000); 
};


async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        tasks = data.map(item => ({
            id: item.id,
            text: item.task_name,
            dueDate: item.due_date,
            priority: item.priority,
            completed: item.completed === 1,
            createdAt: item.created_at
        }));

        renderTasks();
        updateStats();
        autoShowCriticalAlerts();
    } catch (error) { console.error("Gagal load data:", error); }
}

async function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return alert("Silahkan masukkan tugas terlebih dahulu!");
    if (taskDate.value === '') return alert("Pilih tanggal tugas!");

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            task_name: text,
            due_date: taskDate.value,
            priority: prioritySelect.value
        })
    });

    taskInput.value = "";
    fetchTasks();
}

async function toggleTask(id, currentStatus) {
    await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
    });
    fetchTasks();
}

async function deleteTask(id) {
    if(!confirm("Yakin hapus tugas ini?")) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}

async function deleteAllTasks() {
    if (tasks.length === 0) return alert("Tidak ada tugas!");
    
    const confirmMessage = `HAPUS SEMUA TUGAS?\nTotal: ${tasks.length}\nIni permanen!`;
    if(!confirm(confirmMessage)) return;

    await fetch(`${API_URL}/bulk/all`, { method: 'DELETE' });
    fetchTasks();
    alert("Semua tugas berhasil dihapus!");
}

async function deleteCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return alert("Tidak ada tugas selesai!");

    if(!confirm(`Hapus ${completedCount} tugas yang selesai?`)) return;

    await fetch(`${API_URL}/bulk/completed`, { method: 'DELETE' });
    fetchTasks();
}

const showView = (view) => {
    currentView = view;
    document.getElementById("pendingBtn").classList.toggle("active", view === "pending");
    document.getElementById("completedBtn").classList.toggle("active", view === "completed");
    renderTasks();
}

const renderTasks = () => {
    const filteredTasks = tasks.filter(task => {
        return currentView === "pending" ? !task.completed : task.completed;
    });

    const sortedTasks = [...filteredTasks].sort((a,b) => {
        if (currentView === "pending") {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else {
            return b.id - a.id; 
        }
    });

    if(sortedTasks.length === 0) {
        const msg = currentView === "pending" 
            ? {icon: "📝", t: "Belum ada tugas aktif", s: "Tambahkan tugas baru!"} 
            : {icon: "✅", t: "Belum ada tugas selesai", s: "Selesaikan tugas dulu!"};
        tasksList.innerHTML = `<div class="empty-state" style="text-align:center; padding:30px; color:#888;">
            <div style="font-size:40px; margin-bottom:10px;">${msg.icon}</div>
            <h3>${msg.t}</h3><p>${msg.s}</p>
        </div>`;
        return;
    }

    tasksList.innerHTML = sortedTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date(); today.setHours(0,0,0,0);
        const isOverdue = dueDate < today && !task.completed;
        const isToday = dueDate.toDateString() === today.toDateString();
        
        const dateDisplay = isToday ? "Hari ini" : dueDate.toLocaleDateString("id-ID", {day:'numeric', month:'short'});
        
        let badgeColor = '#2ed573';
        if(task.priority === 'high') badgeColor = '#ff4757';
        else if(task.priority === 'medium') badgeColor = '#ffa502';

        return `
        <div class="task-item ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}" 
             style="border-left: 5px solid ${isOverdue ? '#ff4757' : badgeColor}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} 
                   onchange="toggleTask(${task.id}, ${task.completed})">
            
            <div class="task-content">
                <div class="task-text ${task.completed ? "completed" : ""}" 
                     style="${task.completed ? 'text-decoration: line-through; color:#888;' : ''}">
                    ${task.text}
                </div>
                <div style="display:flex; gap:10px; align-items:center; margin-top:5px; font-size:12px;">
                    <span style="background:${badgeColor}; color:white; padding:2px 8px; border-radius:4px; font-size:10px;">
                        ${task.priority.toUpperCase()}
                    </span>
                    <span style="color:${isOverdue ? '#ff4757' : '#666'}; font-weight:${isOverdue?'bold':'normal'}">
                        🗓️ ${dateDisplay} ${isOverdue ? '(Terlambat!)' : ''}
                    </span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
        </div>
        `;
    }).join("");
}

const checkAlerts = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const pendingTasks = tasks.filter(task => !task.completed);
    const alerts = [];

    pendingTasks.forEach(task => {
        if(!task.dueDate) return;
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) alerts.push({ task, type: "overdue", message: `Terlambat ${Math.abs(diffDays)} hari`, priority: 3 });
        else if (diffDays === 0) alerts.push({ task, type: "due-today", message: "Jatuh tempo hari ini", priority: 2 });
        else if (diffDays === 1) alerts.push({ task, type: "due-soon", message: "Jatuh tempo besok", priority: 1 });
    });

    alerts.sort((a, b) => b.priority - a.priority);
    updateNotificationBadge(alerts.length);
    return alerts;
}

const updateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = total - completed;
    document.getElementById("completedTasks").textContent = completed;
    checkAlerts()
}

const updateNotificationBadge = (count) => {
    const badge = document.getElementById("notificationBadge");
    const icon = document.getElementById("notificationIcon");
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "flex";
        icon.style.animation = "pulse 2s infinite";
    } else {
        badge.style.display = "none";
        icon.style.animation = "none";
    }
}

const toggleAlertPanel = () => {
    alertPanelVisible = !alertPanelVisible;
    const panel = document.getElementById("alertPanel");
    if(alertPanelVisible) {
        panel.classList.add("show");
        renderAlertContent();
    } else {
        panel.classList.remove("show");
    }
}

const renderAlertContent = () => {
    const alerts = checkAlerts();
    const alertContent = document.getElementById("alertContent");
    if (alerts.length === 0) {
        alertContent.innerHTML = `<div style="text-align:center; padding:20px; color:#666;"><h3>Aman terkendali 😌</h3></div>`;
        return;
    }
    alertContent.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}" style="padding:10px; margin-bottom:10px; border-left:4px solid ${alert.type==='overdue'?'#ff4757':'#ffa502'}; background:#f8f9fa;">
            <div style="font-weight:bold;">${alert.task.text}</div>
            <div style="font-size:12px; color:#666;">${alert.message}</div>
        </div>
    `).join('');
}

const autoShowCriticalAlerts = () => {
    const alerts = checkAlerts();
    const critical = alerts.filter(a => a.type === "overdue" || a.type === "due-today");
    if (critical.length > 0 && !alertPanelVisible) {
        toggleAlertPanel();
        setTimeout(() => { if(alertPanelVisible) toggleAlertPanel() }, 5000);
    }
}

window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.deleteAllTasks = deleteAllTasks;
window.deleteCompletedTasks = deleteCompletedTasks;
window.showView = showView;
window.toggleAlertPanel = toggleAlertPanel;

init();
taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask() });