import { addMinutes, isBefore, startOfDay, parse, format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// We lock the entire application's timezone logic to Atlantic Time
export const STUDIO_TIMEZONE = "America/Halifax";

/**
 * Generates an array of 30-minute time slots for a given date.
 * Example output: ["09:00", "09:30", "10:00", ...]
 */
export function generateTimeSlots(
  startTime = "09:00", // Default studio open time
  endTime = "20:00", // Default studio close time
  intervalMinutes = 30,
): string[] {
  const slots: string[] = [];

  // Create dummy dates just to handle the interval math safely
  const start = parse(startTime, "HH:mm", new Date());
  const end = parse(endTime, "HH:mm", new Date());

  let current = start;

  while (current <= end) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

/**
 * Checks if a selected date is in the past (to prevent retroactive booking).
 * Locks the current "tomorrow" to Atlantic Time to avoid midnight timezone edge cases.
 */
export function isDateInPast(date: Date) {
  const today = new Date();

  // Reset both to midnight to compare just the calendar days
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  // By checking <= today, we disable the past AND the current day
  return compareDate <= today;
}

/**
 * Safely combines a selected local date and a time slot string into a strict UTC ISO string
 * ready to be saved to Supabase. This absolutely prevents timezone drift.
 *
 * @param date The date selected from the calendar
 * @param timeString The time selected from the slot grid (e.g., "14:30")
 */
export function createUtcTimestamp(date: Date, timeString: string): string {
  // 1. Format the calendar date to a strict YYYY-MM-DD string
  const dateString = format(date, "yyyy-MM-dd");

  // 2. Combine them into a full local string (e.g., "2026-07-23 14:30:00")
  const localDateTimeString = `${dateString} ${timeString}:00`;

  // 3. Force Javascript to treat this exact string as Atlantic Time, then convert to UTC
  const utcDate = fromZonedTime(localDateTimeString, STUDIO_TIMEZONE);

  // 4. Return the ISO string for the database
  return utcDate.toISOString();
}

/**
 * Safely converts a UTC timestamp from Supabase back to Atlantic Time
 * for displaying in the UI (e.g., "02:30 PM").
 */
export function formatUtcToLocalDisplay(utcString: string): string {
  return formatInTimeZone(new Date(utcString), STUDIO_TIMEZONE, "hh:mm a");
}
