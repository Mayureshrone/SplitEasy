const peopleList = document.getElementById("peopleList");
const totalAmount = document.getElementById("totalAmount");

const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");

let people = [
  {
    id: 1,
    name: "",
    paid: 0,
  },
  {
    id: 2,
    name: "",
    paid: 0,
  },
];

/* Format Money */

function money(amount) {
  return (
    "₹" +
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/* Prevent HTML */

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Display People */

function renderPeople() {
  peopleList.innerHTML = "";

  people.forEach((person, index) => {
    const row = document.createElement("div");

    row.className = "person-row";

    row.innerHTML = `
            <div class="person-number">
                ${index + 1}
            </div>

            <input
                type="text"
                class="name-input"
                data-id="${person.id}"
                value="${escapeHTML(person.name)}"
                placeholder="Person ${index + 1} name"
            >

            <input
                type="number"
                class="paid-input"
                data-id="${person.id}"
                value="${person.paid || ""}"
                min="0"
                step="0.01"
                placeholder="Paid ₹"
            >

            <button
                class="remove-person"
                data-remove="${person.id}"
                title="Remove person"
            >
                ×
            </button>
        `;

    peopleList.appendChild(row);
  });

  /* Name Inputs */

  document.querySelectorAll(".name-input").forEach((input) => {
    input.addEventListener("input", function () {
      const person = people.find((p) => p.id == this.dataset.id);

      if (person) {
        person.name = this.value;
      }
    });
  });

  /* Paid Inputs */

  document.querySelectorAll(".paid-input").forEach((input) => {
    input.addEventListener("input", function () {
      const person = people.find((p) => p.id == this.dataset.id);

      if (person) {
        person.paid = Number(this.value) || 0;
      }
    });
  });

  /* Remove Person */

  document.querySelectorAll(".remove-person").forEach((button) => {
    button.addEventListener("click", function () {
      if (people.length <= 2) {
        alert("You need at least 2 people.");

        return;
      }

      people = people.filter((person) => person.id != this.dataset.remove);

      renderPeople();
    });
  });
}

/* Add Person */

function addPerson() {
  people.push({
    id: Date.now(),
    name: "",
    paid: 0,
  });

  renderPeople();
}

/* Validate Data */

function validateData() {
  const total = Number(totalAmount.value);

  if (!total || total <= 0) {
    alert("Please enter a valid total expense.");

    totalAmount.focus();

    return null;
  }

  for (let person of people) {
    if (!person.name.trim()) {
      alert("Please enter the name of every person.");

      return null;
    }
  }

  /* Check duplicate names */

  const names = people.map((person) => person.name.trim().toLowerCase());

  if (new Set(names).size !== names.length) {
    alert("Every person should have a different name.");

    return null;
  }

  /* Check paid amount */

  const paidTotal = people.reduce(
    (sum, person) => sum + Number(person.paid),
    0,
  );

  if (Math.abs(paidTotal - total) > 0.01) {
    alert(
      "The amount paid by everyone must equal the total expense.\n\n" +
        "Total Expense: " +
        money(total) +
        "\nAmount Entered: " +
        money(paidTotal),
    );

    return null;
  }

  return {
    total: total,
    people: people,
  };
}

/* Calculate Who Pays Whom */

function calculateSettlement(balances) {
  const creditors = [];
  const debtors = [];

  for (const name in balances) {
    const balance = balances[name];

    if (balance > 0.01) {
      creditors.push({
        name: name,
        amount: balance,
      });
    } else if (balance < -0.01) {
      debtors.push({
        name: name,
        amount: Math.abs(balance),
      });
    }
  }

  const settlements = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];

    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: amount,
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount <= 0.01) {
      creditorIndex++;
    }

    if (debtor.amount <= 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
}

/* Show Result */

function showResult(data) {
  const share = data.total / data.people.length;

  const balances = {};

  /* Calculate balance */

  data.people.forEach((person) => {
    balances[person.name] = person.paid - share;
  });

  /* Summary */

  document.getElementById("resultTotal").textContent = money(data.total);

  document.getElementById("resultPeople").textContent = data.people.length;

  document.getElementById("resultShare").textContent = money(share);

  document.getElementById("shareAmount").textContent = money(share) + " each";

  resultEmpty.classList.add("hidden");
  resultContent.classList.remove("hidden");

  /* Balance List */

  const balanceList = document.getElementById("balanceList");

  balanceList.innerHTML = "";

  data.people.forEach((person) => {
    const balance = balances[person.name];

    const row = document.createElement("div");

    row.className = "balance-row";

    let status;
    let amount;
    let className;

    if (balance > 0.01) {
      status = "Should receive";
      amount = "+" + money(balance);
      className = "balance-positive";
    } else if (balance < -0.01) {
      status = "Needs to pay";
      amount = "-" + money(Math.abs(balance));
      className = "balance-negative";
    } else {
      status = "Settled";
      amount = money(0);
      className = "balance-even";
    }

    row.innerHTML = `
            <div>

                <div class="person-result-name">
                    ${escapeHTML(person.name)}
                </div>

                <div class="person-result-status">
                    ${status}
                </div>

            </div>

            <strong class="${className}">
                ${amount}
            </strong>
        `;

    balanceList.appendChild(row);
  });

  /* Settlement */

  const settlementList = document.getElementById("settlementList");

  settlementList.innerHTML = "";

  const settlements = calculateSettlement(balances);

  if (settlements.length === 0) {
    settlementList.innerHTML = `
            <div class="no-settlement">
                Everyone is already settled.
            </div>
        `;
  } else {
    settlements.forEach((item) => {
      const row = document.createElement("div");

      row.className = "settlement-row";

      row.innerHTML = `
                <span>
                    ${escapeHTML(item.from)}
                    pays
                    ${escapeHTML(item.to)}
                </span>

                <strong>
                    ${money(item.amount)}
                </strong>
            `;

      settlementList.appendChild(row);
    });
  }

  /* Show result */

  resultEmpty.classList.add("hidden");

  resultContent.classList.remove("hidden");
}

/* Calculate Button */

function calculate() {
  const data = validateData();

  if (!data) {
    return;
  }

  showResult(data);

  document.getElementById("resultCard").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

/* Clear Calculator */

function resetCalculator() {
  totalAmount.value = "";

  people = [
    {
      id: 1,
      name: "",
      paid: 0,
    },

    {
      id: 2,
      name: "",
      paid: 0,
    },
  ];

  renderPeople();

  resultContent.classList.add("hidden");

  resultEmpty.classList.remove("hidden");
}

/* Buttons */

document.getElementById("addPerson").addEventListener("click", addPerson);

document.getElementById("calculateBtn").addEventListener("click", calculate);

document.getElementById("resetBtn").addEventListener("click", resetCalculator);

/* Header Button */

document
  .getElementById("headerCalculate")
  .addEventListener("click", function () {
    document.getElementById("calculator").scrollIntoView({
      behavior: "smooth",
    });
  });

/* Hero Button */

document.getElementById("heroCalculate").addEventListener("click", function () {
  document.getElementById("calculator").scrollIntoView({
    behavior: "smooth",
  });
});

/* Enter Key */

totalAmount.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    calculate();
  }
});

/* Start */

renderPeople();
