export interface RetirementCalculatorInitialValues {
  annualIncomeLimits?: [number, number]; // Annual income limits for contribution calculation
  annualIncomeIncreasePercent?: number; // Expected annual income increase rate (e.g., 0.03 for 3%)
  annualInflationPercent?: number; // Expected inflation rate as percent (e.g., 0.03 for 3%)
  annualPostRetirementReturnPercent?: number; // Expected annual return rate on savings after retirement (e.g., 0.05 for 5%)
  annualRetirementSavingsReturnPercent?: number; // Expected annual return rate on savings (e.g., 0.08 for 8%)
  endOfRetirementAge?: number; // End of retirement age (e.g., 95)
  errorMsgs?: {
    additionalContributionDollar?: string;
    additionalContributionPercent?: string;
    annualIncome?: string;
    annualContributionLimit?: string;
    contributionsOverAnnualIncome?: string;
    contributionDollar?: string;
    contributionPercent?: string;
    currentAge?: string;
    currentSavings?: string;
    employerMatchPercent?: string;
    employerMaxMatchPercent?: string;
    endOfRetirementAge?: string;
    retirementAge?: string;
  };
  /**
   * IRS limits for retirement accounts
   * Set 401k limits OR IRA limits, not both.
   */
  irsLimits: {
    annual401kLimit?: number; // Annual limit for 401(k) contributions
    annualIRALimit?: number; // Annual limit for IRA contributions
    catchUpIRAOver50?: number; // Catch-up contribution for IRA for those over 50
    catchUp401kOver50?: number; // Catch-up contribution for 401(k) for those over 50
    catchUp401k60_63?: number; // Additional catch-up contribution for 401(k) for those 60 to 63
  };
  minAnnualRetirementIncomePercent?: number; // Annual minimum retirement income percentage (e.g., 0.8 for 80%)
  minimumAge?: number;
  normalRetirementAge?: number; // Normal retirement age (e.g., 67 or 59.5)
  withdrawalAge?: number; // Age when minimal withdrawals are required. (e.g., 75)
}

export interface RetirementCalculatorInput {
  additionalContributionDollar?: number; // Additional contribution in dollars
  additionalContributionPercent?: number; // Additional contribution as a percentage of income
  annualIncome: number;
  contributionDollar?: number; // Contribution in dollars
  contributionFrequency:
    | "annually"
    | "biweekly"
    | "monthly"
    | "twiceMonthly"
    | "weekly";
  contributionPercent?: number; // Contribution as a percentage of income
  currentAge: number;
  currentSavings?: number;
  employerMatchPercent?: number; // Employer matching percentage
  employerMaxMatchPercent?: number; // Employer maximum matching percentage
  retirementAge: number;
}

export interface RetirementCalculatorOutput {
  errors?: {
    additionalContributionDollar?: string;
    additionalContributionPercent?: string;
    annualIncome?: string;
    annualContributionLimit?: string;
    contributionsOverAnnualIncome?: string;
    contributionDollar?: string;
    contributionPercent?: string;
    currentAge?: string;
    currentSavings?: string;
    employerMatchPercent?: string;
    employerMaxMatchPercent?: string;
    endOfRetirementAge?: string;
    retirementAge?: string;
  };
  results?: {
    projectedMonthlyIncome: number;
    projectedYearlyIncome: number;
    savingsDuration: {
      years: number;
      months: number;
    };
    totalSavingsAtRetirement: number; // Total savings at retirement, including employer match, but excluding additional contributions
    totalAdditionalSavingsAtRetirement: number; // Total savings at retirement, including employer match and additional contributions
    totalSavingsDifferenceAtRetirement: number; // Difference between total savings with and without additional contributions
    totalSavingsDifferencePercentageAtRetirement: number; // Percent difference between total savings with and without additional contributions
  };
}
