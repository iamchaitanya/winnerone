// Shared date utility — single source of truth for IST date keys

/**
 * Returns a strict IST date key in YYYY-MM-DD format.
 * Works with both Date objects and timestamps.
 */
export const getISTDateKey = (date: Date | number): string => {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date));
};
