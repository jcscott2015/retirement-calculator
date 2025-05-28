import { CalcUtilities } from "./CalcUtilitiesClass.mjs";
export class SavingsCalculator {
  constructor(initialValues) {
    this.initialValues = initialValues;
    this.calcUtilities = new CalcUtilities();
    /**
     * Calculates the total savings at the end of a specified number of years,
     * including the future value of current savings and contributions made during
     * the working years, adjusted for annual income increases and investment returns.
     *
     * @param currentSavings - The current amount of savings.
     * @param totalContributions - The total annual contributions made towards savings.
     * @param years - The number of years until retirement.
     * @returns The total future value of savings, including the future value of the
     *          principal and adjusted contributions.
     */
    this.calculateTotalSavings = (
      currentSavings,
      totalContributions,
      years
    ) => {
      const {
        annualIncomeIncreasePercent = 0,
        annualRetirementSavingsReturnPercent = 0.08,
      } = this.initialValues;
      // Calculate the future value of principal
      const principalFutureValue = this.calcUtilities.futureValue(
        currentSavings,
        annualRetirementSavingsReturnPercent,
        years
      );
      // Calculate the future value of contributions
      // Adjust the contributions for the annual income increase and retirement savings return
      let adjustedContributions = 0;
      if (totalContributions > 0) {
        const adjustedRatio = 1 + annualRetirementSavingsReturnPercent; // Interest rate
        const adjustedAnnualIncome = 1 + annualIncomeIncreasePercent; // Annual income increase rate
        adjustedContributions =
          totalContributions *
          this.calcUtilities.geometricSeries(
            1,
            adjustedRatio * adjustedAnnualIncome,
            years
          );
      }
      // Return the total future value
      return principalFutureValue + adjustedContributions;
    };
    /**
     * Calculates the maximum retirement age based on the provided input and initial values.
     *
     * @param retirementAge - The retirement age input.
     * @returns The maximum retirement age, which is determined by taking the minimum
     *          of the withdrawal age and the maximum of the normal retirement age
     *          and the provided retirement age.
     */
    this.getMaximumRetirementAge = (retirementAge) => {
      const { normalRetirementAge = 65, withdrawalAge = 75 } =
        this.initialValues;
      return Math.min(
        withdrawalAge,
        Math.max(normalRetirementAge, retirementAge)
      );
    };
  }
  /**
   * Calculates the projected retirement savings based on the total contributions,
   * annual retirement savings return percentage, and the number of working years
   * until retirement.
   *
   * @param input - The input object containing retirement-related data.
   * @param totalContributions - The total amount of contributions made towards retirement savings.
   * @returns The projected retirement savings amount, adjusted for the annual return percentage,
   * annual wage increases, and the number of working years until retirement.
   */
  calculateProjectedRetirementSavings(input, totalContributions) {
    const { currentAge, currentSavings = 0, retirementAge } = input;
    // Years while working and contributing to retirement
    const workingYears = retirementAge - currentAge;
    const workingSavings = this.calculateTotalSavings(
      currentSavings,
      totalContributions,
      workingYears
    );
    // Non-working years remaining until retirement -- no contributions
    const nonWorkingYearsUntilRetirement =
      this.getMaximumRetirementAge(retirementAge) - (currentAge + workingYears);
    let nonWorkingSavings = 0;
    if (nonWorkingYearsUntilRetirement > 0) {
      nonWorkingSavings = this.calculateTotalSavings(
        workingSavings,
        0,
        nonWorkingYearsUntilRetirement
      );
    }
    // Return the total retirement savings
    return Math.max(workingSavings, nonWorkingSavings);
  }
  /**
   * Calculates the duration for which savings will last during retirement,
   * along with projected monthly and yearly income based on the provided inputs.
   *
   * @param input - The input object containing retirement-related data.
   * @param totalSavingsAtRetirement - The total savings available at the start of retirement.
   * @returns An object containing:
   *   - `months`: The remainder after dividing the total months the savings will last by 12.
   *   - `projectedMonthlyIncome`: The projected monthly income during retirement.
   *   - `projectedYearlyIncome`: The projected yearly income during retirement.
   *   - `years`: The total number of full years the savings will last.
   */
  calculateSavingsDuration(input, totalSavingsAtRetirement) {
    const {
      annualIncomeIncreasePercent = 0,
      annualPostRetirementReturnPercent = 0.05,
      annualInflationPercent = 0.03,
      endOfRetirementAge = 95,
      minAnnualRetirementIncomePercent = 0.8,
    } = this.initialValues;
    const { annualIncome, currentAge, retirementAge } = input;
    // Explicitly define the number of months in a year
    const monthsInYear = 12;
    /**
     * Minimum annual retirement income based on the minAnnualRetirementIncomePercent
     * of the maximum annual income during working years.
     */
    const minAnnualRetirementIncome =
      this.calcUtilities.futureValue(
        annualIncome,
        annualIncomeIncreasePercent,
        retirementAge - currentAge
      ) * Math.max(0, minAnnualRetirementIncomePercent);
    let months = 0;
    let years =
      endOfRetirementAge - this.getMaximumRetirementAge(retirementAge);
    const evenlyProjectedYearlyIncome = this.calcUtilities.savingsPayout(
      totalSavingsAtRetirement,
      annualPostRetirementReturnPercent - annualInflationPercent,
      years
    );
    let projectedYearlyIncome = evenlyProjectedYearlyIncome;
    if (evenlyProjectedYearlyIncome < minAnnualRetirementIncome) {
      ({ years, months } = this.calcUtilities.savingsPayoutDuration(
        totalSavingsAtRetirement,
        minAnnualRetirementIncome,
        annualPostRetirementReturnPercent,
        annualInflationPercent
      ));
      projectedYearlyIncome = minAnnualRetirementIncome;
    }
    const projectedMonthlyIncome = projectedYearlyIncome / monthsInYear;
    return {
      months,
      projectedMonthlyIncome,
      projectedYearlyIncome,
      years,
    };
  }
}
