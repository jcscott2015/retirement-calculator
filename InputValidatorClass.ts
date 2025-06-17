import {
  RetirementCalculatorInitialValues,
  RetirementCalculatorInput,
  RetirementCalculatorOutput,
} from "./retirementCalculatorTypes";

export class InputValidator {
  private readonly initialValues: RetirementCalculatorInitialValues;
  private readonly DEFAULT_ERROR_MESSAGES: RetirementCalculatorInitialValues["errorMsgs"];
  private readonly convertToNumberFriendlyFormat: (
    num: number,
    toUpperCase?: boolean,
    threshold?: number
  ) => string;
  private readonly replaceAllInString: (
    str: string,
    replacements?: Record<string, string>,
    input?: RetirementCalculatorInput
  ) => string;
  private readonly replaceAllInErrorMessages: (
    errorMsgs: RetirementCalculatorInitialValues["errorMsgs"]
  ) => RetirementCalculatorInitialValues["errorMsgs"];

  constructor(initialValues: RetirementCalculatorInitialValues) {
    this.initialValues = initialValues;

    /**
     * A collection of default error messages used for validating retirement calculator inputs.
     * Each key corresponds to a specific input field, and the value is the error message
     * associated with invalid input for that field.
     */
    this.DEFAULT_ERROR_MESSAGES = {
      additionalContributionDollar:
        "Additional contribution dollars must be greater than or equal to zero.",
      additionalContributionPercent:
        "Additional contribution percentage must be between 0 and 100.",
      annualIncome:
        "Annual income must be between [annualIncomeMin] and [annualIncomeMax].",
      annualContributionLimit:
        "Annual contribution exceeds IRS limit of [annualContributionLimitAmt].",
      contributionsOverAnnualIncome:
        "Total contributions exceed annual income.",
      contributionDollar:
        "Contribution dollars must be greater than or equal to zero.",
      contributionPercent:
        "Contribution percentage must be between 0 and 100%.",
      currentAge: "Age must be between [minimumAge] and [retirementAge]",
      currentSavings: "Current savings cannot be negative.",
      employerMatchPercent:
        "Employer matching percentage must be between 0 and 100%.",
      employerMaxMatchPercent:
        "Employer maximum matching percentage must be between 0 and 100%.",
      endOfRetirementAge:
        "End of retirement age must be greater than retirement age.",
      retirementAge: "Retirement age must be greater than current age.",
    };

    /**
     * Converts a number into a more human-readable format using SI symbols (e.g., "k" for thousand, "M" for million).
     *
     * @param num - The number to be converted.
     * @param toUpperCase - Optional. If true, the SI symbol will be in uppercase. Defaults to false.
     * @param threshold - Optional. The threshold value for determining when to apply SI symbols. Defaults to 1000.
     * @returns A string representing the number in a human-readable format with an appropriate SI symbol.
     */
    this.convertToNumberFriendlyFormat = (num, toUpperCase, threshold) => {
      const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
      const cap = threshold ?? 1000;
      if (num < cap) return num.toFixed(0);
      const e = Math.floor(Math.log(num) / Math.log(cap));
      const siSymbol = toUpperCase ? SI_SYMBOL[e].toUpperCase() : SI_SYMBOL[e];
      return `${(num / cap ** e).toFixed(num <= cap ? 0 : 1)}${siSymbol}`;
    };

    /**
     * Replaces all placeholders in a given string with corresponding values from the provided inputs.
     *
     * Placeholders in the string are denoted by square brackets (e.g., `[placeholder]`).
     * The method searches for these placeholders and replaces them with values from the `input` object
     * or the optional `replacements` record. If a placeholder's value is not found in either source, it is left unchanged.
     *
     * - If the replacement value is a number and the placeholder key includes "percent" (case-insensitive),
     *   the number is converted to a percentage string (e.g., `0.25` becomes `25%`).
     * - If the replacement value is a number and does not include "percent", it is converted to a locale string.
     * - If the replacement value is neither a string nor a number, the placeholder is not replaced.
     *
     * @param str - The input string containing placeholders to be replaced.
     * @param replacements - An optional record of additional key-value pairs for replacement.
     * @param input - An optional object containing values to replace placeholders.
     * @returns The input string with placeholders replaced by corresponding values.
     */
    this.replaceAllInString = (str, replacements, input) => {
      const placeholders: string[] = str.match(/\[\w+\]/g) || [];
      return placeholders.reduce((result: string, placeholder) => {
        const placeholderKey = placeholder.replace(/[[\]]/g, "");
        let replacement =
          input?.[placeholderKey as keyof RetirementCalculatorInput] ??
          replacements?.[placeholderKey];
        if (typeof replacement === "undefined") return result;
        if (typeof replacement === "number") {
          if (placeholderKey.toLowerCase().includes("percent")) {
            // Convert percentage to decimal
            replacement = `${replacement * 100}%`;
          } else {
            // Convert numbers to locale strings
            replacement = replacement.toLocaleString();
          }
        } else if (typeof replacement !== "string") {
          // Replacement must be a number or a string
          return result;
        }
        return result.split(placeholder).join(replacement);
      }, str);
    };

    /**
     * Replaces all placeholders in the error messages with corresponding values from the input object.
     *
     * @param errorMsgs - An object containing error messages with placeholders to be replaced.
     *                     Each key corresponds to a specific input field, and the value is the error message.
     * @returns A new object with the same keys as `errorMsgs`, but with placeholders replaced by actual values.
     */
    this.replaceAllInErrorMessages = (errorMsgs) =>
      Object.entries(errorMsgs ?? {}).reduce((msgs, [key, value]) => {
        const acc = msgs as Record<string, string>;
        acc[key as keyof RetirementCalculatorInitialValues["errorMsgs"]] =
          this.replaceAllInString(value);
        return acc;
      }, {} as unknown) as RetirementCalculatorInitialValues["errorMsgs"];
  }

  /**
   * Gets the annual contribution limit for a retirement account based on IRS limits and the individual's age.
   *
   * @param age - The current age of the individual.
   * @returns The calculated annual contribution limit based on the provided inputs.
   */
  public getAnnualContributionLimit(age: number): number {
    const { irsLimits: limits } = this.initialValues;
    let annualContributionLimit = Infinity; // Initially, no limits provided
    if (limits.annualIRALimit && limits.catchUpIRAOver50) {
      annualContributionLimit = limits.annualIRALimit;
      if (age >= 50) {
        annualContributionLimit += limits.catchUpIRAOver50;
      }
    } else if (
      limits.annual401kLimit &&
      limits.catchUp401kOver50 &&
      limits.catchUp401k60_63
    ) {
      annualContributionLimit = limits.annual401kLimit;
      if (age >= 50) {
        annualContributionLimit += limits.catchUp401kOver50;
      }
      if (age >= 60 && age <= 63) {
        annualContributionLimit += limits.catchUp401k60_63;
      }
    }
    return annualContributionLimit;
  }

  /**
   * Generates error messages for the provided retirement calculator input.
   *
   * This method processes the input object to create user-friendly error messages
   * by replacing placeholders in default and custom error message templates with
   * specific values derived from the input. It also converts annual income limits
   * into a more readable format for inclusion in the error messages.
   *
   * @param input - The input object containing retirement-related data.
   * @returns An object containing the generated error messages, with placeholders
   * replaced by the corresponding values from the input.
   */
  public createErrorMessages(
    input: RetirementCalculatorInput
  ): RetirementCalculatorInitialValues["errorMsgs"] {
    const { annualIncomeLimits = [1000, 10000000], errorMsgs } =
      this.initialValues;
    const { currentAge } = input;

    const annualContributionLimitStr =
      this.DEFAULT_ERROR_MESSAGES?.annualContributionLimit ?? "";

    const annualContributionLimitAmt =
      "$" + this.getAnnualContributionLimit(currentAge).toLocaleString();

    // Convert annual income limits to a more user-friendly format
    const annualIncomeStr = this.DEFAULT_ERROR_MESSAGES?.annualIncome ?? "";
    const annualIncomeMin = this.convertToNumberFriendlyFormat(
      annualIncomeLimits[0],
      true
    );
    const annualIncomeMax = this.convertToNumberFriendlyFormat(
      annualIncomeLimits[1],
      true
    );

    return {
      ...this.replaceAllInErrorMessages(this.DEFAULT_ERROR_MESSAGES),
      annualContributionLimit: this.replaceAllInString(
        annualContributionLimitStr,
        {
          annualContributionLimitAmt,
        }
      ),
      annualIncome: this.replaceAllInString(annualIncomeStr, {
        annualIncomeMin,
        annualIncomeMax,
      }),
      ...this.replaceAllInErrorMessages(errorMsgs),
    };
  }

  /**
   * Validates the input data for a retirement calculator and populates the errors object
   * with appropriate error messages if any validation rules are violated.
   *
   * @param input - The input data for the retirement calculator, containing various financial
   * and demographic details such as contributions, income, age, and savings.
   * @param currentYearsContribution - The total contribution made in the current year.
   * @param currentYearsAdditionalContribution - The additional contribution made in the current year.
   * @param currentYearsEmployerMatch - The employer's matching contribution for the current year.
   * @param currentYearsAdditionalEmployerMatch - The employer's additional matching contribution for the current year.
   * @param errors - An object to store validation errors. Defaults to an empty object.
   * @param errorMessages - An object containing error messages corresponding to validation rules.
   * Defaults to an empty object.
   *
   * @remarks
   * The method performs the following validations:
   * - Ensures the total annual contribution does not exceed IRS limits.
   * - Ensures contributions do not exceed the annual income.
   * - Validates that contributions and percentages are within acceptable ranges.
   * - Checks that income is within specified limits.
   * - Validates age-related constraints, such as retirement age and minimum age.
   * - Ensures savings and employer match percentages are non-negative and within valid ranges.
   * - Ensures the end of retirement age is greater than the retirement age.
   *
   * If any validation fails, the corresponding error key in the `errors` object is populated
   * with the appropriate error message from the `errorMessages` object.
   */
  public validateInput(
    input: RetirementCalculatorInput,
    currentYearsContribution: number,
    currentYearsAdditionalContribution: number,
    currentYearsEmployerMatch: number,
    currentYearsAdditionalEmployerMatch: number,
    errors: RetirementCalculatorOutput["errors"] = {},
    errorMessages: RetirementCalculatorInitialValues["errorMsgs"] = {}
  ) {
    const {
      annualIncomeLimits = [1000, 10000000],
      endOfRetirementAge = 95,
      minimumAge = 16,
    } = this.initialValues;

    const {
      additionalContributionDollar = 0,
      additionalContributionPercent = 0,
      annualIncome,
      contributionDollar = 0,
      contributionPercent = 0,
      currentAge,
      currentSavings = 0,
      employerMatchPercent = 0,
      employerMaxMatchPercent = 0,
      retirementAge,
    } = input;

    // Validate if the annual contribution limit exceeds this year's IRS limits
    if (
      currentYearsContribution +
        currentYearsAdditionalContribution +
        currentYearsEmployerMatch +
        currentYearsAdditionalEmployerMatch >
      this.getAnnualContributionLimit(currentAge)
    ) {
      errors.annualContributionLimit = errorMessages.annualContributionLimit;
    }

    // Validate that all contributions are not exceeding income.
    if (
      currentYearsAdditionalContribution + currentYearsContribution >
      annualIncome
    ) {
      errors.contributionsOverAnnualIncome =
        errorMessages.contributionsOverAnnualIncome;
    }

    if (additionalContributionDollar < 0) {
      errors.additionalContributionDollar =
        errorMessages.additionalContributionDollar;
    }
    if (
      additionalContributionPercent < 0 ||
      additionalContributionPercent > 100
    ) {
      errors.additionalContributionPercent =
        errorMessages.additionalContributionPercent;
    }
    if (
      annualIncome < annualIncomeLimits[0] ||
      annualIncome > annualIncomeLimits[1]
    ) {
      errors.annualIncome = errorMessages.annualIncome;
    }
    if (contributionDollar < 0) {
      errors.contributionDollar = errorMessages.contributionDollar;
    }
    if (contributionPercent < 0 || contributionPercent > 1) {
      errors.contributionPercent = errorMessages.contributionPercent;
    }
    if (currentAge >= retirementAge) {
      errors.retirementAge = errorMessages.retirementAge;
    }
    if (currentAge < minimumAge || currentAge > retirementAge) {
      errors.currentAge = errorMessages.currentAge;
    }
    if (currentSavings < 0) {
      errors.currentSavings = errorMessages.currentSavings;
    }
    if (employerMatchPercent < 0 || employerMatchPercent > 1) {
      errors.employerMatchPercent = errorMessages.employerMatchPercent;
    }
    if (employerMaxMatchPercent < 0 || employerMaxMatchPercent > 1) {
      errors.employerMaxMatchPercent = errorMessages.employerMaxMatchPercent;
    }
    if (endOfRetirementAge <= retirementAge) {
      errors.endOfRetirementAge = errorMessages.endOfRetirementAge;
    }
    if (retirementAge <= currentAge) {
      errors.retirementAge = errorMessages.retirementAge;
    }
  }
}
