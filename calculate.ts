import { RetirementCalculator } from "./RetirementCalculatorClass";

const calculator = new RetirementCalculator({
  annualInflationPercent: 0.03,
  // annualIncomeIncreasePercent: 0.03,
  irsLimits: {
    annual401kLimit: 23500, // Annual limit for 401(k) contributions
    // annualIRALimit: 7000, // Annual limit for IRA contributions
    // catchUpIRAOver50: 1000, // Catch-up contribution for IRA for those over 50
    catchUp401kOver50: 7500, // Catch-up contribution for 401(k) for those over 50
    catchUp401k60_63: 11250, // Additional catch-up contribution for 401(k) for those 60 to 63
  },
});

const result = calculator.calculate({
  // additionalContributionDollar: 5000,
  additionalContributionPercent: 0.01,
  annualIncome: 100000,
  // contributionFrequency: "weekly",
  // contributionDollar: 200,
  contributionFrequency: "annually",
  contributionPercent: 0.02,
  currentAge: 30,
  // currentSavings: 20000,
  employerMatchPercent: 1,
  employerMaxMatchPercent: 0.03,
  retirementAge: 50,
});

if (result.errors) {
  console.error("Errors:", result.errors);
} else {
  console.log("Results:", result.results);
}
