import { RetirementCalculatorInput } from "./retirementCalculatorTypes";

export class ContributionCalculator {
  private readonly PAY_PERIODS: Record<string, number>;
  private readonly calculateEmployerMatch: (
    annualIncome: number,
    contribution: number,
    employerMatchPercent: number,
    employerMaxMatchPercent: number
  ) => number;
  private readonly calculateAnnualContribution: (
    contributionDollar: number,
    contributionPercent: number,
    annualIncome: number,
    contributionFrequency: string
  ) => number;

  constructor() {
    this.PAY_PERIODS = {
      annually: 1,
      biweekly: 26,
      monthly: 12,
      twiceMonthly: 24,
      weekly: 52,
    };

    /**
     * Calculates the employer's matching contribution based on the employee's annual income,
     * their contribution, the employer's match percentage, and the employer's maximum match percentage.
     *
     * The employer match is the lesser of:
     * - The annual income multiplied by the employer's match percentage, and
     * - The employee's contribution multiplied by the employer's maximum match percentage.
     *
     * @param annualIncome - The employee's annual income.
     * @param contribution - The amount contributed by the employee.
     * @param employerMatchPercent - The percentage of annual income the employer will match.
     * @param employerMaxMatchPercent - The maximum percentage of the employee's contribution that the employer will match.
     * @returns The calculated employer match amount.
     */
    this.calculateEmployerMatch = (
      annualIncome,
      contribution,
      employerMatchPercent,
      employerMaxMatchPercent
    ) =>
      Math.min(
        annualIncome * employerMatchPercent,
        contribution * employerMaxMatchPercent
      );

    /**
     * Calculates the annual contribution based on either a percentage of annual income
     * or a fixed dollar amount, distributed across a specified number of pay periods.
     *
     * The function determines the contribution for each pay period from both the percentage
     * and dollar inputs, selects the higher of the two, and then scales it back up to the
     * annual total.
     *
     * @param contributionDollar - The fixed dollar amount to contribute annually.
     * @param contributionPercent - The percentage of annual income to contribute.
     * @param annualIncome - The total annual income used to calculate percentage-based contributions.
     * @param contributionFrequency - The frequency of contributions (e.g., annually, biweekly, monthly).
     * @returns The total annual contribution amount.
     */
    this.calculateAnnualContribution = (
      contributionDollar,
      contributionPercent,
      annualIncome,
      contributionFrequency = "annually"
    ) => {
      const payPeriods = this.PAY_PERIODS[contributionFrequency];
      const contributionFromPercent =
        contributionPercent > 0 ? annualIncome * contributionPercent : 0;
      const contributionFromDollar =
        contributionDollar > 0 ? contributionDollar : 0;
      return (
        Math.max(contributionFromPercent, contributionFromDollar) * payPeriods
      );
    };
  }

  /**
   * Calculates the total annual contributions for a retirement plan, including
   * the employee's contributions, additional contributions.
   *
   * @param input - An object containing the input parameters for the calculation:
   *   - `additionalContributionDollar` (optional): The fixed dollar amount of additional contributions.
   *   - `additionalContributionPercent` (optional): The percentage of annual income for additional contributions.
   *   - `contributionDollar` (optional): The fixed dollar amount of regular contributions.
   *   - `contributionPercent` (optional): The percentage of annual income for regular contributions.
   *   - `contributionFrequency` (optional): The frequency of contributions (e.g., "biweekly"). Defaults to "biweekly".
   *   - `annualIncome`: The annual income of the employee.
   *   - `employerMatchPercent` (optional): The percentage of contributions matched by the employer.
   *   - `employerMaxMatchPercent` (optional): The maximum percentage of salary matched by the employer.
   *
   * @returns An object containing:
   *   - `annualContribution`: The annual contribution from the employee.
   *   - `annualAdditionalContribution`: The annual additional contribution from the employee.
   *   - `annualEmployerMatch`: The annual employer match contribution.
   *   - `annualAdditionalEmployerMatch`: The annual employer match for additional contribution.
   */
  public calculateTotalAnnualContribution(input: RetirementCalculatorInput): {
    annualContribution: number;
    annualAdditionalContribution: number;
    annualEmployerMatch: number;
    annualAdditionalEmployerMatch: number;
  } {
    const {
      additionalContributionDollar = 0,
      additionalContributionPercent = 0,
      contributionDollar = 0,
      contributionPercent = 0,
      contributionFrequency = "biweekly",
      annualIncome,
      employerMatchPercent = 0,
      employerMaxMatchPercent = 0,
    } = input;

    const annualContribution = this.calculateAnnualContribution(
      contributionDollar,
      contributionPercent,
      annualIncome,
      contributionFrequency
    );

    const annualAdditionalContribution = this.calculateAnnualContribution(
      additionalContributionDollar,
      additionalContributionPercent,
      annualIncome,
      contributionFrequency
    );

    const annualEmployerMatch = this.calculateEmployerMatch(
      annualIncome,
      annualContribution,
      employerMatchPercent,
      employerMaxMatchPercent
    );

    const annualAdditionalEmployerMatch = this.calculateEmployerMatch(
      annualIncome,
      annualAdditionalContribution,
      employerMatchPercent,
      employerMaxMatchPercent
    );

    return {
      annualAdditionalContribution,
      annualAdditionalEmployerMatch,
      annualContribution,
      annualEmployerMatch,
    };
  }
}
