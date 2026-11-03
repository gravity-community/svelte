import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

export type Country = {
  /** ISO 3166-1 alpha-2, lowercase. */
  readonly code: string;
  readonly name: string;
  readonly dial: string;
};

// Names come from the runtime's CLDR data; codes and dial codes from libphonenumber's metadata.
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const COUNTRIES: readonly Country[] = getCountries()
  .map((code) => ({
    code: code.toLowerCase(),
    name: regionNames.of(code) ?? code,
    dial: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export function countryOf(code: string): Country | undefined {
  const lower = code.toLowerCase();
  return COUNTRIES.find((c) => c.code === lower);
}

/** Splits a stored E.164 value into a country and an editable national number. */
export function splitPhone(
  phone: string,
): { country: string; national: string } | undefined {
  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed?.country) return undefined;
  return {
    country: parsed.country.toLowerCase(),
    national: parsed.formatNational(),
  };
}

/** Live-formats a national number as typed ("601123456" → "601 123 456"). */
export function formatPhone(country: string, text: string): string {
  const c = countryOf(country);
  if (!c) return text;
  return new AsYouType(c.code.toUpperCase() as CountryCode).input(text) || text;
}

/** Like composePhone, but an empty national number stays empty instead of becoming a bare dial code. */
export function composeOptionalPhone(
  country: string,
  national: string | undefined,
): string {
  const value = national ?? "";
  return value.trim() === "" ? "" : composePhone(country, value);
}

/** Composes a country and a national number back into E.164 for storage. */
export function composePhone(country: string, national: string): string {
  const parsed = parsePhoneNumberFromString(
    national,
    country.toUpperCase() as CountryCode,
  );
  if (parsed) return parsed.number;
  const dial = countryOf(country)?.dial ?? "";
  return `${dial}${national.replace(/\D/g, "")}`;
}
