export const toUTCDate = (date: Date, withTime = false) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      withTime ? date.getUTCHours() : 0,
      withTime ? date.getUTCMinutes() : 0,
      withTime ? date.getUTCSeconds() : 0,
    ),
  );
};
