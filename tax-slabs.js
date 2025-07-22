let slabs = null;
const initSlabs = () => {
  slabs = localStorage.getItem("slabs");
  if (!slabs) {
    slabs = [
      { id: 1, upTo: 600000, base: 0, rate: 0.0 }, // 0 %
      { id: 2, upTo: 1200000, base: 0, rate: 0.01 }, // 1 % over 600 k
      { id: 3, upTo: 2200000, base: 6000, rate: 0.11 }, // +11 % over 1.2 M
      { id: 4, upTo: 3200000, base: 116000, rate: 0.23 }, // +23 % over 2.2 M
      { id: 5, upTo: 4100000, base: 346000, rate: 0.3 }, // +30 % over 3.2 M
      { id: 6, upTo: Infinity, base: 616000, rate: 0.35 }, // +35 % over 4.1 M
    ];
    localStorage.setItem("slabs", JSON.stringify(slabs));
    return;
  }
  slabs = JSON.parse(slabs);
};
const renderSlabs = () => {
  let tbody = $("[name=taxSlabs]").find("tbody");
  $(tbody).html("");
  console.log(tbody.length);
  $(slabs).each((index, item) => {
    var tr = $("<tr/>").attr("data-id", item.id).appendTo(tbody);
    $(tr).append($("<td/>").css({ "text-align": "center" }).html(item.id));
    $(tr).append(
      $("<td/>").css({ "text-align": "right" }).html(formatNumber(item.upTo))
    );
    $(tr).append(
      $("<td/>").css({ "text-align": "right" }).html(formatNumber(item.base))
    );
    $(tr).append(
      $("<td/>")
        .css({ "text-align": "right" })
        .html(`${item.rate * 100}%`)
    );
    $(tbody).append(tr);
  });
};

const calculateTax = () => {
  const usdSalary = getUsdSalary();
  const exchangeRate = getExchangeRate();
  const totalMonths = getTotalMonths();

  const monthlyIncomePkr = Math.round(usdSalary * exchangeRate);
  const annualIncomePkr = Math.round(usdSalary * exchangeRate * totalMonths);
  const monthlyTaxPkr = calculateMonthlyTax(annualIncomePkr);
  const annualTaxPkr = monthlyTaxPkr * totalMonths;

  $(monthlyIncome).val(formatNumber(monthlyIncomePkr, 2));
  $(yearlyIncome).val(formatNumber(annualIncomePkr, 2));
  $(monthlyTax).val(formatNumber(monthlyTaxPkr, 2));
  $(annualTax).val(formatNumber(annualTaxPkr, 2));
  doAnalysis();
};

const bgColor = {
  0: "#e9ecef",
  1: "#ffffff",
};

const doAnalysis = () => {
  const tbody = $("table[name=taxAnalysis]").find("tbody:first");
  $(tbody).html("");
  let startPerc = 51;
  const endPerc = 75;
  let index = 1;

  const usdSalary = getUsdSalary();
  const exchangeRate = getExchangeRate();
  const totalMonths = getTotalMonths();

  const monthlyIncomePkr = Math.round(usdSalary * exchangeRate);
  const annualIncomePkr = Math.round(usdSalary * exchangeRate * totalMonths);
  const monthlyTaxPkr = calculateMonthlyTax(annualIncomePkr);

  for (var i = startPerc; i <= endPerc; i++) {
    let selfPercent = i;

    let selfData = createAnalysis("Self", monthlyIncomePkr, selfPercent);
    let colorKey = index % 2;
    let trDataSelf = createRowData(selfData, colorKey, index);

    let spouseData = createAnalysis(
      "Spouse",
      monthlyIncomePkr,
      100 - selfPercent
    );
    let trDataSpouse = createRowData(spouseData, colorKey);

    // Total Tax
    const totalTax = selfData.monthlyTax + spouseData.monthlyTax;
    const tdTotalTax = $("<td/>")
      .addClass("text-center")
      .css({
        "vertical-align": "middle",
        "background-color": bgColor[index % 2],
      })
      .attr("rowspan", 2)
      .html(formatNumber(totalTax));
    $(trDataSelf).append(tdTotalTax);

    const totalTakeHome = selfData.takeHome + selfData.takeHome;
    const tdSelfTakeHomeTotal = $("<td/>")
      .addClass("text-center")
      .css({
        "vertical-align": "middle",
        "background-color": bgColor[index % 2],
      })
      .attr("rowspan", 2)
      .html(formatNumber(totalTakeHome));
    $(trDataSelf).append(tdSelfTakeHomeTotal);

    const totalSaving =
      monthlyTaxPkr - (selfData.monthlyTax + spouseData.monthlyTax);
    $(trDataSelf).append(
      $("<td/>")
        .addClass("text-center")
        .css({
          "vertical-align": "middle",
          "background-color": bgColor[index % 2],
        })
        .attr("rowspan", 2)
        .html(formatNumber(totalSaving))
    );

    $(tbody).append(trDataSelf);
    $(tbody).append(trDataSpouse);
    index++;
  }
};

const createAnalysis = (personName, monthlySalary, salaryPer) => {
  const salaryAmountPkr = Math.round((monthlySalary * salaryPer) / 100);
  const monthlyTax = calculateMonthlyTax(salaryAmountPkr * 12);
  return {
    personName,
    salaryPer: `${salaryPer}`,
    salaryAmountPkr,
    monthlyTax: monthlyTax,
    takeHome: salaryAmountPkr - monthlyTax,
  };
};

const createRowData = (data, colorKey, index) => {
  const tr = $("<tr/>");
  if (index) {
    // Sr #
    $(tr).append(
      $("<td>")
        .attr("rowspan", 2)
        .addClass("text-center")
        .css({
          "vertical-align": "middle",
          "background-color": bgColor[colorKey],
        })
        .html(index)
    );
  }
  // Person Name
  $(tr).append(
    $("<td>")
      .css({
        "background-color": bgColor[colorKey],
      })
      .html(data.personName)
  );
  // Salary Percent
  $(tr).append(
    $("<td>")
      .addClass("text-center")
      .css({
        "background-color": bgColor[colorKey],
      })
      .html(`${data.salaryPer}%`)
  );
  // Amount USD
  const usdSalary = parseFloat(getUsdSalary());
  // const usdSalaryShare = ;
  // debugger
  // console.log("usdSalaryShare: ", usdSalaryShare);
  $(tr).append(
    $("<td>")
      .css({ "text-align": "right", "background-color": bgColor[colorKey] })
      .html(`$${formatNumber((usdSalary * data.salaryPer) / 100, 2)}`)
  );
  // Amount PKR
  $(tr).append(
    $("<td>")
      .css({ "text-align": "right", "background-color": bgColor[colorKey] })
      .html(formatNumber(data.salaryAmountPkr, 2))
  );
  // Monthly Tax
  $(tr).append(
    $("<td>")
      .css({ "text-align": "right", "background-color": bgColor[colorKey] })
      .html(formatNumber(data.monthlyTax, 2))
  );
  // Take Home
  $(tr).append(
    $("<td>")
      .css({ "text-align": "right", "background-color": bgColor[colorKey] })
      .html(formatNumber(data.takeHome, 2))
  );
  return $(tr);
};

const calculateMonthlyTax = (annualSalaryPkr, includeSurcharge = false) => {
  let prevUpper = 0;
  for (let { upTo, base, rate } of slabs) {
    upTo = upTo ?? Infinity;
    if (annualSalaryPkr <= upTo) {
      const tax = base + (annualSalaryPkr - prevUpper) * rate;
      const withSurcharge =
        includeSurcharge && annualSalaryPkr > 10_000_000 ? tax * 1.09 : tax;
      return Math.round(withSurcharge / getTotalMonths());
    }
    prevUpper = upTo;
  }
};
