const STORE_KEY = "solarcare-panels-v1";
const GENERATION_KEY = "solarcare-generation-v1";
const MAINTENANCE_KEY = "solarcare-maintenance-v1";

let panels = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
let generations = JSON.parse(localStorage.getItem(GENERATION_KEY) || "[]");
let maintenance = JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || "[]");

const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0, 10);
["installDate","generationDate","maintenanceDate"].forEach(id => { $(id).value = today; });

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(panels));
  localStorage.setItem(GENERATION_KEY, JSON.stringify(generations));
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenance));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function panelEnergy(id) {
  return generations.filter(g => g.panelId === id).reduce((sum,g) => sum + Number(g.kwh), 0);
}
function render() {
  const active = panels.filter(p => p.status === "Active").length;
  const faulty = panels.filter(p => p.status === "Faulty").length;
  const total = generations.reduce((sum,g) => sum + Number(g.kwh), 0);
  $("totalPanels").textContent = panels.length;
  $("activePanels").textContent = active;
  $("faultyPanels").textContent = faulty;
  $("totalGeneration").textContent = total.toFixed(2);
  const q = $("searchInput").value.toLowerCase();
  const filter = $("filterStatus").value;
  const shown = panels.filter(p => (filter === "All" || p.status === filter) &&
    (p.id.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)));
  $("panelTable").innerHTML = shown.length ? shown.map(p => {
    const cls = p.status === "Active" ? "active" : p.status === "Faulty" ? "faulty" : "maintenance";
    return `<tr><td class="fw-bold">${escapeHTML(p.id)}</td><td>${escapeHTML(p.location)}</td>
      <td>${Number(p.capacity).toFixed(1)} kW</td><td>${panelEnergy(p.id).toFixed(2)} kWh</td>
      <td><span class="status status-${cls}">${escapeHTML(p.status)}</span></td>
      <td><button class="action-btn" data-action="status" data-id="${escapeHTML(p.id)}">Change status</button>
      <button class="action-btn delete" data-action="delete" data-id="${escapeHTML(p.id)}">Delete</button></td></tr>`;
  }).join("") : `<tr><td colspan="6" class="text-center text-muted py-4">No matching panels found.</td></tr>`;
  const options = `<option value="">Select panel</option>` + panels.map(p =>
    `<option value="${escapeHTML(p.id)}">${escapeHTML(p.id)} — ${escapeHTML(p.location)}</option>`).join("");
  $("generationPanel").innerHTML = options;
  $("maintenancePanel").innerHTML = options;
}
$("panelForm").addEventListener("submit", event => {
  event.preventDefault();
  const id = $("panelId").value.trim().toUpperCase();
  const capacity = Number($("capacity").value);
  if (!$("panelForm").checkValidity() || !id || capacity <= 0) {
    $("formMessage").textContent = "Please enter valid values in all required fields.";
    $("panelForm").reportValidity(); return;
  }
  if (panels.some(p => p.id === id)) {
    $("formMessage").textContent = "That Panel ID already exists. Use a unique ID."; return;
  }
  panels.push({id, location:$("location").value.trim(), capacity, installDate:$("installDate").value, status:$("status").value});
  saveData(); render(); event.target.reset(); $("installDate").value = today;
  $("formMessage").textContent = "Panel registered successfully.";
});
$("generationForm").addEventListener("submit", event => {
  event.preventDefault();
  const kwh = Number($("generationValue").value);
  if (!event.target.checkValidity() || kwh < 0) { event.target.reportValidity(); return; }
  generations.push({panelId:$("generationPanel").value, date:$("generationDate").value, kwh});
  saveData(); render(); event.target.reset(); $("generationDate").value = today;
});
$("maintenanceForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!event.target.checkValidity()) { event.target.reportValidity(); return; }
  const record = {panelId:$("maintenancePanel").value, date:$("maintenanceDate").value,
    type:$("maintenanceType").value, note:$("maintenanceNote").value.trim()};
  maintenance.push(record);
  const panel = panels.find(p => p.id === record.panelId);
  if (panel && (record.type === "Repair" || record.type === "Fault report")) panel.status = "Under Maintenance";
  saveData(); render(); event.target.reset(); $("maintenanceDate").value = today;
});
$("panelTable").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const panel = panels.find(p => p.id === button.dataset.id);
  if (!panel) return;
  if (button.dataset.action === "delete") {
    if (!confirm(`Delete ${panel.id}? Its generation and maintenance history will also be removed.`)) return;
    panels = panels.filter(p => p.id !== panel.id);
    generations = generations.filter(g => g.panelId !== panel.id);
    maintenance = maintenance.filter(m => m.panelId !== panel.id);
  } else {
    const states = ["Active","Faulty","Under Maintenance"];
    panel.status = states[(states.indexOf(panel.status) + 1) % states.length];
  }
  saveData(); render();
});
$("searchInput").addEventListener("input", render);
$("filterStatus").addEventListener("change", render);

// Fetch API: Open-Meteo current conditions; no API key is required.
$("weatherButton").addEventListener("click", async () => {
  const output = $("weatherResult");
  output.textContent = "Loading weather data…";
  $("weatherButton").disabled = true;
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,shortwave_radiation,cloud_cover&timezone=Asia%2FKolkata";
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    const c = data.current;
    output.textContent = `Coimbatore: ${c.temperature_2m} ${data.current_units.temperature_2m}, solar radiation ${c.shortwave_radiation} ${data.current_units.shortwave_radiation}, cloud cover ${c.cloud_cover}%.`;
  } catch (error) {
    output.textContent = `Unable to load weather data. Check your internet connection and try again. (${error.message})`;
  } finally {
    $("weatherButton").disabled = false;
  }
});
render();
