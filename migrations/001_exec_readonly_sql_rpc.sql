CREATE OR REPLACE FUNCTION exec_readonly_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF sql_query !~* '^\s*SELECT' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  IF sql_query ~* '\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b' THEN
    RAISE EXCEPTION 'Query contains disallowed keywords';
  END IF;

  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION exec_readonly_sql(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION exec_readonly_sql(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION exec_readonly_sql(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION exec_readonly_sql(TEXT) TO service_role;
