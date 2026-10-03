/* ================= TASK DATA ================= */

let tasks =
    JSON.parse(localStorage.getItem("studyTasks")) || [];


/* ================= START APP ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        normalizeOldTasks();

        loadDarkMode();

        showCurrentDate();

        renderTasks();

        updateDashboard();

        updateAnalytics();

        updateGoal();

        updateReminders();

    }
);


/* ================= SAVE TASKS ================= */

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}


/* ================= OLD TASK SUPPORT ================= */

function normalizeOldTasks() {

    tasks = tasks.map(function (task) {

        return {

            id:
                task.id ||
                Date.now() +
                Math.random(),

            text:
                task.text ||
                task.task ||
                "Untitled Task",

            subject:
                task.subject ||
                "Other",

            priority:
                task.priority ||
                "Medium",

            dueDate:
                task.dueDate ||
                "",

            completed:
                task.completed ||
                false,

            createdAt:
                task.createdAt ||
                new Date().toISOString()

        };

    });

    saveTasks();
}


/* ================= DATE ================= */

function getToday() {

    let date = new Date();

    return date.toISOString().split("T")[0];

}


function getTomorrow() {

    let date = new Date();

    date.setDate(
        date.getDate() + 1
    );

    return date.toISOString().split("T")[0];

}


/* ================= SHOW DATE ================= */

function showCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;

    const date = new Date();

    element.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


/* ================= NAVIGATION ================= */

function showSection(
    sectionId,
    clickedButton
) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );

    sections.forEach(
        function (section) {

            section.classList.remove(
                "active-section"
            );

        }
    );


    const selectedSection =
        document.getElementById(
            sectionId
        );

    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    const navButtons =
        document.querySelectorAll(
            ".nav-item"
        );

    navButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );


    if (clickedButton) {

        clickedButton.classList.add(
            "active"
        );

    }
}


/* ================= MODAL ================= */

function openTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );

    if (!modal) return;

    modal.classList.add("show");

}


function closeTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );

    if (!modal) return;

    modal.classList.remove("show");

    clearTaskForm();

}


function clearTaskForm() {

    document.getElementById(
        "taskInput"
    ).value = "";

    document.getElementById(
        "subject"
    ).value = "Java";

    document.getElementById(
        "priority"
    ).value = "Medium";

    document.getElementById(
        "dueDate"
    ).value = "";

}


/* ================= ADD TASK ================= */

function addTask() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    const subject =
        document.getElementById(
            "subject"
        );

    const priority =
        document.getElementById(
            "priority"
        );

    const dueDate =
        document.getElementById(
            "dueDate"
        );


    const taskText =
        taskInput.value.trim();


    if (taskText === "") {

        alert(
            "Please enter a task!"
        );

        return;
    }


    if (dueDate.value === "") {

        alert(
            "Please select a due date!"
        );

        return;
    }


    const newTask = {

        id:
            Date.now(),

        text:
            taskText,

        subject:
            subject.value,

        priority:
            priority.value,

        dueDate:
            dueDate.value,

        completed:
            false,

        createdAt:
            new Date().toISOString()

    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();

    updateGoal();

    updateReminders();

    closeTaskModal();

}


/* ================= RENDER TASKS ================= */

function renderTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );

    if (!taskList) return;


    const filteredTasks =
        getFilteredTasks();


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>📚 No tasks found</h3>
                <p>Add a new study task to get started.</p>
            </div>
        `;

        return;
    }


    filteredTasks.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "task-item";


            item.style.borderLeftColor =
                getPriorityColor(
                    task.priority
                );


            item.innerHTML = `

                <div class="task-info">

                    <div
                        class="task-name ${
                            task.completed
                                ? "completed"
                                : ""
                        }"
                    >
                        ${escapeHTML(task.text)}
                    </div>

                    <div class="task-meta">

                        📘 ${escapeHTML(task.subject)}
                        &nbsp; • &nbsp;

                        ${escapeHTML(task.priority)}
                        Priority

                        &nbsp; • &nbsp;

                        Due:
                        ${formatDate(task.dueDate)}

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="complete-btn"
                        onclick="toggleTask(${task.id})"
                    >
                        ${
                            task.completed
                                ? "↩️"
                                : "✓"
                        }
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})"
                    >
                        🗑️
                    </button>

                </div>

            `;


            taskList.appendChild(item);

        }
    );
}


/* ================= FILTER ================= */

function getFilteredTasks() {

    const searchElement =
        document.getElementById(
            "searchInput"
        );

    const subjectElement =
        document.getElementById(
            "subjectFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
            : "";


    const subject =
        subjectElement
            ? subjectElement.value
            : "all";


    return tasks.filter(
        function (task) {

            const matchesSearch =
                task.text
                    .toLowerCase()
                    .includes(search);


            const matchesSubject =
                subject === "all" ||
                task.subject === subject;


            return (
                matchesSearch &&
                matchesSubject
            );

        }
    );
}


/* ================= SEARCH ================= */

function searchTasks() {

    renderTasks();

}


/* ================= COMPLETE TASK ================= */

function toggleTask(id) {

    const task =
        tasks.find(
            function (task) {

                return task.id == id;

            }
        );


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();

    updateGoal();

    updateReminders();

}


/* ================= DELETE TASK ================= */

function deleteTask(id) {

    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            function (task) {

                return task.id != id;

            }
        );


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();

    updateGoal();

    updateReminders();

}


/* ================= CLEAR ALL ================= */

function clearAllTasks() {

    if (tasks.length === 0) {

        alert(
            "There are no tasks to clear."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete all tasks?"
        );


    if (!confirmed) return;


    tasks = [];

    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();

    updateGoal();

    updateReminders();

}


/* ================= PRIORITY COLOR ================= */

function getPriorityColor(
    priority
) {

    if (priority === "High") {

        return "#ef4444";

    }


    if (priority === "Medium") {

        return "#f59e0b";

    }


    return "#16a34a";

}


/* ================= DATE FORMAT ================= */

function formatDate(dateString) {

    if (!dateString) {

        return "No date";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    updateStats();

    updateProgress();

    updateDashboardTasks();

    updateSmartInsight();

    updateStreak();

}


/* ================= STATS ================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        total - completed;


    const today =
        getToday();


    const overdue =
        tasks.filter(
            function (task) {

                return (
                    !task.completed &&
                    task.dueDate &&
                    task.dueDate < today
                );

            }
        ).length;


    setText(
        "totalCount",
        total
    );

    setText(
        "completedCount",
        completed
    );

    setText(
        "pendingCount",
        pending
    );

    setText(
        "overdueCount",
        overdue
    );

}


/* ================= PROGRESS ================= */

function updateProgress() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) *
                100
            );

    }


    setText(
        "progressPercentage",
        percentage + "%"
    );


    setText(
        "dailyProgressText",
        `${completed} of ${total} tasks completed`
    );


    const bar =
        document.getElementById(
            "mainProgressBar"
        );


    if (bar) {

        bar.style.width =
            percentage + "%";

    }

}


/* ================= DASHBOARD TASKS ================= */

function updateDashboardTasks() {

    const container =
        document.getElementById(
            "dashboardTasks"
        );


    if (!container) return;


    const today =
        getToday();


    const todayTasks =
        tasks.filter(
            function (task) {

                return (
                    task.dueDate === today
                );

            }
        );


    container.innerHTML = "";


    if (todayTasks.length === 0) {

        container.innerHTML = `
            <p style="color: var(--muted);">
                No tasks due today.
            </p>
        `;

        return;
    }


    todayTasks.forEach(
        function (task) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "dashboard-task";


            div.innerHTML = `

                <div>

                    <strong
                        style="
                        ${
                            task.completed
                                ? "text-decoration: line-through; opacity: 0.5;"
                                : ""
                        }
                        "
                    >
                        ${escapeHTML(task.text)}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(task.subject)}
                    </small>

                </div>


                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id})"
                >
                    ${
                        task.completed
                            ? "↩️"
                            : "✓"
                    }
                </button>

            `;


            container.appendChild(div);

        }
    );

}


/* ================= SMART INSIGHT ================= */

function updateSmartInsight() {

    const element =
        document.getElementById(
            "smartInsight"
        );


    if (!element) return;


    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    if (total === 0) {

        element.textContent =
            "Add your first study task and start building your study plan.";

        return;
    }


    if (completed === total) {

        element.textContent =
            "Excellent! All your current tasks are completed. You can add new tasks for your next study session.";

        return;
    }


    const highPriority =
        tasks.filter(
            function (task) {

                return (
                    task.priority === "High" &&
                    !task.completed
                );

            }
        );


    if (highPriority.length > 0) {

        element.textContent =
            "You have high-priority tasks pending. Consider completing them first.";

        return;
    }


    const pending =
        total - completed;


    if (pending >= 5) {

        element.textContent =
            "You have several pending tasks. Try completing them one by one instead of studying everything at once.";

        return;
    }


    element.textContent =
        "Keep going! You are making progress. Complete your remaining tasks to improve your study streak.";

}


/* ================= STREAK ================= */

function calculateStreak() {

    const completedDates = [];


    tasks.forEach(
        function (task) {

            if (
                task.completed &&
                task.createdAt
            ) {

                const date =
                    new Date(
                        task.createdAt
                    )
                    .toISOString()
                    .split("T")[0];


                if (
                    !completedDates.includes(
                        date
                    )
                ) {

                    completedDates.push(
                        date
                    );

                }

            }

        }
    );


    completedDates.sort()
        .reverse();


    if (
        completedDates.length === 0
    ) {

        return 0;

    }


    let streak = 0;

    let current =
        new Date();


    for (
        let i = 0;
        i < completedDates.length;
        i++
    ) {

        const date =
            new Date(
                completedDates[i] +
                "T00:00:00"
            );


        const difference =
            Math.floor(
                (
                    current - date
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        if (
            difference === streak
        ) {

            streak++;

            current = date;

        } else {

            break;

        }

    }


    return streak;

}


function updateStreak() {

    const streak =
        calculateStreak();


    setText(
        "streakNumber",
        streak
    );


    const message =
        document.getElementById(
            "streakMessage"
        );


    if (!message) return;


    if (streak === 0) {

        message.textContent =
            "Complete a task today to start your streak!";

    } else if (streak < 3) {

        message.textContent =
            "Good start! Keep going.";

    } else if (streak < 7) {

        message.textContent =
            "Great consistency!";

    } else {

        message.textContent =
            "Amazing study streak!";

    }

}


/* ================= REMINDERS ================= */

function updateReminders() {

    const container =
        document.getElementById(
            "reminderList"
        );


    const countElement =
        document.getElementById(
            "reminderCount"
        );


    if (!container) return;


    const today =
        getToday();


    const tomorrow =
        getTomorrow();


    const reminders =
        tasks.filter(
            function (task) {

                return (
                    !task.completed &&
                    (
                        task.dueDate === today ||
                        task.dueDate === tomorrow
                    )
                );

            }
        );


    if (countElement) {

        countElement.textContent =
            reminders.length;

    }


    container.innerHTML = "";


    if (reminders.length === 0) {

        container.innerHTML = `
            <p style="color: var(--muted);">
                No urgent reminders.
            </p>
        `;

        return;
    }


    reminders.forEach(
        function (task) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "reminder-item";


            const dueText =
                task.dueDate === today
                    ? "Due today"
                    : "Due tomorrow";


            div.innerHTML = `

                <strong>
                    🔔 ${escapeHTML(task.text)}
                </strong>

                <span>
                    ${dueText}
                    •
                    ${escapeHTML(task.subject)}
                </span>

            `;


            container.appendChild(div);

        }
    );

}


/* ================= ANALYTICS ================= */

function updateAnalytics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    let rate = 0;


    if (total > 0) {

        rate =
            Math.round(
                (completed / total) *
                100
            );

    }


    const streak =
        calculateStreak();


    let productivity =
        rate;


    if (streak > 0) {

        productivity =
            Math.min(
                100,
                rate + streak * 2
            );

    }


    setText(
        "analyticsTotal",
        total
    );


    setText(
        "completionRate",
        rate + "%"
    );


    setText(
        "analyticsStreak",
        streak
    );


    setText(
        "productivityScore",
        productivity + "%"
    );


    updateSubjectProgress();

}


/* ================= SUBJECT PROGRESS ================= */

function updateSubjectProgress() {

    const container =
        document.getElementById(
            "subjectProgress"
        );


    if (!container) return;


    container.innerHTML = "";


    const subjects = {};


    tasks.forEach(
        function (task) {

            if (
                !subjects[task.subject]
            ) {

                subjects[
                    task.subject
                ] = {
                    total: 0,
                    completed: 0
                };

            }


            subjects[
                task.subject
            ].total++;


            if (task.completed) {

                subjects[
                    task.subject
                ].completed++;

            }

        }
    );


    const subjectNames =
        Object.keys(subjects);


    if (subjectNames.length === 0) {

        container.innerHTML = `
            <p style="color: var(--muted);">
                Add tasks to see subject progress.
            </p>
        `;

        return;
    }


    subjectNames.forEach(
        function (subject) {

            const data =
                subjects[subject];


            const percentage =
                Math.round(
                    (
                        data.completed /
                        data.total
                    ) * 100
                );


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "subject-progress";


            div.innerHTML = `

                <div
                    class="subject-progress-header"
                >

                    <span>
                        ${escapeHTML(subject)}
                    </span>

                    <span>
                        ${data.completed}
                        /
                        ${data.total}
                    </span>

                </div>


                <div class="progress-track">

                    <div
                        class="progress-fill"
                        style="
                            width: ${percentage}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(div);

        }
    );

}


/* ================= GOAL ================= */

function updateGoal() {

    const input =
        document.getElementById(
            "goalTarget"
        );


    const bar =
        document.getElementById(
            "goalProgressBar"
        );


    const text =
        document.getElementById(
            "goalText"
        );


    if (
        !input ||
        !bar ||
        !text
    ) {

        return;

    }


    let target =
        parseInt(
            input.value
        );


    if (
        !target ||
        target < 1
    ) {

        target = 1;

        input.value = 1;

    }


    const today =
        getToday();


    const completedToday =
        tasks.filter(
            function (task) {

                return (
                    task.completed &&
                    task.dueDate === today
                );

            }
        ).length;


    let percentage =
        Math.round(
            (
                completedToday /
                target
            ) * 100
        );


    percentage =
        Math.min(
            percentage,
            100
        );


    bar.style.width =
        percentage + "%";


    text.textContent =
        `${completedToday} / ${target} tasks completed`;

}


/* ================= DARK MODE ================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    const enabled =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "darkMode",
        enabled
    );


    const toggle =
        document.getElementById(
            "darkModeToggle"
        );


    if (toggle) {

        toggle.checked =
            enabled;

    }

}


function loadDarkMode() {

    const enabled =
        localStorage.getItem(
            "darkMode"
        ) === "true";


    if (enabled) {

        document.body.classList.add(
            "dark"
        );

    }


    const toggle =
        document.getElementById(
            "darkModeToggle"
        );


    if (toggle) {

        toggle.checked =
            enabled;

    }

}


/* ================= HELPER ================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* ================= SECURITY ================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* ================= MODAL EVENTS ================= */

window.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "taskModal"
            );


        if (
            event.target === modal
        ) {

            closeTaskModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeTaskModal();

        }

    }
);


/* ================================================= */
/* ================= CALCULATOR ==================== */
/* ================================================= */


/* INPUT NUMBER / OPERATOR */

function calculatorInput(
    value
) {

    const display =
        document.getElementById(
            "calcDisplay"
        );


    if (!display) return;


    if (
        display.value === "Error"
    ) {

        display.value = "0";

    }


    if (
        display.value === "0"
    ) {

        display.value = value;

    } else {

        display.value += value;

    }

}


/* CLEAR */

function clearCalculator() {

    const display =
        document.getElementById(
            "calcDisplay"
        );


    if (!display) return;


    display.value = "0";

}


/* DELETE */

function deleteCalculator() {

    const display =
        document.getElementById(
            "calcDisplay"
        );


    if (!display) return;


    if (
        display.value === "Error" ||
        display.value.length <= 1
    ) {

        display.value = "0";

    } else {

        display.value =
            display.value.slice(
                0,
                -1
            );

    }

}


/* CALCULATE */

function calculateResult() {

    const display =
        document.getElementById(
            "calcDisplay"
        );


    if (!display) return;


    try {

        let expression =
            display.value;


        expression =
            expression.replace(
                /%/g,
                "/100"
            );


        /*
            Allow only calculator characters.
        */

        if (
            !/^[0-9+\-*/().\s]+$/
                .test(expression)
        ) {

            display.value =
                "Error";

            return;

        }


        const result =
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();


        if (
            !Number.isFinite(result)
        ) {

            display.value =
                "Error";

            return;

        }


        display.value =
            String(result);

    }

    catch (error) {

        display.value =
            "Error";

    }

}