const { ipcRenderer } = require("electron");

const ctx = document.getElementById("cpuChart").getContext("2d");
const ctz = document.getElementById("coresChart").getContext("2d");
const os = document.getElementById("os");
const teste = document.getElementById("CPUData");

let cpuUsage = 0;

// Plugin para desenhar texto no centro
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const { width } = chart;
    const { height } = chart;
    const ctx = chart.ctx;
    ctx.restore();
    const fontSize = (height / 5).toFixed(2); // tamanho proporcional
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    const text = `${cpuUsage}%`;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;
    ctx.fillText(text, textX, textY);
    ctx.save();
  }
};

let cpuChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Uso", "Livre"],
    datasets: [{
      data: [0, 100],
      backgroundColor: ["#007bff", "#e0e0e0"],
      borderWidth: 1
    }]
  },
  options: {
    responsive: false, // mantém tamanho fixo
    cutout: "70%",
    plugins: {
      legend: {
        display: false
      }
    }
  },
  plugins: [centerTextPlugin]
});

let coresChart = new Chart(ctz, {
  type: "bar",
  data: {
    labels: [], // Núcleos (Core 0, Core 1, etc.)
    datasets: [{
      label: "Uso (%)",
      data: [],
      backgroundColor: "#007bff"
    }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }
});

ipcRenderer.on("os-data", (event, platform) => {
  os.innerText = `Sistema Operacional: ${platform}`;
});

ipcRenderer.on("cpu-brand", (event, cpuModel) => {
  teste.innerText = `CPU: ${cpuModel}`;
});

ipcRenderer.on("cpu-data", (event, cpuLoad) => {
  cpuUsage = parseFloat(cpuLoad.total).toFixed(0);
  const free = 100 - cpuUsage;

  cpuChart.data.datasets[0].data = [cpuUsage, free];
  cpuChart.update();
});

ipcRenderer.on("cpu-data", (event, data) => {
  const cores = data.cores;
  const labels = cores.map((_, i) => `Core ${i}`);

  coresChart.data.labels = labels;
  coresChart.data.datasets[0].data = cores;
  coresChart.update();
});