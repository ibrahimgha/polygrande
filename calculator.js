const calculatorForm = document.querySelector("[data-pipe-calculator]");

if (calculatorForm) {
  const modeButtons = document.querySelectorAll("[data-mode-toggle]");
  const modePanels = document.querySelectorAll("[data-mode-panel]");
  const resultHeading = document.querySelector("#result-heading");
  const resultNumber = document.querySelector("#result-number");
  const resultUnit = document.querySelector("#result-unit");
  const resultCopy = document.querySelector("#result-copy");
  const resultWarning = document.querySelector("#result-warning");
  const resultFormula = document.querySelector("#result-formula");
  const resultDiameter = document.querySelector("#result-diameter");
  const resultScenario = document.querySelector("#result-scenario");
  const resultWidthClass = document.querySelector("#result-width-class");
  const resultSupportRange = document.querySelector("#result-support-range");

  const supportedClasses = [8, 16, 31.5];
  const narrowColumnMap = {
    borrowed: "borrowedNarrow",
    caseA: "caseANarrow",
    caseB: "caseBNarrow"
  };
  const wideColumnMap = {
    borrowed: "wideBasic",
    caseA: "wideBasic",
    caseB: "wideAdvanced"
  };
  const executionLabels = {
    borrowed: "Borrowed Material",
    caseA: "Case A",
    caseB: "Case B"
  };
  const soilGuidance = {
    "coarse-native": {
      label: "Sand or rock native soil",
      caseBAllowed: true,
      borrowedPreferred: false
    },
    "coarse-backfill": {
      label: "Coarse grained backfill (fines < 12%)",
      caseBAllowed: true,
      borrowedPreferred: false
    },
    "mixed-backfill": {
      label: "Mixed fine/coarse backfill (< 25% fines)",
      caseBAllowed: false,
      borrowedPreferred: false
    },
    "fine-plastic": {
      label: "Fine grained medium plastic soil (LL < 50)",
      caseBAllowed: false,
      borrowedPreferred: false
    },
    "clay-borrowed": {
      label: "Clay / borrowed material condition",
      caseBAllowed: false,
      borrowedPreferred: true
    }
  };
  const stiffnessTables = {
    8: {
      600: { borrowedNarrow: 3.0, caseANarrow: 5.0, wideBasic: 3.5, caseBNarrow: 7.0, wideAdvanced: 6.8 },
      800: { borrowedNarrow: 3.0, caseANarrow: 6.0, wideBasic: 4.9, caseBNarrow: 8.5, wideAdvanced: 8.5 },
      1000: { borrowedNarrow: 3.0, caseANarrow: 6.0, wideBasic: 6.0, caseBNarrow: 10.0, wideAdvanced: 10.0 },
      1200: { borrowedNarrow: 3.0, caseANarrow: 5.5, wideBasic: 5.5, caseBNarrow: 12.0, wideAdvanced: 12.0 },
      1500: { borrowedNarrow: 3.0, caseANarrow: 4.5, wideBasic: 4.5, caseBNarrow: 12.0, wideAdvanced: 12.0 }
    },
    16: {
      500: { borrowedNarrow: 4.0, caseANarrow: 6.0, wideBasic: 4.0, caseBNarrow: 8.5, wideAdvanced: 7.0 },
      600: { borrowedNarrow: 4.5, caseANarrow: 7.5, wideBasic: 5.0, caseBNarrow: 10.0, wideAdvanced: 8.5 },
      800: { borrowedNarrow: 4.5, caseANarrow: 7.5, wideBasic: 6.5, caseBNarrow: 12.0, wideAdvanced: 11.5 },
      1000: { borrowedNarrow: 4.0, caseANarrow: 7.5, wideBasic: 7.5, caseBNarrow: 14.5, wideAdvanced: 14.5 },
      1200: { borrowedNarrow: 4.0, caseANarrow: 7.0, wideBasic: 7.0, caseBNarrow: 14.5, wideAdvanced: 14.5 },
      1500: { borrowedNarrow: 4.0, caseANarrow: 7.0, wideBasic: 7.0, caseBNarrow: 14.5, wideAdvanced: 14.5 }
    },
    31.5: {
      150: { borrowedNarrow: null, caseANarrow: 5.0, wideBasic: 1.8, caseBNarrow: null, wideAdvanced: null },
      250: { borrowedNarrow: null, caseANarrow: 5.0, wideBasic: 3.0, caseBNarrow: null, wideAdvanced: null },
      300: { borrowedNarrow: null, caseANarrow: 5.0, wideBasic: 3.5, caseBNarrow: null, wideAdvanced: null },
      350: { borrowedNarrow: null, caseANarrow: 5.0, wideBasic: 4.0, caseBNarrow: null, wideAdvanced: null },
      400: { borrowedNarrow: null, caseANarrow: 7.0, wideBasic: 4.5, caseBNarrow: null, wideAdvanced: null },
      500: { borrowedNarrow: 5.0, caseANarrow: 9.0, wideBasic: 6.0, caseBNarrow: 12.0, wideAdvanced: 9.5 },
      600: { borrowedNarrow: 5.5, caseANarrow: 9.5, wideBasic: 7.0, caseBNarrow: 13.0, wideAdvanced: 11.5 },
      800: { borrowedNarrow: 5.5, caseANarrow: 9.5, wideBasic: 9.5, caseBNarrow: 15.0, wideAdvanced: 15.0 },
      1000: { borrowedNarrow: 5.0, caseANarrow: 9.0, wideBasic: 9.0, caseBNarrow: 15.0, wideAdvanced: 15.0 },
      1200: { borrowedNarrow: 5.0, caseANarrow: 9.0, wideBasic: 9.0, caseBNarrow: 15.0, wideAdvanced: 15.0 },
      1500: { borrowedNarrow: 5.0, caseANarrow: 9.0, wideBasic: 9.0, caseBNarrow: 15.0, wideAdvanced: 15.0 }
    }
  };

  const formatNumber = (value) => Number(value).toFixed(2);
  const formatClass = (value) => (Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1));
  const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;

  const setMode = (mode) => {
    calculatorForm.dataset.mode = mode;

    modeButtons.forEach((button) => {
      const isActive = button.dataset.modeToggle === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    modePanels.forEach((panel) => {
      const isActive = panel.dataset.modePanel === mode;
      panel.hidden = !isActive;

      panel.querySelectorAll("input, select, textarea").forEach((field) => {
        field.disabled = !isActive;
      });
    });
  };

  const interpolate = (x1, y1, x2, y2, targetX) => {
    if (Math.abs(x2 - x1) < 0.0001) {
      return y1;
    }

    return y1 + ((targetX - x1) * (y2 - y1)) / (x2 - x1);
  };

  const getSelectionContext = (diameter, trenchWidth, executionType) => {
    const diameterMeters = diameter / 1000;
    const trenchRatio = trenchWidth / diameterMeters;
    const narrowKey = narrowColumnMap[executionType];
    const wideKey = wideColumnMap[executionType];
    const narrowLabel = `${executionLabels[executionType]} / <= 1.5D`;
    const wideLabel =
      executionType === "caseB" ? "Case B or Borrowed Material / >= 3.0D" : "Case A or Borrowed Material / >= 3.0D";

    let widthLabel = `${formatNumber(trenchRatio)}D`;
    let methodLabel = "Published at <= 1.5D";
    let displayLabel = narrowLabel;
    let interpolationFactor = 0;

    if (trenchRatio >= 3) {
      widthLabel = `>= 3.0D (${formatNumber(trenchRatio)}D)`;
      methodLabel = "Published at >= 3.0D";
      displayLabel = wideLabel;
      interpolationFactor = 1;
    } else if (trenchRatio > 1.5) {
      widthLabel = `Interpolated (${formatNumber(trenchRatio)}D)`;
      methodLabel = "Interpolated between 1.5D and 3.0D";
      displayLabel = `${executionLabels[executionType]} / interpolated width`;
      interpolationFactor = (trenchRatio - 1.5) / 1.5;
    } else {
      widthLabel = `<= 1.5D (${formatNumber(trenchRatio)}D)`;
    }

    return {
      diameterMeters,
      trenchRatio,
      narrowKey,
      wideKey,
      narrowLabel,
      wideLabel,
      widthLabel,
      methodLabel,
      displayLabel,
      interpolationFactor
    };
  };

  const getCoverAtClass = (stiffnessClass, diameter, selection) => {
    const row = stiffnessTables[stiffnessClass]?.[diameter];

    if (!row) {
      return null;
    }

    const narrowValue = row[selection.narrowKey];
    const wideValue = row[selection.wideKey];

    if (selection.trenchRatio <= 1.5) {
      return narrowValue == null ? null : narrowValue;
    }

    if (selection.trenchRatio >= 3) {
      return wideValue == null ? null : wideValue;
    }

    if (narrowValue == null || wideValue == null) {
      return null;
    }

    return interpolate(1.5, narrowValue, 3, wideValue, selection.trenchRatio);
  };

  const getAvailableSeries = (diameter, selection) =>
    supportedClasses
      .map((stiffnessClass) => ({
        stiffnessClass,
        cover: getCoverAtClass(stiffnessClass, diameter, selection)
      }))
      .filter((entry) => entry.cover != null);

  const getAdvisory = (soilType, executionType, selection) => {
    const soil = soilGuidance[soilType];
    const notes = [];

    if (executionType === "caseB" && soil && !soil.caseBAllowed) {
      notes.push("Case B: coarse material with fines below 12%.");
    }

    if (soil?.borrowedPreferred && executionType !== "borrowed") {
      notes.push("Clay condition: borrowed material basis.");
    }

    if (selection.trenchRatio > 1.5 && selection.trenchRatio < 3) {
      notes.push("Width interpolated between 1.5D and 3.0D.");
    }

    return notes.join(" ");
  };

  const setBreakdown = (diameter, selection, series) => {
    resultDiameter.textContent = `${diameter} mm`;
    resultScenario.textContent = selection.displayLabel;
    resultWidthClass.textContent = selection.widthLabel;

    if (series.length === 0) {
      resultSupportRange.textContent = "No published row";
      return;
    }

    if (series.length === 1) {
      resultSupportRange.textContent = `Only SR ${formatClass(series[0].stiffnessClass)}`;
      return;
    }

    resultSupportRange.textContent =
      `SR ${formatClass(series[0].stiffnessClass)} - SR ${formatClass(series[series.length - 1].stiffnessClass)}`;
  };

  const setUnsupportedResult = (heading, copy, warning, formulaText) => {
    resultHeading.textContent = heading;
    resultNumber.textContent = "N/A";
    resultUnit.textContent = "";
    resultCopy.textContent = copy;
    resultWarning.textContent = warning;
    resultFormula.textContent = formulaText;
  };

  const runCalculation = () => {
    const formData = new FormData(calculatorForm);
    const mode = calculatorForm.dataset.mode || "stiffness";
    const diameter = Number(formData.get("diameter"));
    const trenchWidth = Number(formData.get("trenchWidth"));
    const soilType = String(formData.get("soilType"));
    const executionType = String(formData.get("executionType"));

    const selection = getSelectionContext(diameter, trenchWidth, executionType);
    const series = getAvailableSeries(diameter, selection);
    const advisory = getAdvisory(soilType, executionType, selection);

    setBreakdown(diameter, selection, series);

    if (series.length === 0) {
      setUnsupportedResult(
        mode === "stiffness" ? "Required SR class" : "Max soil cover",
        "No published row for this combination.",
        advisory,
        "No published chart value."
      );
      return;
    }

    if (mode === "stiffness") {
      const depth = Number(formData.get("pipeDepth"));

      resultHeading.textContent = "Required SR class";
      resultUnit.textContent = "kN/m\u00b2";

      if (!isPositiveNumber(trenchWidth) || !isPositiveNumber(depth)) {
        setUnsupportedResult(
          "Required SR class",
          "Enter valid positive values.",
          advisory,
          "Waiting for valid inputs."
        );
        return;
      }

      if (series.length === 1) {
        const onlyPoint = series[0];

        if (depth <= onlyPoint.cover) {
          resultNumber.textContent = formatClass(onlyPoint.stiffnessClass);
          resultCopy.textContent =
            `Within SR ${formatClass(onlyPoint.stiffnessClass)} limit (${formatNumber(onlyPoint.cover)} m).`;
          resultWarning.textContent = advisory;
          resultFormula.textContent =
            "Only published SR row.";
          return;
        }

        setUnsupportedResult(
          "Required SR class",
          `Exceeds SR ${formatClass(onlyPoint.stiffnessClass)} limit (${formatNumber(onlyPoint.cover)} m).`,
          advisory,
          "No higher published SR row."
        );
        return;
      }

      if (depth <= series[0].cover) {
        resultNumber.textContent = formatClass(series[0].stiffnessClass);
        resultCopy.textContent =
          `Within SR ${formatClass(series[0].stiffnessClass)} limit (${formatNumber(series[0].cover)} m).`;
        resultWarning.textContent = advisory;
        resultFormula.textContent =
          "Lowest matching published SR class.";
        return;
      }

      for (let index = 0; index < series.length - 1; index += 1) {
        const lower = series[index];
        const upper = series[index + 1];

        if (depth <= upper.cover) {
          const requiredStiffness = interpolate(lower.cover, lower.stiffnessClass, upper.cover, upper.stiffnessClass, depth);
          const recommendedClass =
            series.find((entry) => entry.stiffnessClass >= requiredStiffness)?.stiffnessClass ?? upper.stiffnessClass;

          resultNumber.textContent = formatNumber(requiredStiffness);
          resultCopy.textContent =
            `Interpolated minimum: ${formatNumber(requiredStiffness)} kN/m\u00b2. Use SR ${formatClass(recommendedClass)}.`;
          resultWarning.textContent = advisory;
          resultFormula.textContent =
            "Interpolated between published SR rows.";
          return;
        }
      }

      const highest = series[series.length - 1];
      setUnsupportedResult(
        "Required SR class",
        `Exceeds SR ${formatClass(highest.stiffnessClass)} limit (${formatNumber(highest.cover)} m).`,
        advisory,
        "No higher published SR row."
      );
      return;
    }

    const targetStiffness = Number(formData.get("targetStiffness"));
    resultHeading.textContent = "Max soil cover";
    resultUnit.textContent = "m";

    if (!isPositiveNumber(trenchWidth) || !isPositiveNumber(targetStiffness)) {
      setUnsupportedResult(
        "Max soil cover",
        "Enter valid positive values.",
        advisory,
        "Waiting for valid inputs."
      );
      return;
    }

    if (series.length === 1) {
      const onlyPoint = series[0];

      if (Math.abs(targetStiffness - onlyPoint.stiffnessClass) < 0.001) {
        resultNumber.textContent = formatNumber(onlyPoint.cover);
        resultCopy.textContent =
          `Published cover: ${formatNumber(onlyPoint.cover)} m.`;
        resultWarning.textContent = advisory;
        resultFormula.textContent =
          "Only published SR row.";
        return;
      }

      setUnsupportedResult(
        "Max soil cover",
        `Only SR ${formatClass(onlyPoint.stiffnessClass)} is published here.`,
        advisory,
        "Entered SR is outside the available row."
      );
      return;
    }

    const lowest = series[0];
    const highest = series[series.length - 1];

    if (targetStiffness < lowest.stiffnessClass || targetStiffness > highest.stiffnessClass) {
      setUnsupportedResult(
        "Max soil cover",
        `SR ${formatNumber(targetStiffness)} is outside the published range.`,
        advisory,
        `Available: SR ${formatClass(lowest.stiffnessClass)} to SR ${formatClass(highest.stiffnessClass)}.`
      );
      return;
    }

    for (let index = 0; index < series.length; index += 1) {
      if (Math.abs(targetStiffness - series[index].stiffnessClass) < 0.001) {
        resultNumber.textContent = formatNumber(series[index].cover);
        resultCopy.textContent =
          `Published cover: ${formatNumber(series[index].cover)} m.`;
        resultWarning.textContent = advisory;
        resultFormula.textContent =
          "Direct published SR row.";
        return;
      }
    }

    for (let index = 0; index < series.length - 1; index += 1) {
      const lower = series[index];
      const upper = series[index + 1];

      if (targetStiffness > lower.stiffnessClass && targetStiffness < upper.stiffnessClass) {
        const maxCover = interpolate(lower.stiffnessClass, lower.cover, upper.stiffnessClass, upper.cover, targetStiffness);

        resultNumber.textContent = formatNumber(maxCover);
        resultCopy.textContent = `Interpolated cover: ${formatNumber(maxCover)} m.`;
        resultWarning.textContent = advisory;
        resultFormula.textContent =
          "Interpolated between published SR rows.";
        return;
      }
    }
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.modeToggle);
      runCalculation();
    });
  });

  calculatorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runCalculation();
  });

  calculatorForm.addEventListener("input", () => {
    runCalculation();
  });

  calculatorForm.addEventListener("change", () => {
    runCalculation();
  });

  setMode("stiffness");
  runCalculation();
}
