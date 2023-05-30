/**
 * Converts a CSV string into an array of strings.
 * @param {string} csv - The CSV string to convert.
 * @param {string} delimiter - The delimiter used to separate the entries in the CSV.
 * @returns {string[]} An array of strings representing the CSV entries.
 */
export function convertCsvToArray(csv: string, delimiter: string): string[] {
  const entries = csv.split(delimiter)
  const result: string[] = entries.map((entry) => entry.trim())
  return result
}

/**
 * Generate the past timestamp in ISO format in factor of number of weeks in the past.
 * @param {string} currentTimestamp ISO Format String
 * @param {number} numberOfWeeks Number of weeks you want to go in past
 * @returns {string} pastTimestamp ISO Format String
 */
export function generatePastTimestamp (currentTimestamp: string, numberOfWeeks: number) {
  const numberOfDaysInAWeek = 7

  const pastTimestamp = new Date()
  pastTimestamp.setUTCDate(pastTimestamp.getUTCDate() - numberOfWeeks * numberOfDaysInAWeek)
  const pastTimestampISO = pastTimestamp.toISOString()
  return pastTimestampISO
}
