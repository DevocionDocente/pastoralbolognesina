export const UNUSED_SERIES_DELETE =
  "DELETE FROM activity_series s WHERE s.name = $1 AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.series_id = s.id)";
