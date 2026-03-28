-- Enable UUID extension
;

--------------------------------------------------
-- LEADS TABLE
--------------------------------------------------
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  source TEXT,
  notes TEXT,

  last_contacted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);

--------------------------------------------------
-- WORKFLOW RUNS
--------------------------------------------------
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  input_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','success','failed')),
  steps_taken INT NOT NULL DEFAULT 0,
  result JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_user_id ON workflow_runs(user_id);

--------------------------------------------------
-- ACTIVITY LOG (CORE TABLE)
--------------------------------------------------
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,

  step_number INT NOT NULL CHECK (step_number > 0),
  tool_name TEXT,
  event_type TEXT,
  details JSONB,
  status TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Prevent duplicate step numbers in same run
CREATE UNIQUE INDEX idx_unique_step_per_run
ON activity_log(run_id, step_number);

CREATE INDEX idx_activity_run_id ON activity_log(run_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);

--------------------------------------------------
-- AGENT DEBUG LOGS
--------------------------------------------------
CREATE TABLE agent_debug_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,

  prompt TEXT,
  response TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_debug_run_id ON agent_debug_logs(run_id);

--------------------------------------------------
-- ENABLE RLS + POLICIES
--------------------------------------------------

-- LEADS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their leads"
ON leads
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- WORKFLOW RUNS
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their runs"
ON workflow_runs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ACTIVITY LOG
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their logs"
ON activity_log
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DEBUG LOGS
ALTER TABLE agent_debug_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their debug logs"
ON agent_debug_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
