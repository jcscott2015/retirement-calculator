import { CalcUtilities } from "./CalcUtilitiesClass.mjs";
import { ContributionCalculator } from "./ContributionCalculatorClass.mjs";
import { InputValidator } from "./InputValidatorClass.mjs";
import { SavingsCalculator } from "./SavingsCalculatorClass.mjs";
export class RetirementCalculator {
  constructor(initialValues) {
    this.calcUtilities = new CalcUtilities();
    this.contributionCalculator = new ContributionCalculator();
    this.inputValidator = new InputValidator(initialValues);
    this.savingsCalculator = new SavingsCalculator(initialValues);
  }
  /**
   * Calculates the projected retirement savings, income, and other related metrics
   * based on the provided input data. This method validates the input, computes
   * contributions, and determines the savings duration and income projections.
   *
   * @param input - The input data required for the retirement calculation, including
   *                user-specific financial details and assumptions.
   *
   * @returns An object containing either the calculated results or validation errors:
   *          - `results`: The calculated retirement metrics, including:
   *              - `projectedMonthlyIncome`: The projected monthly income during retirement.
   *              - `projectedYearlyIncome`: The projected yearly income during retirement.
   *              - `savingsDuration`: The duration (in years and months) the savings will last.
   *              - `totalSavingsAtRetirement`: Total savings at retirement without additional contributions.
   *              - `totalAdditionalSavingsAtRetirement`: Total savings at retirement with additional contributions.
   *              - `totalSavingsDifferenceAtRetirement`: The absolute difference in savings with and without additional contributions.
   *              - `totalSavingsDifferencePercentageAtRetirement`: The percentage difference in savings with and without additional contributions.
   *          - `errors`: An object containing validation errors, if any.
   */
  calculate(input) {
    const errors = {};
    const results = {
      projectedMonthlyIncome: 0,
      projectedYearlyIncome: 0,
      savingsDuration: { years: 0, months: 0 },
      totalSavingsAtRetirement: 0,
      totalAdditionalSavingsAtRetirement: 0,
      totalSavingsDifferenceAtRetirement: 0,
      totalSavingsDifferencePercentageAtRetirement: 0,
    };
    // Calculate contributions
    const {
      annualAdditionalContribution,
      annualContribution,
      annualEmployerMatch,
    } = this.contributionCalculator.calculateTotalAnnualContribution(input);
    // Generate detailed error messages based on the input validation
    const errorMessages = this.inputValidator.createErrorMessages(input);
    // Validate input
    this.inputValidator.validateInput(
      input,
      this.calcUtilities.precisionNumber(annualAdditionalContribution),
      this.calcUtilities.precisionNumber(annualContribution),
      this.calcUtilities.precisionNumber(annualEmployerMatch),
      errors,
      errorMessages
    );
    if (Object.keys(errors).length) {
      return { errors };
    }
    // Calculate savings at retirement without additional contributions
    results.totalSavingsAtRetirement = this.calcUtilities.precisionNumber(
      this.savingsCalculator.calculateProjectedRetirementSavings(
        input,
        annualContribution + annualEmployerMatch
      )
    );
    if (annualAdditionalContribution > 0) {
      // Calculate savings at retirement with additional contributions
      results.totalAdditionalSavingsAtRetirement =
        this.calcUtilities.precisionNumber(
          this.savingsCalculator.calculateProjectedRetirementSavings(
            input,
            annualContribution +
              annualAdditionalContribution +
              annualEmployerMatch
          )
        );
      // Calculate total savings difference at retirement with and without additional contributions
      results.totalSavingsDifferenceAtRetirement =
        this.calcUtilities.precisionNumber(
          Math.abs(
            results.totalAdditionalSavingsAtRetirement -
              results.totalSavingsAtRetirement
          )
        );
      // Calculate total savings difference percentage at retirement with and without additional contributions
      results.totalSavingsDifferencePercentageAtRetirement =
        this.calcUtilities.precisionNumber(
          this.calcUtilities.safeDivide(
            results.totalSavingsAtRetirement,
            results.totalAdditionalSavingsAtRetirement
          )
        );
    }
    // Calculate retirement savings duration
    const { months, projectedMonthlyIncome, projectedYearlyIncome, years } =
      this.savingsCalculator.calculateSavingsDuration(
        input,
        Math.max(
          results.totalAdditionalSavingsAtRetirement,
          results.totalSavingsAtRetirement
        )
      );
    results.savingsDuration = { years, months };
    results.projectedMonthlyIncome = this.calcUtilities.precisionNumber(
      projectedMonthlyIncome
    );
    results.projectedYearlyIncome = this.calcUtilities.precisionNumber(
      projectedYearlyIncome
    );
    return { results };
  }
}
