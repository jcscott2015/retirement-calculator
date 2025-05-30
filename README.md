# Capital Group Retirement Calculator

## Overview

This project is a TypeScript-based library for modeling retirement savings, contributions, and withdrawals. It is designed to help users estimate how much they will have saved by retirement, how long their savings will last, and what their projected retirement income could be. The code is modular, with each class handling a specific part of the calculation process.

## Retirement Calculation Flow

1. Initialize RetirementCalculator with initial values:

   - inflation rate, IRS limits, etc.

2. User provides input:

   - age, income, contributions, employer match, retirement age, etc.

3. Calculate annual contributions:

   - Use ContributionCalculator to compute:
     - Employee contribution (percent or dollar)
     - Additional contribution
     - Employer match (subject to employer max)

4. Validate input:

   - Use InputValidator to check:
     - Contributions do not exceed IRS or income limits
     - Age and other values are within valid ranges
     - If invalid, return errors

5. If input is valid:

   - Use SavingsCalculator to:
     - Project total savings at retirement (compound growth, salary increases)
     - Optionally, project with and without additional contributions
   - Calculate difference and percent difference

6. Calculate retirement income and duration:

   - Use SavingsCalculator to estimate:
     - How long savings will last (years, months)
     - Projected annual/monthly income (target: 80% of final salary)

7. Return results or errors.

---

## Main Components

### 1. CalcUtilitiesClass

This class provides reusable mathematical methods for financial calculations:

- **futureValue(p, r, y):**  
   Calculates the future value of a principal amount `p` after `y` years at an annual interest rate `r`.

  ```math
  FV = P(1 + r)^y
  ```

- **geometricSeries(a, r, n):**
  Computes the sum of a geometric series from index `a` to `n` with common ratio `r`. Used for summing compounded contributions or withdrawals.

  ```math
  S = a + ar + ar^2 + ... + ar^{(n-1)} = \sum_{k=0}^n ar^k
  ```

- **savingsPayout(p, r, y):**
  Determines the maximum sustainable annual withdrawal from a lump sum `p` over `y` years, given a real return rate `r`.

  ```math
  Payout = \frac{P(1 + r)^y}{\sum_{k=0}^n ar^k}
  ```

- **savingsPayoutDuration(savings, withdrawal, interestRate, inflationRate):**
  Calculates how many years and months a given savings balance will last if a fixed withdrawal is made each year, accounting for interest and inflation.

  ```math
  Years = \frac{-\log(1 - \frac{P (\frac{1 + r}{1 + i} - 1)}A)}{\log(\frac{1 + r}{1 + i})}
  ```

- **safeDivide, precisionNumber:**
  Helper methods for safe division and rounding numbers to a specified precision.

---

### 2. ContributionCalculatorClass

This class provides the main contribution calculations:

- **calculateAnnualContribution(contributionDollar, contributionPercent, annualIncome, contributionFrequency):**
  Calculates the annual contribution based on either a percentage of annual income or a fixed dollar amount, distributed across a specified number of pay periods.

- **calculateTotalAnnualContribution(input):**
  Calculates the total annual contributions for a retirement plan, including the employee's contribution, and additional contributions.

---

### 3. SavingsCalculatorClass

This class orchestrates the main retirement calculations:

- **calculateTotalSavings(currentSavings, totalContributions, years):**
  Estimates the total savings at retirement by compounding current savings and adding the future value of annual contributions, adjusted for salary increases and investment returns.

- **getMaximumRetirementAge(retirementAge):**
  Ensures the retirement age used in calculations is within allowed bounds (e.g., not before "normal" retirement age or after a maximum withdrawal age).

- **calculateProjectedRetirementSavings(input, totalContributions):**
  Calculates the projected savings at retirement, considering both working years (with contributions) and any additional years before withdrawals begin.

- **calculateSavingsDuration(input, totalSavingsAtRetirement):**
  Determines how long the retirement savings will last, what the projected annual and monthly income will be, and whether the savings can support the target income (typically 80% of final salary) for the desired retirement duration.

---

### 4. InputValidatorClass

This class provides the error messages, custom error messages, and validation of initial and input values:

- **convertToNumberFriendlyFormat(num, toUpperCase, threshold):**
  Converts a number into a more human-readable format using SI symbols (e.g., "k" for thousand, "M" for million).

- **replaceAllInString(str, replacements, input):**
  Replaces all placeholders in a given string with corresponding values from the provided inputs.

- **replaceAllInErrorMessages(errorMsgs):**
  Replaces all placeholders in the error messages with corresponding values from the input object.

- **getAnnualContributionLimit(age):**
  Gets the annual contribution limit for a retirement account based on IRS limits and the individual's age.

- **createErrorMessages(input):**
  Generates error messages for the provided retirement calculator input.

- **validateInput(input, currentYearsAdditionalContribution, currentYearsContribution, currentYearsEmployerMatch, errors, errorMessages):**
  Validates the input data for a retirement calculator and populates the errors object with appropriate error messages if any validation rules are violated.

---

## How the Calculator Works

1. **User Input:**
   The user provides their age, income, current savings, contribution details, and employer match information.

2. **Projection:**
   The calculator estimates how much will be saved by retirement, factoring in annual contributions, salary increases, and investment growth.

3. **Withdrawal Simulation:**
   After retirement, the calculator models annual withdrawals (usually 80% of final salary), adjusting for inflation and investment returns, to see how long the savings will last.

4. **Results:**
   The user sees:
   - Projected savings at retirement
   - How many years their savings will last at the target income
   - Projected monthly and yearly retirement income

---

## Saving and Withdrawal Phases

1. **While Working:**

   - Savings grow each year by the investment return rate.
   - Contributions (including employer match) are added each year, increasing with salary.
   - Contributions cannot exceed IRS limits for current year.

2. **At Retirement:**

   - The total savings are calculated.
   - The calculator determines if the savings can support the target income for the desired number of years.

3. **During Retirement:**
   - Withdrawals are made each year.
   - Remaining savings continue to grow at the post-retirement return rate, adjusted for inflation.
   - If the savings run out before the end of the retirement period, the calculator reports how long the funds will last.

---

## Customization

- All rates (interest, inflation, salary growth) and ages (retirement, withdrawal, end of retirement) are configurable via the `initialValues` object.
- The code is modular, so classes can be swapped out or extended for different calculation rules or validation logic.

---

## Usage

Import the classes and use them in a TypeScript or JavaScript project. Example:

```typescript
import { SavingsCalculator } from "./SavingsCalculatorClass";

const initialValues = {
  annualRetirementSavingsReturnPercent: 0.08,
  annualPostRetirementReturnPercent: 0.05,
  annualInflationPercent: 0.03,
  annualIncomeIncreasePercent: 0.02,
  minAnnualRetirementIncomePercent: 0.8,
  endOfRetirementAge: 95,
  normalRetirementAge: 65,
  withdrawalAge: 75,
};

const calculator = new SavingsCalculator(initialValues);

const input = {
  currentAge: 40,
  currentSavings: 100000,
  annualIncome: 80000,
  retirementAge: 65,
};

const totalContributions = 15000; // Example annual contribution

const projectedSavings = calculator.calculateProjectedRetirementSavings(
  input,
  totalContributions
);
const duration = calculator.calculateSavingsDuration(input, projectedSavings);

console.log("Projected Savings at Retirement:", projectedSavings);
console.log("Retirement Duration and Income:", duration);
```

## Links

[Future Value](https://en.wikipedia.org/wiki/Future_value)

[Geometric Series](https://en.wikipedia.org/wiki/Geometric_series)

[Khan Academy Geometric Series Introduction](https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-factor/x2ec2f6f830c9fb89:geo-series/v/geo-series-intro)

[When Will Your Money Run Out?](https://home.ubalt.edu/ntsbarsh/business-stat/otherapplets/CompoundCal.htm#rjava12)

[Retirement Planner's Calculator](https://home.ubalt.edu/ntsbarsh/business-stat/otherapplets/CompoundCal.htm#rjava17)

```

```
