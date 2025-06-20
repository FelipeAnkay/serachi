const compare = (a, operator, b) => {
  switch (operator) {
    case "=": return a === b;
    case ">": return a > b;
    case ">=": return a >= b;
    case "<": return a < b;
    case "<=": return a <= b;
    default: return false;
  }
};

const groupServices = (services, timeframe) => {
  const groups = {};
  for (const service of services) {
    const date = new Date(service.dateIn);
    let key;

    if (timeframe === "DAY") key = date.toISOString().split("T")[0];
    else if (timeframe === "WEEK") {
      const week = new Date(date);
      week.setDate(week.getDate() - week.getDay());
      key = week.toISOString().split("T")[0];
    } else if (timeframe === "MONTH") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    } else {
      key = "ALL";
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(service);
  }
  return groups;
};

export const calculateCommission = (services, payrates) => {
  //console.log("calculateCommission call services:", services);
  //console.log("calculateCommission call payrates:", payrates);
  const result = [];
  const grouped = {};

  for (const s of services) {
    const key = `${s.staffEmail}_${s.productId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }
  //console.log("In calculateCommission grouped is:", grouped);

  for (const key in grouped) {
    const [staffEmail, productId] = key.split("_");
    const matchingRates = payrates
      .filter(p =>
        p.staffEmail === staffEmail &&
        p.productId === productId &&
        (!p.startDate || new Date(p.startDate) <= new Date()) &&
        (!p.finishDate || new Date(p.finishDate) >= new Date())
      )
      .sort((a, b) => a.priority - b.priority);

    const groupServicesByKey = grouped[key];
    let totalCommission = 0;
    let matchedFeeRules = [];
    //console.log("In calculateCommission groupServicesByKey is:", groupServicesByKey);
    //console.log("In calculateCommission matchingRates are: ", matchingRates);
    let i = 0;
    let x = 0;
    let y = 0;
    //console.log("matchingRates is: ", matchingRates);
    let commissionsTimeframe = [];
    for (const pr of matchingRates) {
      let commissionForThisRate = 0;
      //console.log("tfGroups: ", tfGroups)
      for (const rule of pr.feeRules) {
        const tfGroups = groupServices(groupServicesByKey, rule.timeframe);
        //console.log("tfGroups 2: ", { tfGroups, rule })
        const auxROperator = rule.operator;
        const auxRvalue = rule.value;
        const auxFee = rule.fee;
        let auxTimeframe = "";
        let auxCount = 0;
        if (auxTimeframe != rule.timeframe) {
          commissionForThisRate = 0;
        }
        for (const tfKey in tfGroups) {
          const count = tfGroups[tfKey].length;
          //console.log("Comparativa y valor: ", { i, x, y, count, auxROperator, auxRvalue, auxFee })
          if (compare(count, rule.operator, rule.value)) {
            if (auxTimeframe != rule.timeframe) {
              matchedFeeRules.push(rule);
            }
            auxCount = count;
            auxTimeframe = rule.timeframe
            commissionForThisRate += count * rule.fee;
          }
          y++;
        }
        let commissionsTimeframeBody = {
          auxTimeframe,
          auxCount,
          auxROperator,
          auxRvalue,
          auxFee,
          commissionForThisRate
        }
        commissionsTimeframe.push(commissionsTimeframeBody);
        x++;
      }
      i++;
    }

    const filtered = commissionsTimeframe.filter(
      (c) => c.auxTimeframe && c.commissionForThisRate > 0
    );
    //console.log("Arreglo a evaluar:", filtered);

    const minCommissionObj = filtered.reduce((min, curr) =>
      curr.commissionForThisRate < min.commissionForThisRate ? curr : min
      , { auxTimeframe: null, commissionForThisRate: Infinity });

    console.log("Menor comisión encontrada:", {staffEmail, minCommissionObj});

    result.push({
      staffEmail,
      productId,
      totalCommission: minCommissionObj.auxTimeframe ? minCommissionObj.commissionForThisRate : 0,
      feeRules: matchedFeeRules,
    });
  }

  return result;
};