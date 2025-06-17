import { RetirementCalculator } from "./RetirementCalculatorClass";
import { ContributionCalculator } from "./ContributionCalculatorClass";
import { SavingsCalculator } from "./SavingsCalculatorClass";
import { InputValidator } from "./InputValidatorClass";
import {
  RetirementCalculatorInput,
  RetirementCalculatorInitialValues,
  RetirementCalculatorOutput,
} from "./retirementCalculatorTypes";

const initialValues: RetirementCalculatorInitialValues = {
  annualInflationPercent: 0.03,
  annualIncomeIncreasePercent: 0.03,
  annualPostRetirementReturnPercent: 0.05,
  annualRetirementSavingsReturnPercent: 0.08,
  endOfRetirementAge: 95,
  irsLimits: {
    annual401kLimit: 23500,
    catchUp401kOver50: 7500,
    catchUp401k60_63: 11250,
  },
  minAnnualRetirementIncomePercent: 0.8,
  minimumAge: 16,
  normalRetirementAge: 65,
  withdrawalAge: 75,
};

describe("RetirementCalculator", () => {
  it("calculates results for valid input", () => {
    const calculator = new RetirementCalculator(initialValues);
    const input: RetirementCalculatorInput = {
      annualIncome: 100000,
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      currentSavings: 20000,
      employerMatchPercent: 0.5,
      employerMaxMatchPercent: 0.03,
      retirementAge: 65,
    };
    const result = calculator.calculate(input);
    expect(result.errors).toBeUndefined();
    expect(result.results?.totalSavingsAtRetirement).toBeGreaterThan(0);
    expect(result.results?.projectedMonthlyIncome).toBeGreaterThan(0);
  });

  it("returns errors for invalid input", () => {
    const calculator = new RetirementCalculator(initialValues);
    const input: RetirementCalculatorInput = {
      annualIncome: 500,
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      currentSavings: 20000,
      employerMatchPercent: 0.5,
      employerMaxMatchPercent: 0.03,
      retirementAge: 65,
    };
    const result = calculator.calculate(input);
    expect(result.errors).toBeDefined();
    expect(result.errors?.annualIncome).toBeDefined();
  });
});

describe("ContributionCalculator", () => {
  it("calculates annual contributions correctly", () => {
    const calc = new ContributionCalculator();
    const input: RetirementCalculatorInput = {
      annualIncome: 100000,
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      retirementAge: 65,
    };
    const res = calc.calculateTotalAnnualContribution(input);
    expect(res.annualContribution).toBeCloseTo(5000);
  });
});

describe("SavingsCalculator", () => {
  it("projects retirement savings", () => {
    const calc = new SavingsCalculator(initialValues);
    const input: RetirementCalculatorInput = {
      annualIncome: 100000,
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      currentSavings: 20000,
      retirementAge: 65,
    };
    const totalContributions = 5000;
    const projected = calc.calculateProjectedRetirementSavings(
      input,
      totalContributions
    );
    expect(projected).toBeGreaterThan(0);
  });
});

describe("InputValidator", () => {
  it("validates input correctly", () => {
    const validator = new InputValidator(initialValues);
    const input: RetirementCalculatorInput = {
      annualIncome: 100000,
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      currentSavings: 20000,
      employerMatchPercent: 0.5,
      employerMaxMatchPercent: 0.03,
      retirementAge: 65,
    };

    const errors = validator.validateInput(
      input,
      0, // currentYearsContribution
      0, // currentYearsAdditionalContribution
      0, // currentYearsEmployerMatch
      0, // currentYearsAdditionalEmployerMatch
      {}, // errors
      {} // errorMessages
    );
    expect(errors).toBeUndefined();
  });

  it("returns errors for invalid input", () => {
    const validator = new InputValidator(initialValues);
    const input: RetirementCalculatorInput = {
      annualIncome: -5000, // Invalid income
      contributionPercent: 0.05,
      contributionFrequency: "annually",
      currentAge: 30,
      currentSavings: 20000,
      employerMatchPercent: 0.5,
      employerMaxMatchPercent: 0.03,
      retirementAge: 65,
    };

    const errors: RetirementCalculatorOutput["errors"] = {};

    // Generate detailed error messages based on the input validation
    const errorMessages: RetirementCalculatorInitialValues["errorMsgs"] =
      validator.createErrorMessages(input);

    validator.validateInput(
      input,
      0, // currentYearsContribution
      0, // currentYearsAdditionalContribution
      0, // currentYearsEmployerMatch
      0, // currentYearsAdditionalEmployerMatch
      errors, // errors
      errorMessages // errorMessages
    );

    expect(errors?.annualIncome).toBeDefined();
  });
});
