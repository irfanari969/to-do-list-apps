let tasks = []
let taskIdCounter = 1
let currentView = "completed"
let alertPanelVisible = false

const updateTime = () => {
    const now = new Date()
    const timeString = now.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
 })
 document.getElementById("currentTime").textContent = timeString
}

const addTask = () => {
    const taskInput = document.getElementById("taskInput")
    const taskDate = document.getElementById("taskDate")
    const prioritySelect = document.getElementById("prioritySelect")

    const taskText = taskInput.value.trim()
    const selectedDate = taskDate.value
    const priority = prioritySelect.value

    if (taskText === "") {
        alert("Silahkan masukkan tugas terlebih dahulu!")
        return
    }

    if (selectedDate === "") {
        alert("Pilih tanggal tugas!")
        return
    }

    const task = {
        id: taskIdCounter++,
        text: taskText,
        priority: priority,
        completed: false,
        dueDate: selectedDate,
        createdAt: new Date()
    }

    tasks.push(task)
    taskInput.value = ""
    taskDate.value = ""

    renderTasks()
    updateStats()
}

const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        task.completed = !task.completed

        if (task.completed) {
            task.completedAt = new Date()
        } else {
            task.completedAt = null
        }
        renderTasks()
        updateStats()
    }
}

const deleteTask = (taskId) => {
    if (confirm("Apakah anda yakin ingin menghapus tugas ini?")) {
        tasks = tasks.filter(t => t.id !==taskId)
        renderTasks()
        updateStats()
    }
}

const deleteAllTasks = () => {
    if (tasks.length === 0) {
        alert("Tidak ada tugas untuk dihapus!")
        return
    }

    const confirmMessage = `Apakah anda yakin ingin menghapus SEMUA tugas?\n\nTotal: ${tasks.length} 
    tugas\nPending: ${tasks.filter(t => !t.completed).length} 
    tugas\nSelesai: ${tasks.filter(t => t.completed).length} 
    tugas\n\nTindakan ini tidak dapat dibatalkan!`

    if (confirm(confirmMessage)) {
        tasks = []
        renderTasks()
        updateStats()
        alert("Semua tugas berhasil dihapus!")
    }
}

const deleteCompletedTasks = () => {
    const completedTasks = tasks.filter(t => t.completed)

    if (completedTasks.length === 0) {
        alert("Tidak ada tugas selesai untuk dihapus!")
        return
    }

    const confirmMessage = `Apakah anda yakin ingin menghapus 
    ${completedTasks.length} tugas yan sudah selesai?\n\nTindakan ini tidak dapat dibatalkan!`

    if (confirm(confirmMessage)) {
        tasks = tasks.filter(t => !t.completed)
        renderTasks()
        updateStats()
        alert(`${completedTasks.length} tugas selesai berhasil dihapus`)
    }
}

const showView = (view) => {
    currentView = view

    document.getElementById("pendingBtn").classList.toggle("active", view === "pending")
    document.getElementById("completedBtn").classList.toggle("active", view === "completed")

    renderTasks()
}

const renderTasks = () => {
    const tasksList = document.getElementById("tasksList")

    const filteredTasks = tasks.filter(task => {
        if (currentView === "pending") {
            return !task.completed
    } else {
        return task.completed
    }
 })

 if(filteredTasks.length === 0) {
    const emptyMessange = currentView === "pending"
    ? { icon: "📝", title: "Belum ada tugas aktif", subtitle: "Tambahkan tugas pertama anda untuk memulai!"}
    : { icon: "✅", title: "Belum ada tugas selesai", subtitle: "Selesaikan tugas untuk melihatnya di sini!"}
    

    tasksList.innerHTML = `
    <div class="empty-state">
        <div style="font-size: 48px; margin-bottom: 20px;">${emptyMessange.icon}</div>
        <h3>${emptyMessange.title}</h3>
        <p>${emptyMessange.subtitle}</p>
    </div>
    `
    return
}

const sortedTasks = [...filteredTasks].sort((a,b)=>{
    if (currentView === "pending") {

        const dateA = new Date(a.dueDate)
        const dateB = new Date(b.dueDate)
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB
        }

        const priorityOrder = {
            high: 3, medium: 2, low: 1
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
    } else {
        return new Date(b.completedAt) - new Date(a.completedAt)
    }
})

tasksList.innerHTML = sortedTasks.map(task => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const isOverdue = dueDate < today && !task.completed
    const isToday = dueDate.toDateString() === today.toDateString()
    const formattedDueDate = dueDate.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    })

let dateDisplay = `🗓️ ${formattedDueDate}`
if (!task.completed) {
    if (isOverdue) dateDisplay += "(Terlambat!)"
    if (isToday) dateDisplay += "(Hari ini)"
}

const completedDateDisplay = task.completedAt ?
    new Date(task.completedAt).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }): ""

return `
<div class="task-item ${task.priority} ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}">
    <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id})"
    >
    <div class="task-content">
        <div class="task-text ${task.completed ? "completed" : ""}">
        ${task.text}
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <span class="task-priority priority-${task.priority}">
                ${task.priority} priority
            </span>
            <span class="task-date ${isOverdue ? "date-overdue" :""} ${isToday ? "date-today" : ""}">
                ${dateDisplay}
            </span>
            ${task.completed ? `
                <span class="completed-date">
                    ✅ Selesai: ${completedDateDisplay}
                </span>
            ` : ""}
        </div>
    </div>
    <div class="task-status ${task.completed ? "status-done" : "status-pending"}">
        ${task.completed ? "DONE" : "PENDING"}
    </div>
    <button class="delete-btn" onclick="deleteTask(${task.id})">
        🗑️ Hapus
    </button>
</div>
`
}).join("")
}

const updateStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed

    document.getElementById("totalTasks").textContent = total
    document.getElementById("pendingTasks").textContent = pending
    document.getElementById("completedTasks").textContent = completed

    checkAlerts()
}

document.getElementById("taskInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask()
    }
})

const init = () => {
    updateTime()
    setInterval(updateTime, 1000)

    const today = new Date().toISOString().split("T")[0]
    document.getElementById("taskDate").value = today

    renderTasks()
    updateStats()

    autoShowCriticalAlerts()

    setInterval(() => {
        updateStats()
        autoShowCriticalAlerts()
    }, 300000)
}

const toggleAlertPanel = () => {
    alertPanelVisible = !alertPanelVisible
    const panel = document.getElementById("alertPanel")

    if(alertPanelVisible) {
        panel.classList.add("show")
        updateAlertPanel()
    } else {
        panel.classList.remove("show")
    }
}

const checkAlerts = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const pendingTasks = tasks.filter(task => !task.completed)

    const alerts = []

    pendingTasks.forEach(task => {
        const dueDate = new Date(task.dueDate)
        const diffTime = dueDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {

            alerts.push({
                task: task,
                type: "overdue",
                message: `Terlambat ${Math.abs(diffDays)} hari`,
                priority: 3
            })
        } else if (diffDays === 0) {

            alerts.push({
                task: task,
                type: `due-today`,
                message: `Jatuh tempo hari ini`,
                priority: 2
            })
        } else if (diffDays === 1) {

            alerts.push({
                task: task,
                type: "due-soon",
                message: `Jatuh tempo besok`,
                priority: 1
            })
        }else if (diffDays === 3) {

            alerts.push({
                task: task,
                type: `due-soon`,
                message: `Jatuh tempo ${diffDays} hari lagi`,
                priority: 1
            })
        }
    })

    alerts.sort((a, b) => b.priority - a.priority)

    updateNotificationBadge(alerts.length)
    return alerts
}

const updateNotificationBadge = (count) => {
    const badge = document.getElementById("notificationBadge")
    const icon = document.getElementById("notificationIcon")

    if (count > 0) {
        badge.textContent = count
        badge.style.display = "flex"
        icon.style.animation = "pulse 2s infinite"
    } else {
        badge.style.display = "none"
        icon.style.animation = "none"
    }
}

const updateAlertPanel = () => {
    const alerts = checkAlerts()
    const alertContent = document.getElementById("alertContent")

    if (alerts.length === 0) {
        alertContent.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 15px;">😌</div>
                <h3>Tidak ada peringatan</h3>
                <p>Semua tugas dalam jadwal yang baik!</p>
            </div> 
        `
        return
    }

    alertContent.innerHTML = alerts.map(alert => {
        const dueDate = new Date(alert.task.dueDate)
        const formattedDate = dueDate.toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short"
        })

        const priorityColor = {
            high: "#ff4757",
            medium: "#ffa502",
            low: "#2ed573"
        }

        return `
            <div class="alert-item ${alert.type}">
                <div class="alert-task-text">${alert.task.text}</div>
                <div class="alert-task-date">
                    <span>🗓️ ${formattedDate}</span>
                    <span class="alert-badge ${alert.type}">${alert.message}</span>
                    <span class="alert-badge" style="background: ${priorityColor[alert.task.priority]}">
                        ${alert.task.priority.toUpperCase()}
                    </span>
                </div>
            </div>
        `
    }).join('')
}

const autoShowCriticalAlerts = () => {
    const alerts = checkAlerts()
    const criticalAlerts = alerts.filter(alert =>
        alert.type === "overdue" || alert.type === "due-today"
    )
     
    if (criticalAlerts.length > 0 && !alertPanelVisible) {

        setTimeout(() => {
            if (!alertPanelVisible) {
                toggleAlertPanel()

                setTimeout(() => {
                    if (alertPanelVisible) {
                        toggleAlertPanel()
                    }
                }, 10000)
            }
        }, 2000)
    }
}


init()
