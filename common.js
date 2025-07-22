const btnCalculate = $("button[name=calculateBtn]");
const usdSalary = $("input[name=salaryUSD]");
const exchangeRate = $("input[name=exchangeRate]");
const totalMonths = $("input[name=totalMonths]");

const monthlyIncome = $("input[name=monthlyIncome]");
const yearlyIncome = $("input[name=yearlyIncome]");
const monthlyTax = $("input[name=monthlyTax]");
const annualTax = $("input[name=annualTax]");

const setDefaultValues = async () => {
  $(usdSalary).val(2375);
  const pkrRate = await getUsdToPkrRate();
  $(exchangeRate).val(formatNumber(pkrRate, 2));
  $(totalMonths).val(getTotalMonths());
};

const getTotalMonths = () => {
  return localStorage.getItem("totalMonths") ?? 12;
};

const getUsdToPkrRate = async (cb) => {
  const url =
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

  // Use jQuery’s $.getJSON, which returns a jqXHR (then-able Promise)
  const request = $.getJSON(url).then((data) => {
    // The endpoint structure is: { "date": "YYYY-MM-DD", "usd": { "pkr": 277.85, ... } }
    if (data?.usd?.pkr && typeof data.usd.pkr === "number") {
      return data.usd.pkr;
    }
    throw new Error("Invalid or missing PKR rate in response");
  });

  // Support both promise and callback styles
  if (typeof cb === "function") {
    request.then((rate) => cb(null, rate)).catch((err) => cb(err, null));
    return undefined; // Explicitly return undefined for callback usage
  }
  return request; // Return promise for .then/.catch or await
};

const formatNumber = (value, decimals = 0) => {
  if (value === Infinity) {
    console.log("This is the open‑ended slab:", slab);
    return 0;
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new TypeError("formatNumber expects a finite numeric value.");
  }
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 20) {
    throw new RangeError("decimals must be an integer between 0 and 20.");
  }

  const fixed = num.toFixed(decimals); // e.g. "1234.50"
  const [intPart, fracPart] = fixed.split("."); // ["1234", "50"]

  // Insert commas into the integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Return with or without decimals as appropriate
  return fracPart ? `${withCommas}.${fracPart}` : withCommas;
};

const getEditButton = () => {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn", "btn-secondary");

  // 2. Add the SVG markup
  button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
           fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10
                 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0
                 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5
                 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1
                 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528
                 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0
                 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"></path>
      </svg>
    `;
  return button;
};

const bindCalculateButton = () => {
  $(btnCalculate).click((e) => {
    onCalculate(e);
  });
};

const onCalculate = (e) => {
  e.preventDefault();
};

const sortByProperty = (arr, prop = "upTo") => {
  return arr
    .slice() // shallow‑copy so we don’t mutate input
    .sort((a, b) => {
      const aVal = a[prop];
      const bVal = b[prop];
      if (typeof aVal !== "number") return 1;
      if (typeof bVal !== "number") return -1;

      return aVal - bVal; // standard ascending numeric compare
    });
};

const bindOnBlur = () => {
  $(".input-item").each((index, item) => {
    $(item).blur((e) => {
      onInputItemBlur(e);
    });
  });
};
const onInputItemBlur = (e) => {
  localStorage.setItem(e.target.name, $(e.target).val());
  calculateTax();
};

const getUsdSalary = () => {
  return $(usdSalary).val() ?? 0;
};

const getExchangeRate = () => {
  return $(exchangeRate).val() ?? 0;
};

const swapCells = ($cell1, $cell2) => {
  // create a hidden marker
  const $placeholder = $("<span>").hide();
  $cell1.before($placeholder); // mark original spot of cell1
  $cell2.before($cell1.detach()); // move cell1 in front of cell2
  $placeholder.replaceWith($cell2.detach()); // move cell2 to marked spot
};

$(document).ready(async () => {
  await setDefaultValues();
  initSlabs();
  renderSlabs();
  bindOnBlur();
  calculateTax();
  $(".fixed-header").tableHeadFixer();
});
