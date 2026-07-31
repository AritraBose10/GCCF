const THRESHOLD = 60;
const CSV_PATH = "data/students.csv";

let students = [];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cells[i]));
    return row;
  });
}

function loadStudents() {
  return fetch(CSV_PATH)
    .then((res) => res.text())
    .then((text) => {
      students = parseCSV(text).map((r) => {
        const total = parseFloat(r.total_classes) || 0;
        const attended = parseFloat(r.attended_classes) || 0;
        const pct = total > 0 ? (attended / total) * 100 : 0;
        return {
          rollNo: r.roll_no,
          name: r.name,
          batch: r.batch,
          subject: r.subject,
          total,
          attended,
          pct,
          eligible: pct >= THRESHOLD,
        };
      });
    });
}

function populateBatches() {
  const select = document.getElementById("batch-select");
  const batches = [...new Set(students.map((s) => s.batch))].sort();
  select.innerHTML = '<option value="all">All Batches</option>' +
    batches.map((b) => `<option value="${b}">${b}</option>`).join("");
}

function render() {
  const batch = document.getElementById("batch-select").value;
  const query = document.getElementById("search-box").value.trim().toLowerCase();

  const filtered = students.filter((s) => {
    const matchesBatch = batch === "all" || s.batch === batch;
    const matchesQuery = !query ||
      s.name.toLowerCase().includes(query) ||
      s.rollNo.toLowerCase().includes(query);
    return matchesBatch && matchesQuery;
  });

  const tbody = document.getElementById("student-tbody");
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No students match.</td></tr>';
  } else {
    tbody.innerHTML = filtered
      .map((s) => `
        <tr>
          <td>${s.rollNo}</td>
          <td>${s.name}</td>
          <td>${s.subject}</td>
          <td>${s.total}</td>
          <td>${s.attended}</td>
          <td class="pct ${s.eligible ? "pass" : "fail"}">${s.pct.toFixed(1)}%</td>
          <td><span class="badge ${s.eligible ? "pass" : "fail"}">${s.eligible ? "Eligible" : "Not Eligible"}</span></td>
        </tr>
      `)
      .join("");
  }

  const belowCount = filtered.filter((s) => !s.eligible).length;
  document.getElementById("summary").innerHTML =
    `${filtered.length} student(s) shown &middot; <strong>${belowCount}</strong> below ${THRESHOLD}% threshold`;
}

document.getElementById("batch-select")?.addEventListener("change", render);
document.getElementById("search-box")?.addEventListener("input", render);

loadStudents().then(() => {
  populateBatches();
  render();
});
