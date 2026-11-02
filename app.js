// HostelOne Warden Portal
// This is a browser-only demonstration.
// Data is saved in localStorage on this browser.

const defaultStudents = [
  { name: "Aarav Kumar", id: "NMIT001", block: "A", room: "A101", phone: "9876500001" },
  { name: "Priya Sharma", id: "NMIT002", block: "A", room: "A101", phone: "9876500002" },
  { name: "Rahul Verma", id: "NMIT003", block: "A", room: "A102", phone: "9876500003" },
  { name: "Ananya Rao", id: "NMIT004", block: "B", room: "B201", phone: "9876500004" },
  { name: "Kiran Das", id: "NMIT005", block: "B", room: "B202", phone: "9876500005" },
  { name: "Meera Nair", id: "NMIT006", block: "C", room: "C301", phone: "9876500006" },
  { name: "Vikram Singh", id: "NMIT007", block: "C", room: "C301", phone: "9876500007" },
  { name: "Sneha Reddy", id: "NMIT008", block: "C", room: "C302", phone: "9876500008" }
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

let students = loadData("hostel_students", defaultStudents);
let attendance = loadData("hostel_attendance", {});
let gateEntries = loadData("hostel_gate", []);
let complaints = loadData("hostel_complaints", [
  { title: "Bathroom tap repair", priority: "High", status: "Open" },
  { title: "Corridor light not working", priority: "Normal", status: "Open" }
]);
let fees = loadData("hostel_fees", []);

function saveData() {
  localStorage.setItem("hostel_students", JSON.stringify(students));
  localStorage.setItem("hostel_attendance", JSON.stringify(attendance));
  localStorage.setItem("hostel_gate", JSON.stringify(gateEntries));
  localStorage.setItem("hostel_complaints", JSON.stringify(complaints));
  localStorage.setItem("hostel_fees", JSON.stringify(fees));
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(page).classList.add("active");
  document.getElementById("pageName").textContent =
    page.charAt(0).toUpperCase() + page.slice(1);

  document.querySelectorAll("nav button").forEach(button => {
    button.classList.toggle(
      "selected",
      button.textContent.toLowerCase().includes(page)
    );
  });

  document.querySelector(".sidebar").classList.remove("open");

  if (page === "hostel") renderRooms();
  if (page === "students") renderStudents();
  if (page === "attendance") renderAttendance();
  if (page === "gate") renderGate();
  if (page === "complaints") renderComplaints();
  if (page === "fees") renderFees();
  if (page === "rooms") renderAllocationSummary();
  if (page === "reports") renderReports();
}

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("open");
}

function renderRooms() {
  const block = document.getElementById("blockSelect").value;
  const grid = document.getElementById("buildingGrid");

  grid.innerHTML = "";

  for (let number = 1; number <= 15; number++) {
    const roomNumber = `${block}${100 + number}`;
    const residents = students.filter(student => student.room === roomNumber);
    const occupied = residents.length;
    const capacity = 4;

    let status = occupied >= capacity
      ? "full"
      : "available";

    if (number === 15) status = "maintenance";

    const room = document.createElement("button");
    room.className = `scene-room ${status}`;
    room.innerHTML = `Room<br>${roomNumber}<br>${occupied}/${capacity} beds`;

    room.onclick = () => showRoomDetails(roomNumber, residents, capacity, status);
    grid.appendChild(room);
  }
}

function showRoomDetails(roomNumber, residents, capacity, status) {
  const details = document.getElementById("roomDetails");

  details.innerHTML = `
    <h2>Room ${roomNumber}</h2>
    <p>Sharing capacity: ${capacity} beds</p>
    <p>Occupied beds: ${residents.length}</p>
    <p>Available beds: ${Math.max(0, capacity - residents.length)}</p>
    <p>Status: ${status}</p>
    <h3>Residents</h3>
    <div id="residentNames"></div>
    <button onclick="allocateStudent('${roomNumber}')">Allocate Student</button>
  `;

  const list = document.getElementById("residentNames");

  if (residents.length === 0) {
    list.textContent = "No students currently assigned.";
  } else {
    residents.forEach(student => {
      const p = document.createElement("p");
      p.textContent = `${student.name} · ${student.id}`;
      list.appendChild(p);
    });
  }
}

function allocateStudent(roomNumber) {
  const name = prompt("Enter student name:");
  if (!name) return;

  const id = prompt("Enter student ID:");
  if (!id) return;

  const block = roomNumber.charAt(0);
  const roomResidents = students.filter(student => student.room === roomNumber);

  if (roomResidents.length >= 4) {
    alert("This room is full.");
    return;
  }

  if (students.some(student => student.id === id)) {
    alert("This student ID already exists.");
    return;
  }

  students.push({
    name,
    id,
    block,
    room: roomNumber,
    phone: "Not provided"
  });

  saveData();
  renderRooms();
  updateDashboard();
  alert("Student allocated successfully.");
}

function renderStudents() {
  const search = document.getElementById("studentSearch").value.toLowerCase();
  const table = document.getElementById("studentTable");

  table.innerHTML = "";

  students
    .filter(student =>
      `${student.name} ${student.id} ${student.room}`
        .toLowerCase()
        .includes(search)
    )
    .forEach(student => {
      const row = table.insertRow();
      [
        student.name,
        student.id,
        student.block,
        student.room,
        student.phone
      ].forEach(value => {
        row.insertCell().textContent = value;
      });
    });
}

function addStudent() {
  const name = prompt("Student name:");
  if (!name) return;

  const id = prompt("Student ID:");
  if (!id) return;

  if (students.some(student => student.id === id)) {
    alert("That student ID already exists.");
    return;
  }

  const block = prompt("Block A, B or C:", "A");
  if (!["A", "B", "C"].includes((block || "").toUpperCase())) {
    alert("Enter A, B or C.");
    return;
  }

  const room = prompt("Room number:", `${block.toUpperCase()}101`);

  students.push({
    name,
    id,
    block: block.toUpperCase(),
    room: room || `${block.toUpperCase()}101`,
    phone: "Not provided"
  });

  saveData();
  renderStudents();
  updateDashboard();
}

function renderAttendance() {
  const table = document.getElementById("attendanceTable");
  const date = document.getElementById("attendanceDate");

  if (!date.value) {
    date.value = new Date().toISOString().slice(0, 10);
  }

  table.innerHTML = "";

  students.forEach(student => {
    const key = `${date.value}_${student.id}`;
    const row = table.insertRow();

    row.insertCell().textContent = student.name;
    row.insertCell().textContent = student.room;

    const cell = row.insertCell();
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = attendance[key] !== false;
    checkbox.dataset.key = key;

    cell.appendChild(checkbox);
  });
}

function saveAttendance() {
  document.querySelectorAll("#attendanceTable input").forEach(box => {
    attendance[box.dataset.key] = box.checked;
  });

  saveData();
  updateDashboard();
  alert("Attendance saved on this browser.");
}

function addGateEntry() {
  const name = document.getElementById("gateName").value.trim();
  const type = document.getElementById("gateType").value;
  const purpose = document.getElementById("gatePurpose").value.trim();

  if (!name) {
    alert("Enter a student or visitor name.");
    return;
  }

  gateEntries.unshift({
    name,
    type,
    purpose: purpose || "Not specified",
    time: new Date().toLocaleString()
  });

  saveData();
  renderGate();

  document.getElementById("gateName").value = "";
  document.getElementById("gatePurpose").value = "";
}

function renderGate() {
  const table = document.getElementById("gateTable");
  table.innerHTML = "";

  gateEntries.forEach(entry => {
    const row = table.insertRow();
    [entry.name, entry.type, entry.purpose, entry.time].forEach(value => {
      row.insertCell().textContent = value;
    });
  });
}

function addComplaint() {
  const title = document.getElementById("issueTitle").value.trim();
  const priority = document.getElementById("issuePriority").value;

  if (!title) {
    alert("Enter the complaint details.");
    return;
  }

  complaints.unshift({ title, priority, status: "Open" });

  saveData();
  renderComplaints();
  updateDashboard();

  document.getElementById("issueTitle").value = "";
}

function renderComplaints() {
  const list = document.getElementById("issueList");
  list.innerHTML = "";

  complaints.forEach((issue, index) => {
    const card = document.createElement("div");
    card.className = "panel";

    const heading = document.createElement("h3");
    heading.textContent = issue.title;

    const description = document.createElement("p");
    description.textContent =
      `Priority: ${issue.priority} · Status: ${issue.status}`;

    const button = document.createElement("button");
    button.textContent = "Mark Resolved";

    button.onclick = () => {
      complaints[index].status = "Resolved";
      saveData();
      renderComplaints();
      updateDashboard();
    };

    card.append(heading, description, button);
    list.appendChild(card);
  });
}

function addFee() {
  const name = document.getElementById("feeStudent").value.trim();
  const amount = Number(document.getElementById("feeAmount").value);
  const status = document.getElementById("feeStatus").value;

  if (!name || amount <= 0) {
    alert("Enter a student name and valid amount.");
    return;
  }

  fees.push({ name, amount, status });
  saveData();
  renderFees();

  document.getElementById("feeStudent").value = "";
  document.getElementById("feeAmount").value = "";
}

function renderFees() {
  const table = document.getElementById("feeTable");
  table.innerHTML = "";

  fees.forEach(fee => {
    const row = table.insertRow();
    row.insertCell().textContent = fee.name;
    row.insertCell().textContent =
      "₹" + fee.amount.toLocaleString("en-IN");
    row.insertCell().textContent = fee.status;
  });
}

function renderAllocationSummary() {
  const summary = document.getElementById("allocationSummary");
  const occupied = students.length;

  summary.textContent =
    `${occupied} demo students currently listed. Use the 3D Hostel View to inspect rooms and allocate students.`;
}

function renderReports() {
  document.getElementById("reportStudents").textContent = students.length;
  document.getElementById("reportComplaints").textContent =
    complaints.filter(issue => issue.status !== "Resolved").length;

  const today = new Date().toISOString().slice(0, 10);
  const present = students.filter(student =>
    attendance[`${today}_${student.id}`] !== false
  ).length;

  const rate = students.length
    ? Math.round((present / students.length) * 100)
    : 0;

  document.getElementById("reportAttendance").textContent = `${rate}%`;
}

function exportStudents() {
  const rows = [
    ["Name", "Student ID", "Block", "Room", "Phone"],
    ...students.map(student => [
      student.name,
      student.id,
      student.block,
      student.room,
      student.phone
    ])
  ];

  const csv = rows
    .map(row => row.map(value =>
      `"${String(value).replace(/"/g, '""')}"`
    ).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "hostel-students.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function updateDashboard() {
  document.getElementById("residentCount").textContent = students.length;

  const today = new Date().toISOString().slice(0, 10);
  const present = students.filter(student =>
    attendance[`${today}_${student.id}`] !== false
  ).length;

  document.getElementById("presentCount").textContent = present;

  document.getElementById("complaintCount").textContent =
    complaints.filter(issue => issue.status !== "Resolved").length;
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

document.getElementById("studentSearch").addEventListener("input", renderStudents);
document.getElementById("attendanceDate").addEventListener("change", renderAttendance);

saveData();
renderRooms();
renderStudents();
renderAttendance();
renderGate();
renderComplaints();
renderFees();
renderAllocationSummary();
renderReports();
updateDashboard();