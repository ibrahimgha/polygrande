const calculatorForm = document.querySelector("[data-pipe-calculator]");

if (calculatorForm) {
  const modeButtons = document.querySelectorAll("[data-mode-toggle]");
  const modePanels = document.querySelectorAll("[data-mode-panel]");
  const resultHeading = document.querySelector("#result-heading");
  const resultNumber = document.querySelector("#result-number");
  const resultUnit = document.querySelector("#result-unit");
  const resultCopy = document.querySelector("#result-copy");
  const resultFormula = document.querySelector("#result-formula");
  const resultDiameter = document.querySelector("#result-diameter");
  const resultSoilFactor = document.querySelector("#result-soil-factor");
  const resultCompactionFactor = document.querySelector("#result-compaction-factor");
  const resultTrenchFactor = document.querySelector("#result-trench-factor");

  const soilFactors = {
    "rocky-fill": 1.18,
    "dense-sand": 1.08,
    "silty-soil": 0.96,
    clay: 0.87,
    "soft-backfill": 0.74
  };

  const compactionFactors = {
    light: 0.88,
    standard: 1,
    high: 1.12,
    premium: 1.2
  };

  const formatNumber = (value) => Number(value).toFixed(2);

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

  const runCalculation = () => {
    const formData = new FormData(calculatorForm);
    const mode = calculatorForm.dataset.mode || "stiffness";
    const diameter = Number(formData.get("diameter"));
    const trenchWidth = Number(formData.get("trenchWidth"));
    const soilType = String(formData.get("soilType"));
    const compactionLevel = String(formData.get("compactionLevel"));

    const diameterMeters = diameter / 1000;
    const soilFactor = soilFactors[soilType] ?? 1;
    const compactionFactor = compactionFactors[compactionLevel] ?? 1;
    const trenchFactor = Math.max(0.85, trenchWidth / Math.max(diameterMeters, 0.3));

    resultDiameter.textContent = `${diameter} mm`;
    resultSoilFactor.textContent = formatNumber(soilFactor);
    resultCompactionFactor.textContent = formatNumber(compactionFactor);
    resultTrenchFactor.textContent = formatNumber(trenchFactor);

    if (mode === "stiffness") {
      const depth = Number(formData.get("pipeDepth"));
      const stiffness =
        (18 * soilFactor * compactionFactor * trenchFactor) /
        (Math.max(depth, 0.1) + 0.5) /
        Math.max(diameterMeters, 0.3);

      resultHeading.textContent = "Estimated Pipe Stiffness";
      resultNumber.textContent = formatNumber(stiffness);
      resultUnit.textContent = "kN/m2";
      resultCopy.textContent =
        `Placeholder result using ${formatNumber(depth)} m depth, ${soilType.replace("-", " ")}, and ${compactionLevel} compaction assumptions.`;
      resultFormula.textContent =
        "stiffness = (18 x soil x compaction x trenchFactor) / ((depth + 0.5) x diameterMeters)";

      return;
    }

    const targetStiffness = Number(formData.get("targetStiffness"));
    const maxDepth =
      (18 * soilFactor * compactionFactor * trenchFactor) /
        (Math.max(targetStiffness, 0.1) * Math.max(diameterMeters, 0.3)) -
      0.5;

    resultHeading.textContent = "Estimated Maximum Depth";
    resultNumber.textContent = formatNumber(Math.max(maxDepth, 0));
    resultUnit.textContent = "m";
    resultCopy.textContent =
      `Placeholder result using a target stiffness of ${formatNumber(targetStiffness)} kN/m2 with the selected soil and execution inputs.`;
    resultFormula.textContent =
      "maxDepth = ((18 x soil x compaction x trenchFactor) / (targetStiffness x diameterMeters)) - 0.5";
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

  setMode("stiffness");
  runCalculation();
}
