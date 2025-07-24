let barChartInstance = null;
let lineChartInstance = null;
let pieChartInstance = null;

async function loadData() {
    try {
        const response = await fetch('data/data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

function processDataForCharts(data, isFiltered = false) {
    let labels;
    if (isFiltered) {
        // Use daily labels for filtered data (e.g., last 7 or 30 days)
        labels = [...new Set(data.map(d => d.date))].sort();
    } else {
        // Use monthly labels for full dataset
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    }

    const loginsByLabel = {};
    const engagementByLabel = {};
    const platformCounts = { web: 0, mobile: 0 };

    data.forEach(d => {
        const label = isFiltered ? d.date : new Date(d.date).toLocaleString('default', { month: 'short' });
        loginsByLabel[label] = (loginsByLabel[label] || 0) + d.logins;
        engagementByLabel[label] = (engagementByLabel[label] || []).concat(d.engagement);
        platformCounts[d.platform] += d.logins;
    });

    return {
        bar: {
            labels,
            data: labels.map(l => loginsByLabel[l] || 0)
        },
        line: {
            labels,
            data: labels.map(l => engagementByLabel[l] ? (engagementByLabel[l].reduce((a, b) => a + b, 0) / engagementByLabel[l].length).toFixed(2) : 0)
        },
        pie: {
            labels: ['Web', 'Mobile'],
            data: [platformCounts.web, platformCounts.mobile]
        }
    };
}

function drawBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    // Destroy previous chart instance if it exists
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.bar.labels,
            datasets: [{
                label: 'Logins',
                data: data.bar.data,
                backgroundColor: 'rgba(64, 162, 235, 0.5)',
                borderColor: 'rgba(64, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            },
            responsive: true,
            tooltip: { enabled: true },
            title:{
                    display: true,
                    text: 'Logins Chart',
                    fontSize: 18 ,
                    color: 'var(--color-dark)'
                }
            
        }
    });
}

function drawLineChart(data) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    if (lineChartInstance) lineChartInstance.destroy();
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.line.labels,
            datasets: [{
                label: 'Engagement Rate',
                data: data.line.data,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 1 }
            },
            responsive: true,
            
            tooltip: { enabled: true },
            title: {
                display: true,
                text: 'Engagement Chart',
                fontSize: 18 ,
                color: 'var(--color-dark)'
            }
        }
    });
}

function drawPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.pie.labels,
            datasets: [{
                data: data.pie.data,
                backgroundColor: ['#36A2EB', '#FF6384']
            }]
        },
        options: {
            responsive: true,
        
            tooltip: { enabled: true },
            title: {
                display: true,
                text: 'Platform',
                fontSize: 18 ,
                color: 'var(--color-dark)'
            }
        }
    });
}


function updateCharts() {
    const days = parseInt(document.getElementById('time-filter').value);
    loadData().then(data => {
        const filteredData = data.filter(d => {
            const date = new Date(d.date);
            const now = new Date();
            return (now - date) <= (days * 24 * 60 * 60 * 1000);
        });
        const processedData = processDataForCharts(filteredData, true);
        drawBarChart(processedData);
        drawLineChart(processedData);
        drawPieChart(processedData);
        document.getElementById('export-btn').onclick = () => exportCSV(filteredData);
    });
}

async function initialize() {
    const data = await loadData();
    const processedData = processDataForCharts(data);
    drawBarChart(processedData);
    drawLineChart(processedData);
    drawPieChart(processedData);
    document.getElementById('time-filter').addEventListener('change', updateCharts);
}

    // Aside display for responsiveness
    const menu = document.getElementById('menu-btn');
    const aside = document.querySelector('aside');
    const close = document.getElementById('close-btn');

    menu.addEventListener("click", () => {
        aside.classList.add("view");
    });

    close.addEventListener("click", () => {
        aside.classList.remove('view');
    });

    // Change theme
    const themeBtn = document.querySelector(".theme-btn");
    themeBtn.addEventListener("click", () => {
        document.querySelector('body').classList.toggle('dark-theme');
        themeBtn.querySelector('span:first-child').classList.toggle('active');
        themeBtn.querySelector('span:last-child').classList.toggle('active');
    });


document.addEventListener('DOMContentLoaded', initialize);
