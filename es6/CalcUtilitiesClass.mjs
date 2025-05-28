export class CalcUtilities {
  /**
   * Safely divides two numbers, returning 0 if the denominator is 0.
   *
   * @param numerator - The number to be divided (the dividend).
   * @param denominator - The number by which to divide (the divisor).
   * @returns The result of the division, or 0 if the denominator is 0.
   */
  safeDivide(numerator, denominator) {
    if (denominator === 0) return 0;
    return numerator / denominator;
  }
  /**
   * Rounds a given number to a specified precision and ensures the result is a
   * floating-point number.
   *
   * @param number - The number to be rounded. If the input is not a valid
   * number (NaN), the function returns 0.
   * @param precision - The number of decimal places to round to. Defaults to 2
   * if not provided.
   * @returns The rounded number with the specified precision.
   */
  precisionNumber(number, precision = 2) {
    if (isNaN(number) || precision < 0) return 0;
    const factor = Math.pow(10, precision);
    const roundedNumber = Math.round(number * factor) / factor;
    return parseFloat(roundedNumber.toFixed(precision));
  }
  /**
   * Calculates the duration (in years and months) that a given savings will last
   * based on withdrawal amount, interest rate, and inflation rate.
   *
   * @param savings - The initial amount of savings available.
   * @param withdawal - The annual withdrawal amount.
   * @param interestRate - The annual interest rate (as a decimal, e.g., 0.05 for 5%).
   * @param inflationRate - The annual inflation rate (as a decimal, e.g., 0.02 for 2%).
   * @returns An object containing the duration in years and months.
   * @links
   * - [When Will Your Money Run Out?](https://home.ubalt.edu/ntsbarsh/business-stat/otherapplets/CompoundCal.htm#rjava12
   * @description
   * This function calculates the duration (in years) that a given savings will last
   * based on the withdrawal amount, interest rate, and inflation rate.
   * It uses a logarithmic formula to determine how long the savings can sustain
   * the specified withdrawals, taking into account the growth of the savings
   * due to interest and the eroding effect of inflation.
   * The formula used is:
   * \[
   *   \text{Duration} = \frac{-\log(1 - \frac{\text{Savings} \cdot \text{Adjusted Growth}}{\text{Withdrawal} \cdot (1 + \text{Interest Rate})})}{\log(\frac{1 + \text{Interest Rate}}{1 + \text{Inflation Rate}})}
   * \]
   * where:
   * - \(\text{Adjusted Growth} = \frac{(1 + \text{Interest Rate})}{(1 + \text{Inflation Rate})} - 1\)
   * - \(\text{Savings}\) is the initial amount of savings available.
   * - \(\text{Withdrawal}\) is the annual withdrawal amount.
   * - \(\text{Interest Rate}\) is the annual interest rate (as a decimal).
   * - \(\text{Inflation Rate}\) is the annual inflation rate (as a decimal).
   * @example
   * ```typescript
   * const calcUtils = new CalcUtilities();
   * const duration = calcUtils.savingsPayoutDuration(100000, 5000, 0.05, 0.02);
   * console.log(duration); // Output: Duration in years
   * ```
   *
   */
  savingsPayoutDuration(savings, withdrawal, interestRate, inflationRate) {
    // Explicitly define the number of months in a year
    const monthsInYear = 12;
    // Calculate the base for the logarithmic formula
    const base = (1 + interestRate) / (1 + inflationRate);
    // Adjust savings growth for interest and inflation
    // Subtracting 1 accounts for the fact that the first year of growth
    // is already included in the initial contributions, ensuring no double-counting.
    const adjustedGrowth = base - 1;
    // Calculate the numerator and denominator for the formula
    const numerator = savings * adjustedGrowth;
    const denominator = withdrawal * base;
    // Validate inputs to ensure the calculation is feasible
    if (
      denominator === 0 ||
      base <= 0 ||
      base === 1 ||
      numerator >= denominator
    ) {
      // Return { years: 0, months: 0 } if the calculation is invalid.
      return { years: 0, months: 0 };
    }
    // Calculate and...
    const durationYrs =
      (-1 * Math.log(1 - numerator / denominator)) / Math.log(base);
    const totalMonths = Math.round(durationYrs * monthsInYear);
    const years = Math.floor(durationYrs);
    const months = totalMonths % monthsInYear;
    // ...return the duration as object of years and months
    return { years, months };
  }
  /**
   * Calculates the savings payout for a given principal, interest rate (minus any inflation rate),
   * and number of years.
   *
   * The function computes the payout by dividing the future value of the principal
   * (calculated for one year less than the total years) by the geometric series sum
   * of the interest rate over the specified number of years.
   *
   * @param p - The principal amount (initial investment or loan amount).
   * @param r - The annual interest rate (as a decimal, e.g., 0.05 for 5%, minus any inflation rate).
   * @param y - The number of years for the savings.
   * @returns The savings payout amount.
   * @description
   * This function calculates the savings payout using the formula:
   * \[
   *   \text{Savings Payout} = \frac{\text{Future Value}(P, r, y - 1)}{\text{Geometric Series}(0, 1 + r, y - 1)}
   * \]
   * where:
   * - \(P\) is the principal amount (initial investment or loan amount).
   * - \(r\) is the annual interest rate (as a decimal).
   * - \(y\) is the number of years for the savings.
   * - \(\text{Future Value}(P, r, y - 1)\) is the future value of the principal after \(y - 1\) years.
   * - \(\text{Geometric Series}(0, 1 + r, y - 1)\) is the sum of the geometric series from index 0 to \(y - 1\).
   */
  savingsPayout(p, r, y) {
    return (
      this.futureValue(p, r, y - 1) / this.geometricSeries(0, 1 + r, y - 1)
    );
  }
  /**
   * Calculates the future value of an investment based on the principal amount,
   * annual interest rate, and number of years.
   *
   * @param p - The principal amount (initial investment).
   * @param r - The annual interest rate (as a decimal, e.g., 0.05 for 5%).
   * @param y - The number of years the money is invested or borrowed for.
   * @returns The future value of the investment.
   * @description
   * This function computes the future value of an investment using the formula:
   * \[
   *   \text{Future Value} = P \times (1 + r)^y
   * \]
   * where:
   * - \(P\) is the principal amount (initial investment).
   * - \(r\) is the annual interest rate (as a decimal).
   * - \(y\) is the number of years the money is invested or borrowed for.
   */
  futureValue(p, r, y) {
    return p * Math.pow(1 + r, y);
  }
  /**
   * Calculates the sum of a geometric series from a specified starting index to an ending index.
   *
   * @param a - The starting index of the series (inclusive). If `a` is 0, the series starts from the beginning.
   * @param r - The common ratio of the geometric series.
   * @param n - The ending index of the series (inclusive).
   * @returns The sum of the geometric series from index `a` to `n`.
   *
   * @remarks
   * - If `r` is 1, the series is constant, and the function returns `n - a + 1`.
   * - For other values of `r`, the function calculates the sum using the formula for a geometric series.
   * - If `a > 0`, the sum of terms from index 0 to `a-1` is subtracted from the total sum.
   *
   * @description
   * This function computes the sum or difference of a finite geometric series.
   * The series is defined as:
   * S = a + ar + ar^2 + ... + ar^(n-1)
   * where:
   * - a is the first term of the series.
   * - r is the common ratio.
   * - n is the number of terms.
   *
   * @example
   * ```typescript
   * const sum = geometricSeries(2, 2, 4); // Calculates the sum of the series from index 2 to 4 with a ratio of 2
   * console.log(sum); // Output: 28
   * const sum2 = geometricSeries(0, 1, 4); // Calculates the sum of the series from index 0 to 4 with a ratio of 1
   * console.log(sum2); // Output: 5
   * ```
   */
  geometricSeries(a, r, n) {
    // Special case: constant series
    if (r === 1) return n - a + 1;
    // Calculate the sum from index 0 to n
    const totalSum = (Math.pow(r, n + 1) - 1) / (r - 1);
    // Subtract the sum of terms from index 0 to a-1 if a > 0
    const excludedSum = a > 0 ? (Math.pow(r, a) - 1) / (r - 1) : 0;
    // Return the adjusted sum
    return totalSum - excludedSum;
  }
}
